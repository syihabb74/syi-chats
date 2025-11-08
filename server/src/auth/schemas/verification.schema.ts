import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VerificationDocument = Verification & Document

@Schema({
    versionKey : false,
    timestamps : false
})

export class Verification {
    
    @Prop({
        type : String,
        default : 'email'
    })
    type : string

    @Prop({
        type : String,
        required : true,
        index : true
    })
    verification_identity : string

    @Prop({
        type : String,
        required : true
    })
    verification_code : string

    @Prop({
        type : Number,
        default : 0
    })
    attempts : number

    @Prop({
        type : Date,
        required : true
    })
    expires_at : Date

    @Prop({
        type : Boolean,
        required : true,
        default : false
    })
    is_new_request : Boolean

    @Prop({
        type : Boolean,
        required : true,
        default : false
    })
    is_used : Boolean

}


export const verificationSchema = SchemaFactory.createForClass(Verification);
verificationSchema.index({expires_at : 1}, {expireAfterSeconds : 0});
