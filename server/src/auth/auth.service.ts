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
        this.authRepository.register(user)
        return 'Register Successfully';

    }

    async signIn(user: IUserLogin) {

        const isEmailLogin = this.regexService.emailChecker(user.identifier);
        const userLogin = isEmailLogin ? await this.authRepository.findOneByEmail(user.identifier) : await this.authRepository.findOneByUsername(user.identifier);
        console.log(userLogin)
        if (!userLogin) throw new BadRequestException('Please register first');
        const validPassword = this.bcryptService.comparePassword(user.password, userLogin.password);
        if (!validPassword) throw new BadRequestException('Invalid email / password');
        const access_token = this.jwtService.signToken({ _id: userLogin._id.toString(), identifier: isEmailLogin ? userLogin.email : userLogin.username });
        const refresh_token = this.jwtService.signToken({ _id: userLogin._id.toString(), identifier: isEmailLogin ? userLogin.email : userLogin.username });
        return {
            access_token,
            refresh_token
        }

    }

}