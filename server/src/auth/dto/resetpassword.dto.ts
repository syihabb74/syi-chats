import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ResetPasswordDto {

    @IsString({message : 'password is invalid format'})
    @IsNotEmpty({message : 'password is required'})
    @IsStrongPassword({
            minLength : 6,
            minLowercase : 1,
            minUppercase : 1,
            minNumbers : 1
    })
    newPassword : string

    @IsString({message : 'confirmation password is invalid format'})
    @IsNotEmpty({message : 'confirmation password is required'})
    @IsStrongPassword({
            minLength : 6,
            minLowercase : 1,
            minUppercase : 1,
            minNumbers : 1
    })
    confirmPassword : string

}


export class EmailResetDto {
    @IsEmail({}, {message : 'email is invalid format'})
    @IsNotEmpty({message : 'email is required'})
    email : string
}