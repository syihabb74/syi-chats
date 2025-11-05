import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/user/schemas/user.schema";
import IUserRegister from "src/common/interfaces/user.register.interfaces";



@Injectable()
export class UserRepository {

    constructor
        (
            @InjectModel(User.name) private userModel: Model<User>, 
        ) { }

    async register(newUser : IUserRegister) : Promise<User> {
        const createUser = new this.userModel(newUser);
        return (await createUser.save()).toJSON()
    }


    async findOneByEmail(email: string) : Promise<User | null> {

        return this.userModel.findOne({email}).select('-createdAt -updatedAt').lean();

    }


    async findOneByUsername(username : string) : Promise<User | null> {


        return this.userModel.findOne({username}).select('-createdAt -updatedAt').lean();

    }



}