import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/common/entities/user.schema";
import IUserRegister from "src/common/interfaces/user.register.interfaces";



@Injectable()
export class AuthRepository {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {

    }

    async register(newUser : IUserRegister) : Promise<User> {
        const createUser = new this.userModel(newUser);
        return createUser.save()
    }

}