import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { 
    Model,
    UpdateResult
} from "mongoose";
import { User } from "src/user/schemas/user.schema";
import IUserRegister from "src/common/interfaces/user.register.interfaces";
import IUser from "./interfaces/user.interface";



@Injectable()
export class UserRepository {

    constructor
        (
            @InjectModel(User.name) private userModel: Model<User>, 
        ) { }

    async register(newUser : IUserRegister) : Promise<User> {

        try {
            const createUser = new this.userModel(newUser);
            return (await createUser.save()).toJSON()
        } catch (error) {
            throw error
        }

        
    }


    async findOneByEmail(email: string) : Promise<Omit<IUser, 'createdAt'| 'updatedAt'> | null> {

        try {
            return await this.userModel.findOne({email}).select('-createdAt -updatedAt').lean().exec();
        } catch (error) {
            throw error
        }


    }


    async findOneByUsername(username : string) : Promise<Omit<IUser, 'createdAt'| 'updatedAt'> | null> {

        try {
            return await this.userModel.findOne({username}).select('-createdAt -updatedAt').lean().exec();
        } catch (error) {
            throw error
        }

    }


    async activateAccount(email : string) : Promise<UpdateResult> {

        try {
            return await this.userModel.updateOne({email}, {is_verified : true}).lean().exec()
        } catch (error) {
            throw error
        }

    }

    async changePassword (email : string, newPassword : string) : Promise<UpdateResult> {
        try {
            return await this.userModel.updateOne({email}, {password : newPassword}).lean().exec()
        } catch (error) {
          throw error  
        }
    }



}