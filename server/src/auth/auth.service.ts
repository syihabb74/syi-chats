import { BadRequestException, Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import { UserService } from "src/user/user.service";
import { AuthRepository } from "./auth.repository";
import IVerification from "./interfaces/verification.interface";
import generateRandomSixDigitCode from "src/common/utils/generateRandomCode";
import { ResendService } from "src/common/resend/resend.service";



@Injectable()
export class AuthService {

    constructor( 
        private readonly userService : UserService,
        private readonly authRepository : AuthRepository,
        private readonly resendService : ResendService
    ) 
        { }

    async signUp(user: IUserRegister) {

        const code = generateRandomSixDigitCode();
        const result = await this.userService.signUp(user);
        await this.saveVerificationCode({
            verification_identity : result.email,
            verification_code : `${code}`,
            expires_at : new Date(Date.now() + 60 * 1000)
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

    async activateAccount (email : string,verification_code : string): Promise<string> {

        const verification = await this.authRepository.findCodeVerificationByEmail(email);
        if (!verification) throw new BadRequestException("Invalid code");
        if (verification.verification_code !== verification_code) throw new BadRequestException("Incorrect verification code");
        this.userService.activatingAccount(email);
        this.authRepository.changeIsUsedStatus(email);
        return 'Your account is activated now'

    }



}