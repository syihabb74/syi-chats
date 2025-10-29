import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Verification, verificationSchema } from "./verification.schema";

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
        type : String,
        required : false
    })
    phoneNumber? : string

    @Prop({
        required: true,
        trim: true
    })
    password!: string;

    @Prop({
        type : Boolean,
        default : false
    })
    emailVerified : boolean

    // @Prop({
    //     type : Boolean,
    //     default : false
    // })
    // phoneVerified : boolean 
    // phoneVerified must to be moved to profile user

    @Prop({
        type : verificationSchema
    })
    verification : Verification
    

}


export const userSchema = SchemaFactory.createForClass(User);
userSchema.index({username : 1, email : 1, phoneNumber : 1})