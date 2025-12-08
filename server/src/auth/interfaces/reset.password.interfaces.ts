import { Types } from "mongoose";

export default interface IResetPassword {

    _id : Types.ObjectId | string
    email : string
    reset_token : string
    expires_at : string | Date
    attempt : number


}