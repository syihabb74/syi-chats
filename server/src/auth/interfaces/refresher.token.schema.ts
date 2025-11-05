import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RefresherDocument = Refresher & Document

@Schema({
    versionKey : false,
    timestamps : false
})

export class Refresher {

    _id! : Types.ObjectId

    @Prop({
     type : String,
     required : true,
     index : true,
     unique : true
    })
    identifier : string

    @Prop({
    type : String,
    required : true,
    unique : true
   })
   refresh_token : string

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


export const refresherSchema = SchemaFactory.createForClass(Refresher);
refresherSchema.index({expires_at: 1}, {expireAfterSeconds: 0 });