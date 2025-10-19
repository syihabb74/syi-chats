import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    username : string;

    @IsString()
    @MinLength(3)
    @IsEmail({}, {message : 'Invalid email format'})
    email : string

    @IsString()
    @IsStrongPassword({
        minLength : 6,
        minLowercase : 1,
        minUppercase : 1,
        minNumbers : 1
    }, {
        message : 'Password -password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number.'
    })
    password : string


}