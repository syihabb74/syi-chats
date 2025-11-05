import {
    Body,
    Controller,
    HttpCode,
    Post, 
    UseGuards
} from "@nestjs/common";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginUserDto } from "../user/dto/login-user.dto";
import { AuthService } from "./auth.service";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

@UseGuards(ThrottlerGuard)
@Throttle({auth : {limit : 10, ttl: 60000}})
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginUserDto) {

        try {

            const token = await this.authService.signIn(loginDto);
            this.authService.refresherTokenSave(token.refresh_token);
            return token

        } catch (error) {

            throw error
            
        }

    }

    @Post('register')
    @HttpCode(201)
    async register(@Body() createDto: CreateUserDto) : Promise<Record<string, any>> {
        
        try {
            await this.authService.signUp(createDto)
            return { message: "Register Successfully" }

        } catch (error) {

            throw error

        }

    }

    @Post('verify')
    @HttpCode(200)
    async verifyAccount () {
        
    }





}