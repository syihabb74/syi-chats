import { BadRequestException, ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import IUserLogin from "src/common/interfaces/user.login.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import IUser from "src/common/interfaces/user.interface";
import { UserService } from "src/user/user.service";



@Injectable()
export class AuthService {

    constructor( 
        private readonly userService : UserService
    ) 
        { }

    async signUp(user: IUserRegister) {

        return this.userService.signUp(user);
        
    }

    async signIn(user: IUserLogin): Promise<{ access_token: string, refresh_token: string }> {

       return this.userService.signIn(user);

    }


    async refresherTokenSave(refresh_token: string) {



    }

}