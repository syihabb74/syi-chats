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



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(Refresher.name) private readonly refresherModel : Model<Refresher>,
        @InjectModel(Verification.name) private readonly verificationModel : Model<Verification>
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

        return await this.verificationModel.findOne({verification_identity : email, type : 'email' ,is_new_request : false})
   

    }
    

    async deleteVerification (email : string, type : string) : Promise<void> {

        console.log("Masuk ke sini mau delete semua", email, type);

        await this.verificationModel.deleteMany({verification_identity : email, type: type }).exec();

    }

    async updateIsNewRequest(verification : VerificationDocument) : Promise<void> {
       

        verification.is_new_request = true

        await verification.save();

    }

    async incrementAttemps (verification : VerificationDocument) : Promise<UpdateResult> {

        return await verification.updateOne({$inc : { attempts : 1 }})

    }

  


}