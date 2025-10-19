import { Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import { AuthRepository } from "./auth.repository";



@Injectable()
export class AuthService {

    constructor(private readonly authRepository : AuthRepository) {}

    async signUp(user : IUserRegister) {

        return this.authRepository.register(user)

    }

    async signIn(user : IUserLogin) {

        

    }

}