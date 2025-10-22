import { Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import { AuthRepository } from "./auth.repository";
import { BcryptService } from "src/common/helpers/bcrypt.service";



@Injectable()
export class AuthService {

    constructor(private readonly authRepository : AuthRepository, private readonly bcryptService : BcryptService) {}

    async signUp(user : IUserRegister) {

        

        user.password = this.bcryptService.hashPassword(user.password);

        return this.authRepository.register(user)

    }

    async signIn(user : IUserLogin) {

        

    }

}