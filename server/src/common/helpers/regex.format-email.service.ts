import { Injectable } from "@nestjs/common";

@Injectable()
export class RegexService {

    emailChecker (email : string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

}