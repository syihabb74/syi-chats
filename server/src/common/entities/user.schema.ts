import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({
    timestamps : true,
    versionKey : false
})
export class User {

    _id!: Types.ObjectId;

    @Prop({
        required: true, 
        trim: true
    })
    name!: string

    @Prop({
        required: true,
        unique: true,
        trim: true,
    })
    username!: string

    @Prop({
        required: true,
        unique: true,
        trim: true
    })
    email!: string;

    @Prop({
        required: true,
        trim: true
    })
    password!: string;

}


export const userSchema = SchemaFactory.createForClass(User)