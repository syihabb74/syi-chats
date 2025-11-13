import { 
     Verification,
     VerificationDocument 
} from "./schemas/verification.schema";
import { 
    ResetPassword,
    ResetPasswordDocument
} from "./schemas/reset.password.schema";
import {  Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Refresher } from "src/auth/schemas/refresher.token.schema";
import IRefresher from "src/auth/interfaces/refresher.interfaces";
import IVerification from "./interfaces/verification.interface";
import IResetPassword from "./interfaces/reset.password.interfaces";



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(Refresher.name) private readonly refresherModel : Model<Refresher>,
        @InjectModel(Verification.name) private readonly verificationModel : Model<Verification>,
        @InjectModel(ResetPassword.name) private readonly resetPasswordModel : Model<ResetPassword>
    ) { }

    async saveRefreshToken(refresh_token : Omit<IRefresher, '_id' | 'is_used'>) : Promise<Refresher> {
        try {
            const createRefresher = new this.refresherModel(refresh_token)
            return (await createRefresher.save()).toJSON();
        } catch (error) {
            throw error
        }


    }

    async findRefreshToken (refresh_token : string, identifier : string) : Promise<IRefresher | null> {
        try {
            const refresher = await this.refresherModel.findOne({refresh_token, identifier, is_used : false}).lean().exec()
            return refresher
        } catch (error) {
            throw error
        }

    }

    async changeIsUsedRefreshToken (old_refresh_token : string) : Promise<void> {

         try {
            await this.refresherModel.updateOne({refresh_token : old_refresh_token},{$set : {is_used : true}});
        } catch (error) {
            throw error
        }

    }

    async saveVerificationCode (verification : Omit<IVerification, '_id' | 'attempts'>) : Promise<void> {

        try {
            const createVerificationCode = new this.verificationModel(verification);
            await createVerificationCode.save();
        } catch (error) {
            throw error
        }

    }

    async findCodeVerificationByEmail (email : string) : Promise<IVerification | null> {

        try {
            return await this.verificationModel.findOne({verification_identity : email, type : 'email' ,is_new_request : false}).lean().exec()
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

    async updateIsNewRequestVerification({verification_identity} : Pick<IVerification, 'verification_identity'>) : Promise<void> {
       
        try {
        await this.verificationModel.findOneAndUpdate({verification_identity}, {$set : {is_new_request : true}}).lean().exec()
        //   verificationDoc.is_new_request = true
        //   await verificationDoc.save();  old code hydrated document
        } catch (error) {
          throw error  
        }
      

    }

    async incrementVerificationAttemps ({verification_identity} : Pick<IVerification, 'verification_identity'>) : Promise<void> {

        try {
            console.log(verification_identity, "<<<<<<<<<<<")
            await this.verificationModel.findOneAndUpdate({verification_identity}, {$inc : {attempts : 1}}).lean().exec()
            // await verificationDoc.updateOne({$inc : { attempts : 1 }}).lean().exec() // hidrated doc old code
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

    async findTokenResetPassword(reset_token : string, email : string) : Promise< ResetPasswordDocument | null> {

        try {
            return await this.resetPasswordModel.findOne({reset_token, email})
        } catch (error) {
            throw error
        }

    }

    async incrementResetPasswordAttempts (resetPasswordDoc : ResetPasswordDocument) {

         try {
            await resetPasswordDoc.updateOne({$inc : { attempts : 1 }}).lean().exec()
        } catch (error) {
            throw error
        }

    }

    async deleteResetPassword (email : string) : Promise<void> {

        try {
            await this.resetPasswordModel.deleteMany({email : email}).lean().exec();
        } catch (error) {
            throw error
        }

    }

  


}