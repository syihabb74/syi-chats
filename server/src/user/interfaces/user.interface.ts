import { Types } from "mongoose";

export default interface IUser {
    _id : Types.ObjectId
    name : string
    username : string
    email : string
    password : string
    is_verified : boolean
    createdAt : string
    updatedAt : string
}