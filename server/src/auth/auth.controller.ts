import {
    Body,
    Controller,
    HttpCode,
    Post 
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { AuthService } from "./auth.service";
import { Throttle } from "@nestjs/throttler";

@Controller('/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Throttle({default : {limit : 3, ttl: 60000}})
    @Post('/login')
    async login(@Body() loginDto: LoginUserDto) {

        try {

            const token = await this.authService.signIn(loginDto);
            return { access_token: token }

        } catch (error) {
            throw error
        }

    }

    @Throttle({default : {limit : 3, ttl: 60000}})
    @Post('/register')
    @HttpCode(201)
    async register(@Body() createDto: CreateUserDto) {

        try {
            const register = await this.authService.signUp(createDto)
            return { message: register }

        } catch (error) {

            throw error

        }

    }



}