import {
    Verification
} from "./schemas/verification.schema";
import {
    ResetPassword,
    ResetPasswordDocument
} from "./schemas/reset.password.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Refresher } from "src/auth/schemas/refresher.token.schema";
import IRefresher from "src/auth/interfaces/refresher.interfaces";
import IVerification from "./interfaces/verification.interface";
import IResetPassword from "./interfaces/reset.password.interfaces";



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(Refresher.name) private readonly refresherModel: Model<Refresher>,
        @InjectModel(Verification.name) private readonly verificationModel: Model<Verification>,
        @InjectModel(ResetPassword.name) private readonly resetPasswordModel: Model<ResetPassword>
    ) { }

    async saveRefreshToken(refresh_token: Omit<IRefresher, '_id' | 'is_used'>): Promise<void> {

        try {

            const createRefresher = new this.refresherModel(refresh_token)
            await createRefresher.save().then(doc => doc.toJSON())

        } catch (error) {

            throw error

        }


    }

    async saveVerificationCode(verification: Omit<IVerification, '_id' | 'attempts'>): Promise<void> {

        try {
            const createVerificationCode = new this.verificationModel(verification);
            await createVerificationCode.save();
        } catch (error) {
            throw error
        }

    }

    async saveResetPasswordToken(reset_token: Omit<IResetPassword, '_id' | 'attempt'>): Promise<void> {

        try {
            const createResetPassword = new this.resetPasswordModel(reset_token);
            await createResetPassword.save()
        } catch (error) {
            throw error
        }


    }

    async findRefreshToken(refresh_token: string, identifier: string): Promise<IRefresher | null> {

        return this.refresherModel.findOne({ refresh_token, identifier, is_used: false }).lean().exec()

    }

    async changeIsUsedRefreshToken(old_refresh_token: string): Promise<void> {

        await this.refresherModel.updateOne({ refresh_token: old_refresh_token }, { $set: { is_used: true } });


    }


    async consumeVerificationCode(email: string, type: string, verification_code: string): Promise<IVerification | null> {

        return this.verificationModel.findOneAndUpdate(
            {
                verification_identity: email,
                verification_code,
                type,
                is_new_request: false,
                is_used: false,
                attempts: { $lt: 5 },
                expires_at: { $gt: new Date() }
            },
            {
                $set: { is_used: true }
            },
            {
                new: true
            }
        ).lean().exec()


    }

    async findCodeVerificationByEmail(email: string): Promise<IVerification | null> {

        return this.verificationModel.findOne({ verification_identity: email, type: 'email', is_new_request: false }).lean().exec()

    }

    async deleteVerification(email: string, type: string): Promise<void> {

        await this.verificationModel.deleteMany({ verification_identity: email, type: type }).exec();

    }

    async updateIsNewRequestVerification({ verification_identity }: Pick<IVerification, 'verification_identity'>): Promise<void> {

        await this.verificationModel.findOneAndUpdate(
            {
                verification_identity,
                is_new_request: false
            },
            {
                $set: { is_new_request: true }
            },
            {
                new: true
            }
        ).lean().exec()



    }

    async incrementVerificationAttemps(verification_identity: string): Promise<void> {

        await this.verificationModel.findOneAndUpdate({
            verification_identity,
            attempts: { $lt: 5 }
        },
            {
                $inc: { attempts: 1 }
            },
            {
                new: true
            }
        ).lean().exec()


    }



    async findTokenResetPassword(reset_token: string, email: string): Promise<IResetPassword | null> {


        return this.resetPasswordModel.findOne({ reset_token, email }).select('-expires_at').lean().exec()

    }

    async incrementResetPasswordAttempts(resetPassword: Omit<IResetPassword, 'expires_at'>) {

        await this.resetPasswordModel.findOneAndUpdate(
            {
                email: resetPassword.email,
                reset_token: resetPassword.reset_token,
                attempt: { $lt: 3 }
            },
            {
                $inc: { attempt: 1 }
            },
            {
                new: true
            }
        ).exec()
    }

    async deleteResetPassword(email: string): Promise<void> {

        await this.resetPasswordModel.deleteMany({ email: email }).exec();

    }




}