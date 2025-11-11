import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { 
     Model,
     UpdateResult
} from "mongoose";
import { Refresher } from "src/auth/schemas/refresher.token.schema";
import IRefresher from "src/auth/interfaces/refresher.interfaces";
import { 
     Verification,
     VerificationDocument 
} from "./schemas/verification.schema";
import IVerification from "./interfaces/verification.interface";
import IResetPassword from "./interfaces/reset.password.interfaces";
import { ResetPassword } from "./schemas/reset.password.schema";



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(Refresher.name) private readonly refresherModel : Model<Refresher>,
        @InjectModel(Verification.name) private readonly verificationModel : Model<Verification>,
        @InjectModel(ResetPassword.name) private readonly resetPasswordModel : Model<ResetPassword>
    ) { }

    async saveRefreshToken(refresh_token : IRefresher) : Promise<Refresher> {

        const createRefresher = new this.refresherModel(refresh_token)
        return await createRefresher.save();

    }

    async saveVerificationCode (verification : IVerification) : Promise<VerificationDocument> {

        const createVerificationCode = new this.verificationModel(verification);
        return await createVerificationCode.save();

    }

    async findCodeVerificationByEmail (email : string) : Promise<VerificationDocument | null> {

        try {
            return await this.verificationModel.findOne({verification_identity : email, type : 'email' ,is_new_request : false})
        } catch (error) {
            throw error
        }
   

    }
    

    async deleteVerification (email : string, type : string) : Promise<void> {

        try {
            await this.verificationModel.deleteMany({verification_identity : email, type: type }).exec();
        } catch (error) {
            throw error
        }

    }

    async updateIsNewRequest(verification : VerificationDocument) : Promise<void> {
       
        try {
          verification.is_new_request = true
          await verification.save();      
        } catch (error) {
          throw error  
        }
      

    }

    async incrementAttemps (verification : VerificationDocument) : Promise<UpdateResult> {

        try {
            return await verification.updateOne({$inc : { attempts : 1 }})
        } catch (error) {
            throw error
        }

    }

    async saveResetPasswordToken (reset_token : Omit<IResetPassword, '_id'>) : Promise<IResetPassword> {

        try {
            return (await new this.resetPasswordModel(reset_token).save()).toJSON();
        } catch (error) {
            throw error
        }

    }

    async findToken(reset_token : string) : Promise<IResetPassword | null> {

        try {
            return await this.resetPasswordModel.findOne({reset_token}).lean().exec()
        } catch (error) {
            throw error
        }

    }

  


}