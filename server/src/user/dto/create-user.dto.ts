import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty({message : "name is required"})
    @MinLength(3)
    name : string;
    
    @IsNotEmpty({message : "username is required"})
    @MinLength(3)
    username : string;

    @IsNotEmpty({message : "email is required"})
    @MinLength(3)
    @IsEmail({}, {message : "email invalid format"})
    email : string

    @IsNotEmpty({message : "password is required"})
    @IsString()
    @IsStrongPassword({
        minLength : 6,
        minLowercase : 1,
        minUppercase : 1,
        minNumbers : 1
    })
    password : string

}