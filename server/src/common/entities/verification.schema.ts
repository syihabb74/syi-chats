import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type VerificationDocument = Verification & Document

@Schema({
    _id : false,
    versionKey : false
})

export class Verification {
    
    @Prop({
        type : String,
        default : 'email'
    })
    type : string

    @Prop({
        type : String,
        required : true
    })
    code : string

    @Prop({
        type : Number,
        default : 0
    })
    attempts : number

}


export const verificationSchema = SchemaFactory.createForClass(Verification)