import {
    BadRequestException,
    Injectable,
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



@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly authRepository: AuthRepository,
        private readonly resendService: ResendService,
        private readonly regexService: RegexService,
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly bcryptService: BcryptService
    ) { }

    private async saveVerificationCode(verification: IVerification): Promise<
        [Awaited<ReturnType<AuthRepository['saveVerificationCode']>>, Awaited<ReturnType<ResendService['sendCode']>>]
    > {

        return Promise.all([
            this.authRepository.saveVerificationCode(verification),
            this.resendService.sendCode(verification.verification_code, verification.verification_identity) // memblocking agak cukup lumayan lama
        ])

    }

    private async createCodeSaveAndSending(email: string): Promise<void> {

        try {
            const code = generateRandomSixDigitCode();
            await this.saveVerificationCode({
                verification_identity: email,
                verification_code: `${code}`,
                expires_at: new Date(Date.now() + 15 * 60 * 1000)
            });
        } catch (error) {
            throw error
        }


    }

    async getNewCode(email: string): Promise<string> {

        try {
            if (!email.trim()) throw new BadRequestException('email is required')
            const isEmail = this.regexService.emailChecker(email);
            if (!isEmail) throw new BadRequestException('email is invalid format');
            const [verification, emailExist] = await Promise.all([
                this.authRepository.findCodeVerificationByEmail(email),
                this.userRepository.findOneByEmail(email)

            ]);
            if (!verification) throw new NotFoundException('Email not found please register first');
            if (!emailExist) throw new NotFoundException("please register first")
            await this.authRepository.updateIsNewRequestVerification(verification)
            await this.createCodeSaveAndSending(email);
            return 'New verification code has been sending to your gmail please check your email!!'
        } catch (error) {
            throw error
        }


    }

    async activateAccountEmail(email: string, verification_code: string): Promise<string> {
        try {
            const isValidVerificationCode = this.regexService.codeVerificationChecker(verification_code);
            if (!isValidVerificationCode) throw new BadRequestException('Invalid code');
            if (!email.trim()) throw new BadRequestException('email is required')
            const isEmail = this.regexService.emailChecker(email);
            if (!isEmail) throw new BadRequestException('email is invalid format');
            const [verification, emailExist] = await Promise.all([
                this.authRepository.findCodeVerificationByEmail(email),
                this.userRepository.findOneByEmail(email)

            ]);
            if (!emailExist) throw new BadRequestException("please register first");
            if (emailExist.is_verified) throw new BadRequestException("you already verified");
            if (!verification) throw new BadRequestException("Invalid code");
            if (verification.attempts >= 5) throw new BadRequestException("Limit exceed please request code again");
            if (verification.verification_code !== verification_code) {
                await this.authRepository.incrementVerificationAttemps(verification);
                throw new BadRequestException("Incorrect verification code");
            }
            await this.userService.activatingAccount(email);
            await this.authRepository.deleteVerification(email, 'email')
            return 'Your account is activated now';
        } catch (error) {
            throw error
        }

    }

    async signUp(user: IUserRegister): Promise<string> {

        try {
            const result = await this.userService.signUp(user);
            this.createCodeSaveAndSending(result.email);
            return "Register successfully "
        } catch (error) {
            throw error
        }


    }

    async signIn(user: IUserLogin): Promise<Record<string, string>> {

        try {
            return await this.userService.signIn(user);
        } catch (error) {
            throw error
        }

    }

    async forgotPassword(email: string): Promise<string> {

        try {
            const emailExist = await this.userRepository.findOneByEmail(email);
            if (!emailExist) throw new BadRequestException("Please register first");
            if (!emailExist.is_verified) throw new BadRequestException("Please verify your account first");
            const payload = await this.jwtService.signToken({
                _id: emailExist._id.toString(),
                identifier: emailExist.email
            }, '15m', process.env.JOSE_SECRET_RESET_PASSWORD_KEY as string)
            const resetPassword: Omit<IResetPassword, '_id'> = {
                email: email,
                reset_token: payload,
                expires_at: new Date(Date.now() + 15 * 60 * 1000),
            }
            await this.authRepository.saveResetPasswordToken(resetPassword);
            await this.resendService.sendPasswordReset(email, `http://localhost:3000/password/reset/verify-token?token=${payload}`)
            return 'Verification link has been sending to your email please check your email account'
        } catch (error) {
            throw error
        }

    }

    async changePassword(newPassword: string, newConfirmationPassword: string, reset_token: string): Promise<string> {

        try {
            const { _, identifier: email }: IPayload = await this.jwtService.verifyToken(reset_token, process.env.JOSE_SECRET_RESET_PASSWORD_KEY as string);
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
            throw error
        }

    }


    async refresherTokenSave(refresh_token: string) {



    }


}