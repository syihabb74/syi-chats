import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { AuthRepository } from "./auth.repository";
import { ResendService } from "src/common/resend/resend.service";
import { RegexService } from "src/common/helpers/regex.service";
import { UserRepository } from "src/user/user.repository";
import { JwtService } from "src/common/helpers/jwt.service";
import { BcryptService } from "src/common/helpers/bcrypt.service";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import IVerification from "./interfaces/verification.interface";
import generateRandomSixDigitCode from "src/common/utils/generateRandomCode";
import IResetPassword from "./interfaces/reset.password.interfaces";
import IPayload from "src/common/interfaces/payload.interfaces";
import { 
    JWT_SECRETS,
    VERIFICATION_CODE_TTL_MS,
    REFRESH_TOKEN_TTL_MS
  } from "src/common/constants/jwt.constants";
import IRefresher from "./interfaces/refresher.interfaces";
import IChangePassword from "./interfaces/change-password.interface";
import IUser from "src/user/interfaces/user.interface";

@Injectable()
export class AuthService {

    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly userService: UserService,
        private readonly authRepository: AuthRepository,
        private readonly resendService: ResendService,
        private readonly regexService: RegexService,
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly bcryptService: BcryptService
    ) { }

    private async saveVerificationCode(verification: Omit<IVerification, '_id'| 'attempts'>): Promise<void> {

        await this.authRepository.saveVerificationCode(verification)
        this.resendService.sendCode(verification.verification_code, verification.verification_identity)
        .catch((error) => {
            this.logger.error("Send password reset failed causes", error?.stack, ResendService.name)
        })

    }

     private async saveRefreshTokenToDb (refreshToken : Pick<IRefresher, 'identifier' | 'refresh_token'>) {
        await this.authRepository.saveRefreshToken({ 
                identifier : refreshToken.identifier,
                refresh_token : refreshToken.refresh_token,
                expires_at : new Date(Date.now() + ( REFRESH_TOKEN_TTL_MS ))
            })
    }

    private async saveResetPasswordToDb(email: string, reset_token : string) : Promise<void> {
        const resetPassword: Omit<IResetPassword, '_id' | 'attempt'> = {
                email: email,
                reset_token: reset_token,
                expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            }
            await this.authRepository.saveResetPasswordToken(resetPassword);
    }

    private async validateUserByEmail (email : string, message? : string) : Promise<Omit<IUser, 'createdAt' | 'updatedAt'>> {
            if (!email.trim()) throw new BadRequestException('email is required');
                this.logger.debug("Email trimmed validation passed");
                const isEmail = this.regexService.emailChecker(email);
                if (!isEmail) {throw new BadRequestException('email is invalid format')};
                this.logger.debug("Email Format validation passed")
                const emailExist = await this.userRepository.findOneByEmail(email)
                if (!emailExist) throw new NotFoundException(message ? message : "email not found please register first")
                this.logger.log("validation user passed")
                return emailExist
    }

    private async validateResetToken (token : string, email : string) : Promise<Record<string, any>> {
        const [userExist, tokenExist] = await Promise.all([
                this.userRepository.findOneByEmail(email),
                this.authRepository.findTokenResetPassword(token, email)
            ]);
            if (!userExist || !tokenExist) throw new UnauthorizedException('Invalid token');
            return {userExist, tokenExist}
    }

     private async validatePasswordMatch (password : string , confirmationPassword : string,tokenResetPassword : IResetPassword, email : string) {
        if (password !== confirmationPassword) {
             await this.handlePasswordMismatch(tokenResetPassword, email)
             throw new BadRequestException("Confirmation password not match");
        }
    }

    private validateVerificationCode(verification_code: string) : void {
            const isValidVerificationCode = this.regexService.codeVerificationChecker(verification_code);
            if (!isValidVerificationCode) throw new BadRequestException('Invalid code');
            this.logger.debug("Valid verification validation code passed")
    }

    private async validateActivateAccount (email : string, verificationCode : string) {
        const [consume, emailExist] = await Promise.all([
                this.authRepository.consumeVerificationCode(email, "email", verificationCode),
                this.validateUserByEmail(email)
            ]);
            if (emailExist.is_verified) throw new BadRequestException("you already verified");
            if (!consume) {
                this.authRepository.incrementVerificationAttemps(emailExist.email).catch((err) => {
                    this.logger.warn(`increment failed : ${err}`)
                });
                throw new BadRequestException("invalid or expired verification code");

            }
    }


    private async createCodeSaveAndSending(email: string): Promise<void> {

        try {
            const code = generateRandomSixDigitCode();
            await this.saveVerificationCode({
                verification_identity: email,
                verification_code: `${code}`,
                expires_at: new Date(Date.now() + VERIFICATION_CODE_TTL_MS)
            });
            this.logger.log("Code verification saved passed")
        } catch (error) {
            this.logger.error("Code verification saved failed causes", error?.stack)
            throw error
        }

    }

    private async checkAttemptLimit (tokenResetPassword : IResetPassword, email : string ) : Promise<void> {
        if (tokenResetPassword.attempt >= 3) {
                await this.authRepository.deleteResetPassword(email);
                throw new BadRequestException("Limit exceed please request token again");
            };
    } 

    private async handlePasswordMismatch(tokenResetPassword : IResetPassword, email : string) : Promise<void> {
                await this.authRepository.incrementResetPasswordAttempts(tokenResetPassword)
                if (tokenResetPassword.attempt + 1 >= 3) {
                    await this.authRepository.deleteResetPassword(email);
                    throw new BadRequestException("Limit exceeded, please request token again");
                }
    }

    private async createAccessAndRefreshToken (id : Pick<IPayload, '_id'> , identifier : string): Promise<string[]> {
        const [access_token, ref_token] = await Promise.all(
                [
                    this.jwtService.signToken({ _id: id._id, identifier }, "15m", JWT_SECRETS.ACCESS),
                    this.jwtService.signToken({ _id: id._id, identifier }, "7d", JWT_SECRETS.REFRESH)
                ]
            )
        return [access_token, ref_token]
    }

    async getNewCode(email: string): Promise<string> {

        try {
            const user = await this.validateUserByEmail(email)
            if (user.is_verified) throw new BadRequestException("You are already verified");
            const verification = await this.authRepository.findCodeVerificationByEmail(email);
            if (verification) {
                await this.authRepository.updateIsNewRequestVerification(verification);
            }
            await this.createCodeSaveAndSending(email);
            this.logger.log("Get new code passed")
            return 'New verification code has been sending to your gmail please check your email!!'
        } catch (error) {
            this.logger.error("Get new code error cause", error?.stack)
            throw error
        }


    }

    async activateAccountEmail(email: string, verificationCode: string): Promise<string> {
        try {
            this.validateVerificationCode(verificationCode)
            await this.validateActivateAccount(email, verificationCode)
            await this.userService.activatingAccount(email);
            this.authRepository.deleteVerification(email, 'email').catch((err) => {
                this.logger.warn(`delete verification failed : ${err}`)
            })
            this.logger.log("Email activated passed")
            return 'Your account is activated now';
        } catch (error) {
            this.logger.error("Activation account failed", error?.stack)
            throw error
        }

    }

    async signUp(user: IUserRegister): Promise<string> {

        try {
            const result = await this.userService.signUp(user);
            await this.createCodeSaveAndSending(result.email);
            return "Register successfully "
        } catch (error) {
            this.logger.error("Signup account failed cause", error?.stack)
            throw error
        }


    }


    async signIn(user: IUserLogin): Promise<Record<string, string>> {

        try {
            const signIn = await this.userService.signIn(user);
            await this.saveRefreshTokenToDb({identifier : user.identifier, refresh_token : signIn.refresh_token})
            return signIn
        } catch (error) {
            this.logger.error("Signin account failed cause", error?.stack)
            throw error
        }

    }

    async getNewAccessToken (refresh_token : string) : Promise<Record<string, string>> {

        try {
            const { _id : id, identifier }: IPayload = await this.jwtService.verifyToken(refresh_token, JWT_SECRETS.REFRESH);
            const tokenExist = await this.authRepository.findRefreshToken(refresh_token, identifier)
            if (!tokenExist) throw new UnauthorizedException('Invalid or expired refresh token');
            const [access_token, ref_token] = await this.createAccessAndRefreshToken({_id : id}, identifier)
            await Promise.all([
                this.authRepository.changeIsUsedRefreshToken(refresh_token),
                this.saveRefreshTokenToDb({identifier, refresh_token : ref_token})
            ]);
            this.logger.log("New access token generated")
            return {
                access_token,
                refresh_token : ref_token
            }

        } catch (error) {
            this.logger.error("Get new access token failed cause", error?.stack)
            throw error
        }
    }

    async forgotPassword(email: string): Promise<string> {

        try {
            const emailExist = await this.validateUserByEmail(email)
            const reset_token = await this.jwtService.signToken({_id: emailExist._id.toString(),identifier: emailExist.email}, '15m', JWT_SECRETS.RESET)
            await this.saveResetPasswordToDb(email,reset_token)
            this.resendService.sendPasswordReset(email, `http://localhost:3000/password/reset/verify-token?token=${reset_token}`)
            .catch((error) => {
                this.logger.error("Send password reset failed causes", error?.stack, ResendService.name)
            })
            return 'Verification link has been sending to your email please check your email account'
        } catch (error) {
            this.logger.warn("Forgot password failed causes", error?.stack)
            throw error
        }

    }

    async changePassword(changePassword : IChangePassword): Promise<string> {

        try {
            const { identifier: email }: IPayload = await this.jwtService.verifyToken(changePassword.reset_token, JWT_SECRETS.RESET);
            const {tokenExist} = await this.validateResetToken(changePassword.reset_token, email)
            await this.checkAttemptLimit(tokenExist, email)
            await this.validatePasswordMatch(changePassword.newPassword, changePassword.confirmPassword, tokenExist, email)
            const hashedPassword = this.bcryptService.hashPassword(changePassword.newPassword);
            await Promise.all([
            this.userRepository.changePassword(email, hashedPassword),
            this.authRepository.deleteResetPassword(email)
            ]);
            this.logger.log("Change password passed")
            return 'Password has been successfully changed'
        } catch (error) {
            this.logger.error("Change password failed cause", error?.stack)
            throw error
        }

    }

}