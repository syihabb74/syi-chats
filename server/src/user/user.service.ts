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
    ) {}

     async signUp(user: IUserRegister) {
    
            const [registeredEmail, registeredUname] = await Promise.all(
                [
                    this.userRepository.findOneByEmail(user.email),
                    this.userRepository.findOneByUsername(user.username)
                ]
            )
            if (registeredEmail) throw new ConflictException('Email already registered');
            if (registeredUname) throw new ConflictException('Username already registered');
            user.password = this.bcryptService.hashPassword(user.password);
            return this.userRepository.register(user)
            
        }
    
        async signIn(user: IUserLogin): Promise<{ access_token: string, refresh_token: string }> {
    
            const isEmailLogin = this.regexService.emailChecker(user.identifier);
            const userLogin : Omit<IUser, 'createdAt' | 'updatedAt' > | null = isEmailLogin ? await this.userRepository.findOneByEmail(user.identifier) : await this.userRepository.findOneByUsername(user.identifier);
            if (!userLogin) throw new BadRequestException('Please register first');
            const validPassword = this.bcryptService.comparePassword(user.password, userLogin.password);
            if (!validPassword) throw new BadRequestException('Invalid email / password');
            if (!userLogin.is_verified) throw new ForbiddenException("Please verify your account");
            const identifier = isEmailLogin ? userLogin.email : userLogin.username;
            const [access_token, refresh_token] = await Promise.all(
                [
                    this.jwtService.signToken({ _id: userLogin._id.toString(), identifier }, "15m", process.env.JOSE_SECRET_ACCESS_TOKEN_KEY as string),
                    this.jwtService.signToken({ _id: userLogin._id.toString(), identifier }, "7d", process.env.JOSE_SECRET_REFRESH_KEY as string)
                ]
            )
            return {
                access_token,
                refresh_token
            }
    
        }

        async changePassword (email : string, hashedPassword : string) : Promise<string> {

            try {
                await this.userRepository.changePassword(email, hashedPassword);
                return 'Password successfully changed'
            } catch (error) {
                throw error
            }

        }

        async activatingAccount (email: string) : Promise<void> {

            await this.userRepository.activateAccount(email)

        }


}
