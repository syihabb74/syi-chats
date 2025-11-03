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
        required : true
    })
    identifier : string

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


export const refresherSchema = SchemaFactory.createForClass(Refresher);
refresherSchema.index({identifier : 1, expires_at: 1 }, {unique : true, expireAfterSeconds: 0 });