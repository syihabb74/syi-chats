import { Injectable } from "@nestjs/common";

@Injectable()
export class RegexService {

    emailChecker (email : string) : boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    codeVerificationChecker (verificationCode : string) : boolean {
        const verificationRegex = /^\d{6}$/;
        return verificationRegex.test(verificationCode)
    }

}