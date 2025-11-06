import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export enum VerificationType {
    EMAIL = 'email',
    PHONE = 'phone'
}

export class VerificationDto {

    @IsString({message : 'verification code invalid format'})
    @IsNotEmpty({message : 'verification code is required'})
    verification_code : string

    @IsEnum({message : 'type must be email or phone'})
    @IsNotEmpty({message : 'type is required'})
    type : VerificationType = VerificationType.EMAIL

}