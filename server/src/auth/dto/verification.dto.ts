import { IsNotEmpty, IsString } from "class-validator";

export class VerificationDto {

    @IsString({message : 'verification code invalid format'})
    @IsNotEmpty({message : 'verification code is required'})
    verification_code : string


}