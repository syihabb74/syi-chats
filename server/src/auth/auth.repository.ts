import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Refresher } from "src/common/entities/refresher.token.schema";
import { User } from "src/common/entities/user.schema";
import IRefresher from "src/common/interfaces/refresher.interfaces";
import IUserRegister from "src/common/interfaces/user.register.interfaces";



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        @InjectModel(Refresher.name) private refresherModel : Model<Refresher>) {

    }

    async register(newUser : IUserRegister) : Promise<User> {
        const createUser = new this.userModel(newUser);
        return (await createUser.save()).toJSON()
    }


    async findOneByEmail(email: string) : Promise<User | null> {

        return await this.userModel.findOne({email}).select('-createdAt -updatedAt').lean();

    }


    async findOneByUsername(username : string) : Promise<User | null> {


        return await this.userModel.findOne({username}).select('-createdAt -updatedAt').lean();

    }

    async saveRefreshToken(refresh_token : IRefresher) {

        const createRefresher = new this.refresherModel(refresh_token)
        return createRefresher.save();

    }


}