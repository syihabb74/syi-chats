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

        const saved = await this.authRepository.saveVerificationCode(verification)
        this.resendService.sendCode(verification.verification_code, verification.verification_identity) // if this fn use await it will be blocking process for a quite t
        return saved

    }

    private validationEmail (email : string) {
        if (!email.trim()) throw new BadRequestException('email is required');
            this.logger.debug("Email trimmed validation passed");
            const isEmail = this.regexService.emailChecker(email);
            if (!isEmail) throw new BadRequestException('email is invalid format');
            this.logger.debug("Email Format validation passed")
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

    async getNewCode(email: string): Promise<string> {

        try {
            this.validationEmail(email)
            const [verification, emailExist] = await Promise.all([
                this.authRepository.findCodeVerificationByEmail(email),
                this.userRepository.findOneByEmail(email)

            ]);
            if (!emailExist) throw new NotFoundException("please register first")
            if (!verification) throw new NotFoundException('Email not found please register first');
            this.logger.debug("email exist & verification validation passed")
            await this.authRepository.updateIsNewRequestVerification(verification)
            await this.createCodeSaveAndSending(email);
            this.logger.log("Get new code passed")
            return 'New verification code has been sending to your gmail please check your email!!'
        } catch (error) {
            this.logger.error("Get new code error cause", error?.stack)
            throw error
        }


    }

    async activateAccountEmail(email: string, verification_code: string): Promise<string> {
        try {
            const isValidVerificationCode = this.regexService.codeVerificationChecker(verification_code);
            if (!isValidVerificationCode) throw new BadRequestException('Invalid code');
            this.logger.debug("Valid verification validation code passed")
            this.validationEmail(email)
            const [consume, emailExist] = await Promise.all([
                this.authRepository.consumeVerificationCode(email, "email", verification_code),
                this.userRepository.findOneByEmail(email)

            ]);
            if (!emailExist) {
                throw new BadRequestException("please register first")
            };
            this.logger.debug("Db email checking validation passed")
            if (emailExist.is_verified) throw new BadRequestException("you already verified");
            if (!consume) {
                this.authRepository.incrementVerificationAttemps(emailExist.email).catch((err) => {
                    this.logger.warn(`increment failed : ${err}`)
                });
                throw new BadRequestException("Invalid or expired verification code");

            }
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
            this.createCodeSaveAndSending(result.email);
            return "Register successfully "
        } catch (error) {
            this.logger.error("Signup account failed cause", error?.stack)
            throw error
        }


    }

    async signIn(user: IUserLogin): Promise<Record<string, string>> {

        try {
            const signIn = await this.userService.signIn(user);
            await this.authRepository.saveRefreshToken({
                identifier : user.identifier,
                refresh_token : signIn.refresh_token,
                expires_at : new Date(Date.now() + ( REFRESH_TOKEN_TTL_MS ))
            })
            return signIn
        } catch (error) {
            this.logger.error("Signin account failed cause", error?.stack)
            throw error
        }

    }

    async getNewAccessToken (refresh_token : string) : Promise<Record<string, string>> {

        try {
             const { _id : id, identifier }: IPayload = await this.jwtService.verifyToken(refresh_token, process.env.JOSE_SECRET_REFRESH_KEY as string);
             const identifierFind = this.regexService.emailChecker(identifier) ? this.userRepository.findOneByEmail(identifier) : this.userRepository.findOneByUsername(identifier);
             const [tokenExist, identifierExist] = await Promise.all(
                [
                    this.authRepository.findRefreshToken(refresh_token, identifier),
                     identifierFind
                ]
             )
             if (!tokenExist || !identifierExist) throw new UnauthorizedException('refresh token invalid');
              const [access_token, ref_token] = await Promise.all(
                [
                    this.jwtService.signToken({ _id: id, identifier }, "15m", JWT_SECRETS.ACCESS),
                    this.jwtService.signToken({ _id: id, identifier }, "7d", JWT_SECRETS.REFRESH)
                ]
            )

            await this.authRepository.changeIsUsedRefreshToken(refresh_token)
            console.log(refresh_token, ref_token)
            await this.authRepository.saveRefreshToken({
                refresh_token : ref_token,
                identifier : identifier,
                expires_at : new Date(Date.now() + ( REFRESH_TOKEN_TTL_MS ))
            });
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
            this.validationEmail(email)
            const emailExist = await this.userRepository.findOneByEmail(email);
            if (!emailExist) throw new BadRequestException("Please register first");
            if (!emailExist.is_verified) throw new BadRequestException("Please verify your account first");
            const payload = await this.jwtService.signToken({
                _id: emailExist._id.toString(),
                identifier: emailExist.email
            }, '15m', JWT_SECRETS.RESET)
            const resetPassword: Omit<IResetPassword, '_id'> = {
                email: email,
                reset_token: payload,
                expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            }
            await this.authRepository.saveResetPasswordToken(resetPassword);
            this.resendService.sendPasswordReset(email, `http://localhost:3000/password/reset/verify-token?token=${payload}`)
            .catch((error) => {
                this.logger.error("Send password reset failed causes", error?.stack, ResendService.name)
            })
            return 'Verification link has been sending to your email please check your email account'
        } catch (error) {
            this.logger.warn("Forgot password failed causes", error?.stack)
            throw error
        }

    }

    async changePassword(newPassword: string, newConfirmationPassword: string, reset_token: string): Promise<string> {

        try {
            const { _, identifier: email }: IPayload = await this.jwtService.verifyToken(reset_token, JWT_SECRETS.RESET);
            const [userExist, tokenExist] = await Promise.all([
                await this.userRepository.findOneByEmail(email),
                await this.authRepository.findTokenResetPassword(reset_token, email)
            ]);
            if (!userExist) throw new UnauthorizedException('Invalid token');
            if (!tokenExist) throw new UnauthorizedException('Invalid token');
            if (newPassword !== newConfirmationPassword) {
                if (tokenExist.attempts > 2) {
                    await this.authRepository.deleteResetPassword(email);
                    throw new BadRequestException("Limit exceed please request token again");
                }
                await this.authRepository.incrementResetPasswordAttempts(tokenExist)
                throw new BadRequestException("Confirmation password not match");
            };
            if (tokenExist.attempts >= 3) {
                await this.authRepository.deleteResetPassword(email);
                throw new BadRequestException("Limit exceed please request token again");
            };
            const hashedPassword = this.bcryptService.hashPassword(newPassword);
            await this.userRepository.changePassword(email, hashedPassword);
            return 'Password has been successfully changed'
        } catch (error) {
            this.logger.error("Change password failed cause", error?.stack)
            throw error
        }

    }

}