import { JWTPayload } from "jose"
import { Types } from "mongoose"
export default interface IPayload extends JWTPayload {

    _id : Types.ObjectId | string
    identifier : string

}