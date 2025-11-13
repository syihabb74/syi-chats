import { Types } from "mongoose";

export default interface IRefresher {

    _id : Types.ObjectId | string
    identifier : string
    refresh_token : string
    expires_at : Date | string
    is_used : boolean


}