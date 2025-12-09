import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable
} from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import IUser from "src/user/interfaces/user.interface";
import { BcryptService } from "src/common/helpers/bcrypt.service";
import { RegexService } from "src/common/helpers/regex.service";
import { JwtService } from "src/common/helpers/jwt.service";
import { UserRepository } from "./user.repository";


@Injectable()
export class UserService {

    constructor(
        private readonly userRepository: UserRepository,
        private readonly bcryptService: BcryptService,
        private readonly regexService: RegexService,
        private readonly jwtService: JwtService
    ) { }

    private async validateUserSignUp(email: string, username: string): Promise<void> {
        const [registeredEmail, registeredUname] = await Promise.all(
            [
                this.userRepository.findOneByEmail(email),
                this.userRepository.findOneByUsername(username)
            ]
        )
        if (registeredEmail || registeredUname) throw new ConflictException('Email already registered or Username already registered');
    }

     private async findUserInDB (identifier : string) : Promise<Omit<IUser, 'createdAt' | 'updatedAt'> | null> {
        const isEmailLogin = this.regexService.emailChecker(identifier);
        const userLogin: Omit<IUser, 'createdAt' | 'updatedAt'> | null = isEmailLogin ?
            await this.userRepository.findOneByEmail(identifier) :
            await this.userRepository.findOneByUsername(identifier);
        return userLogin
    }

    private async validateUserLogin (user : IUserLogin) : Promise<Omit<IUser, 'createdAt' | 'updatedAt'>> {
        const userLogin = await this.findUserInDB(user.identifier);
        if (!userLogin) throw new BadRequestException('Invalid username/email or password');
        const validPassword = this.bcryptService.comparePassword(user.password, userLogin.password);
        if (!validPassword) throw new BadRequestException('Invalid email / password');
        if (!userLogin.is_verified) throw new ForbiddenException("Please verify your account");
        return userLogin
    }

    async signUp(user: IUserRegister) {

        await this.validateUserSignUp(user.email, user.username)
        user.password = this.bcryptService.hashPassword(user.password);
        return this.userRepository.register(user)

    }

    async signIn(user: IUserLogin): Promise<{ access_token: string, refresh_token: string }> {

        const isEmailLogin = this.regexService.emailChecker(user.identifier);
        const userLogin: Omit<IUser, 'createdAt' | 'updatedAt'> = await this.validateUserLogin(user)
        const identifier = isEmailLogin ? userLogin.email : userLogin.username;
        const [access_token, refresh_token] = await this.jwtService.createAccessAndRefreshToken(userLogin, identifier)
        return {
            access_token,
            refresh_token
        }

    }

    async changePassword(email: string, hashedPassword: string): Promise<string> {

        try {
            await this.userRepository.changePassword(email, hashedPassword);
            return 'Password successfully changed'
        } catch (error) {
            throw error
        }

    }

    async activatingAccount(email: string): Promise<void> {

        await this.userRepository.activateAccount(email)

    }


}
