import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PostDocument = Post & Document


@Schema({
    timestamps : true,
    versionKey : false
})

export class Post {

    @Prop()
    _id! : Types.ObjectId;

    @Prop({
        required : true,
        trim: true
    })
    content! : string

    @Prop({
        type : [String], default : []
    })
    tags? : string[]

    @Prop({
        type : [
            {
                url : {type: String, required : true},
                type : {type : String},
                alt : {type : String}
            }
        ],
        default : []
    })
    media? : {url : string; type?: string, alt? : string}[]

    @Prop({
        type : Types.ObjectId, 
        ref : 'User', 
        required : true
    })
    senderId! : Types.ObjectId 

}


export const postSchema = SchemaFactory.createForClass(Post)