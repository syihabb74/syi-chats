import { BadRequestException, Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import { UserService } from "src/user/user.service";
import { AuthRepository } from "./auth.repository";
import IVerification from "./interfaces/verification.interface";
import generateRandomSixDigitCode from "src/common/utils/generateRandomCode";
import { ResendService } from "src/common/resend/resend.service";
import { RegexService } from "src/common/helpers/regex.format-email.service";
import { UserRepository } from "src/user/user.repository";



@Injectable()
export class AuthService {

    constructor( 
        private readonly userService : UserService,
        private readonly authRepository : AuthRepository,
        private readonly resendService : ResendService,
        private readonly regexService : RegexService,
        private readonly userRepository : UserRepository
    ) 
        { }

    async signUp(user: IUserRegister) {


        const code = generateRandomSixDigitCode();
        const result = await this.userService.signUp(user);
        this.saveVerificationCode({
            verification_identity : result.email,
            verification_code : `${code}`,
            expires_at : new Date(Date.now() + 15 * 60 * 1000)
        });
        return result

        
    }

    async signIn(user: IUserLogin): Promise<{ access_token: string, refresh_token: string }> {

       return this.userService.signIn(user);

    }


    async refresherTokenSave(refresh_token: string) {



    }

    private async saveVerificationCode (verification : IVerification) : Promise<
        [Awaited<ReturnType<AuthRepository['saveVerificationCode']>>, Awaited<ReturnType<ResendService['sendCode']>>]
    > {

        return Promise.all([
             this.authRepository.saveVerificationCode(verification),
             this.resendService.sendCode(verification.verification_code, verification.verification_identity)
        ])

    }

    async activateAccountEmail (email : string,verification_code : string): Promise<string> {
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
            this.authRepository.incrementAttemps(verification);
            throw new BadRequestException("Incorrect verification code");
        }
        this.userService.activatingAccount(email);
        this.authRepository.changeIsUsedStatus(verification);
        return 'Your account is activated now'

    }


}