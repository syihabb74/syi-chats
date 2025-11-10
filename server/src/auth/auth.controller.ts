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
import { 
    Throttle,
    ThrottlerGuard
} from "@nestjs/throttler";
import { 
    EmailResetDto,
    ResetPasswordDto 
} from "./dto/resetpassword.dto";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { LoginUserDto } from "../user/dto/login-user.dto";
import { AuthService } from "./auth.service";
import { VerificationDto } from "./dto/verification.dto";

@UseGuards(ThrottlerGuard)
@Throttle({ auth: { limit: 100, ttl: 60000 } })
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginUserDto): Promise<Record<string, string>> {

        try {

            const token = await this.authService.signIn(loginDto);
            await this.authService.refresherTokenSave(token.refresh_token);
            return token

        } catch (error) {

            throw error

        }

    }

    @Post('register')
    @HttpCode(201)
    async register(@Body() createDto: CreateUserDto): Promise<Record<string, string>> {

        try {
            const message = await this.authService.signUp(createDto)
            return { message }

        } catch (error) {

            throw error

        }

    }

    @Get('verify')
    @HttpCode(200)
    async getNewCode(
        @Query('email') email: string,
        @Query('phone') phoneNumber: string
    ) : Promise<Record<string, any>> {

        if (email === undefined && phoneNumber === undefined) throw new BadRequestException('Please choose verify method for email or phone number to request code');
        if (email && phoneNumber) throw new BadRequestException('lease choose verify method for email or phone number to request code');

        try {

            const message: string = await this.authService.getNewCode(email);
            return { message }

        } catch (error) {

            throw error

        }

    }

    @Post('verify')
    @HttpCode(200)
    async verifyAccount(
        @Body() verificationDto: VerificationDto,
        @Query('email') email: string,
        @Query('phone') phoneNumber: string
    ): Promise<Record<string, string>> {

        if (email === undefined && phoneNumber === undefined) throw new BadRequestException('Please choose verify method email or phone number');
        if (email && phoneNumber) throw new BadRequestException('Please choose one verify method. email or phone number');

        try {
            const { verification_code } = verificationDto;
            const message = email ? await this.authService.activateAccountEmail(email, verification_code) : ''
            return { message }
        } catch (error) {
            throw error
        }
    }

    @Post('password/reset')
    @HttpCode(200)
    async resetPassword (
        @Body() emailResetDto : EmailResetDto,
    ) : Promise<Record<string, any>> {

        try {
            

            const {email} = emailResetDto
            const message = await this.authService.forgotPassword(email);
            
            return {message : ''}

        } catch (error) {
            
            throw error

        }

    }

    @Post('password/reset/verify-token')
    @HttpCode(200)
    async changePassword (
        @Body() emailResetDto : EmailResetDto,
    ) : Promise<Record<string, any>> {

        try {
            

            const {email} = emailResetDto
            const message = await this.authService.forgotPassword(email);
            
            return {message : ''}

        } catch (error) {
            
            throw error

        }

    }





}