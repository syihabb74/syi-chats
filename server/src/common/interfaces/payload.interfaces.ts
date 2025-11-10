import { JWTPayload } from "jose"
export default interface IPayload extends JWTPayload {

    _id : string
    identifier : string

}