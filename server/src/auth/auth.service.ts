import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import { AuthRepository } from "./auth.repository";
import { BcryptService } from "src/common/helpers/bcrypt.service";
import { RegexService } from "src/common/helpers/regex.format-email.service";
import { JwtService } from "src/common/helpers/jwt.service";



@Injectable()
export class AuthService {

    constructor(private readonly authRepository: AuthRepository, private readonly bcryptService: BcryptService, private readonly regexService: RegexService, private readonly jwtService: JwtService) { }

    async signUp(user: IUserRegister) {

        const [registeredEmail, registeredUname] = await Promise.all(
            [
                this.authRepository.findOneByEmail(user.email),
                this.authRepository.findOneByUsername(user.username)
            ]
        )
        if (registeredEmail) throw new ConflictException('Email already registered');
        if (registeredUname) throw new ConflictException('Username already registered');
        user.password = this.bcryptService.hashPassword(user.password);
        return this.authRepository.register(user)
        
    }

    async signIn(user: IUserLogin): Promise<{ access_token: string, refresh_token: string }> {

        const isEmailLogin = this.regexService.emailChecker(user.identifier);
        const userLogin = isEmailLogin ? await this.authRepository.findOneByEmail(user.identifier) : await this.authRepository.findOneByUsername(user.identifier);
        if (!userLogin) throw new BadRequestException('Please register first');
        const validPassword = this.bcryptService.comparePassword(user.password, userLogin.password);
        if (!validPassword) throw new BadRequestException('Invalid email / password');
        const identifier = isEmailLogin ? userLogin.email : userLogin.username;
        const [access_token, refresh_token] = await Promise.all(
            [
                this.jwtService.signToken({ _id: userLogin._id.toString(), identifier }, "15m"),
                this.jwtService.signToken({ _id: userLogin._id.toString(), identifier }, "7d")
            ]
        )
        return {
            access_token,
            refresh_token
        }

    }


    async refresherTokenSave(refresh_token: string) {



    }

}