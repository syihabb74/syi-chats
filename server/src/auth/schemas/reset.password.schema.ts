import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ResetPasswordDocument = ResetPassword & Document

@Schema({
    versionKey : false,
    timestamps : false
})

export class ResetPassword {

    _id! : Types.ObjectId

    @Prop({
     type : String,
     required : true,
     index : true,
     unique : true
    })
    email : string

    @Prop({
    type : String,
    required : true,
    unique : true
   })
   reset_token : string

    @Prop({
     type : Date,
     required : true
    })
    expires_at : Date

   @Prop({
    type : Number,
    required : true,
    default : 0
   })
   attempt : number


}


export const resetPasswordSchema = SchemaFactory.createForClass(ResetPassword);
resetPasswordSchema.index({expires_at: 1}, {expireAfterSeconds: 0 });