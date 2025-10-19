import { Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";



@Injectable()
export class AuthService {

    async signUp(user : IUserRegister) {

        

    }

    async signIn(user : IUserLogin) {

        

    }

}