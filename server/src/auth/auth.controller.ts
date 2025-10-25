import { Body, Controller, Post, Response as ResNest } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { AuthService } from "./auth.service";

@Controller('/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('/login')
    async login(@Body() loginDto: LoginUserDto) {

        try {

            const token = await this.authService.signIn(loginDto);
            return { access_token: token }

        } catch (error) {
            throw error
        }

    }

    @Post('/register')
    async register(@Body() createDto: CreateUserDto) {

        try {
            const register = await this.authService.signUp(createDto)
            return { message: register }

        } catch (error) {

            throw error

        }

    }



}