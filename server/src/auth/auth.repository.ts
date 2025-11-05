import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateResult } from "mongoose";
import { Refresher } from "src/auth/interfaces/refresher.token.schema";
import IRefresher from "src/auth/interfaces/refresher.interfaces";
import { Verification } from "./schemas/verification.schema";
import IVerification from "./interfaces/verification.interface";



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(Refresher.name) private readonly refresherModel : Model<Refresher>,
        @InjectModel(Verification.name) private readonly verificationModel : Model<Verification>
    ) { }

    async saveRefreshToken(refresh_token : IRefresher) : Promise<Refresher> {

        const createRefresher = new this.refresherModel(refresh_token)
        return createRefresher.save();

    }

    async saveVerificationCode (verification : IVerification) : Promise<Verification> {

        const createVerificationCode = new this.verificationModel(verification);
        return createVerificationCode.save();

    }

    async findCodeVerificationByEmail (email : string) : Promise<Verification | null> {

        return this.verificationModel.findOne({verification_identity : email, type : 'email' ,is_used : false}).lean().exec();
   

    }

    async changeIsUsedStatus (email : string) : Promise<UpdateResult> {

        return this.verificationModel.updateOne({verification_identity : email, type : 'email' ,is_used : false}, {is_used : true});

    }


}