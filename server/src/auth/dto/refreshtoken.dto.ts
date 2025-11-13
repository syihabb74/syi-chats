import { IsNotEmpty, IsString } from "class-validator";

export class RefreshTokenDto {
    @IsString({message : 'refresh token string is invalid'})
    @IsNotEmpty({message : 'refresh token is required'})
    refresh_token : string
}