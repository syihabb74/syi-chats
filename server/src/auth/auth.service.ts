import { 
     BadRequestException,
     Injectable,
     NotFoundException
} from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import { UserService } from "src/user/user.service";
import { AuthRepository } from "./auth.repository";
import IVerification from "./interfaces/verification.interface";
import generateRandomSixDigitCode from "src/common/utils/generateRandomCode";
import { ResendService } from "src/common/resend/resend.service";
import { RegexService } from "src/common/helpers/regex.service";
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

    private async saveVerificationCode (verification : IVerification) : Promise<
        [Awaited<ReturnType<AuthRepository['saveVerificationCode']>>, Awaited<ReturnType<ResendService['sendCode']>>]
    > {

        return Promise.all([
             this.authRepository.saveVerificationCode(verification),
             this.resendService.sendCode(verification.verification_code, verification.verification_identity) // memblocking agak cukup lumayan lama
        ])

    }

    private async createCodeSaveAndSending (email : string): Promise<void> {
        
        const code = generateRandomSixDigitCode();
        await this.saveVerificationCode({
            verification_identity : email,
            verification_code : `${code}`,
            expires_at : new Date(Date.now() + 15 * 60 * 1000)
        });
        
    }
    
    async getNewCode (email : string) : Promise<string> {
        
        if (!email.trim()) throw new BadRequestException('email is required')
        const isEmail = this.regexService.emailChecker(email);
        if (!isEmail) throw new BadRequestException('email is invalid format');
           const [verification, emailExist] = await Promise.all([
            this.authRepository.findCodeVerificationByEmail(email),
            this.userRepository.findOneByEmail(email)
            
        ]);
        if (!verification) throw new NotFoundException('Email not found please register first');
        if (!emailExist) throw new NotFoundException("please register first")
        await this.authRepository.updateIsNewRequest(verification)
        await this.createCodeSaveAndSending(email); 
        return 'New verification code has been sending to your gmail please check your email!!'

    }

     async signUp(user: IUserRegister) {


        const result = await this.userService.signUp(user);
        this.createCodeSaveAndSending(result.email);
        return result

        
    }

    async signIn(user: IUserLogin): Promise<{ access_token: string, refresh_token: string }> {

       return this.userService.signIn(user);

    }


    async refresherTokenSave(refresh_token: string) {



    }

    

    async activateAccountEmail (email : string,verification_code : string): Promise<string> {
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
            await this.authRepository.incrementAttemps(verification);
            throw new BadRequestException("Incorrect verification code");
        }
        await this.userService.activatingAccount(email);
        this.authRepository.deleteVerification(email, 'email')
        return 'Your account is activated now';

    }


}