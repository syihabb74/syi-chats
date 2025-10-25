import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PostDocument = Post & Document


@Schema({
    timestamps : true,
    versionKey : false
})

export class Post {

    _id! : Types.ObjectId;

    @Prop({
        required : true,
        trim: true
    })
    content! : string

    @Prop({
        required : false
    })
    tags : string[]

    @Prop({
        required : false
    })
    media : string[]

    @Prop({
        required : true
    })
    senderId! : Types.ObjectId 

}


export const postSchema = SchemaFactory.createForClass(Post)