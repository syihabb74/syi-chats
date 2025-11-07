import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    Post, 
    Query, 
    UseGuards
} from "@nestjs/common";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginUserDto } from "../user/dto/login-user.dto";
import { AuthService } from "./auth.service";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { VerificationDto } from "./dto/verification.dto";

@UseGuards(ThrottlerGuard)
@Throttle({auth : {limit : 100, ttl: 60000}})
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginUserDto): Promise<Record<string, any>> {

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

    @Get('verify')
    @HttpCode(200) 
    async getNewCode (
        @Query('email') email : string,
        @Query('phone') phoneNumber : string
    ) {
        
        if (email === undefined && phoneNumber === undefined) throw new BadRequestException('Please choose verify method for email or phone number to request code');
        if (email && phoneNumber) throw new BadRequestException('lease choose verify method for email or phone number to request code');

        try {
            
        } catch (error) {
            
        }
        
    }

    @Post('verify')
    @HttpCode(200)
    async verifyAccount (
        @Body() verificationDto : VerificationDto,
        @Query('email') email : string,
        @Query('phone') phoneNumber : string
    ) : Promise<string> {

        if (email === undefined && phoneNumber === undefined) throw new BadRequestException('Please choose verify method email or phone number');
        if (email && phoneNumber) throw new BadRequestException('Please choose one verify method. email or phone number');
       
        
        try {
            const {verification_code} = verificationDto;
            const verification = email ? await this.authService.activateAccountEmail(email, verification_code) : ''
            return verification
        } catch (error) {
            throw error
        }
    }





}