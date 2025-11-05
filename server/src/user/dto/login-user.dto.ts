import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserDto {
 
    @IsNotEmpty({message : "email / username is required"})
    @IsString({message : "email / username must be string"})
    identifier: string

    @IsNotEmpty({message : "password is required"})
    @IsString()
    password : string


}