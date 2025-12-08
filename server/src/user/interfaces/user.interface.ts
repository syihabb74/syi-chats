import { Types } from "mongoose";

export default interface IUser {
    _id : Types.ObjectId | string
    name : string
    username : string
    email : string
    password : string
    is_verified : boolean
    createdAt : string | Date
    updatedAt : string | Date
}