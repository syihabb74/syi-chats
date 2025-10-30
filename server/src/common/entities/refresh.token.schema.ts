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
   created_at : string

   @Prop({
    type : Date,
    required : true,
    index : {expires : 0}
   })
   expires_at : string

}


export const refreshSchema = SchemaFactory.createForClass(Refresh)