import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RefreshDocument = Refresh & Document

@Schema({
    versionKey : false,
    timestamps : false
})

export class Refresh {

   _id! : Types.ObjectId
   
   @Prop({
    type : String,
    required : true,
    unique : true
   })
   token : string

   @Prop({
    type : Date,
    required : true,
    default : Date.now
   })
    created_at : Date

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
   is_used : boolean

}


export const refreshSchema = SchemaFactory.createForClass(Refresh)
refreshSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });