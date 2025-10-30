import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Refresh, refreshSchema } from "./refresh.token.schema";

export type RefresherDocument = Refresher & Document

@Schema({
    versionKey : false,
    timestamps : false
})

export class Refresher {

    @Prop({
        unique : true,
        required : true
    })
    _id! : string

    @Prop({
        type : refreshSchema
    })
    refresh_token : Refresh


}


export const refresherSchema = SchemaFactory.createForClass(Refresher);
refresherSchema.index({_id: 1})