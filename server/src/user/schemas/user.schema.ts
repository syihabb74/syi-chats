import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({
    timestamps : true,
    versionKey : false,
    toJSON : {
        transform : (doc: Record<string, any>, ret: Record<string, any>) => {
            delete ret.password;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
            delete ret.is_verified;
            return ret
        }   
    }
})
export class  User {
    
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
        required : true,
        default : false
    })
    is_verified : boolean
    

}


export const userSchema = SchemaFactory.createForClass(User);
userSchema.index({username : 1, email : 1, phoneNumber : 1})