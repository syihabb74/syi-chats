import { Document, Types } from "mongoose"
import { Verification } from "../schemas/verification.schema"

export default interface IVerification {

    _id : Types.ObjectId | string
    type? : string 
    verification_identity : string
    verification_code : string
    expires_at : Date
    attempts : number



}

export type VerificationDocument = (Document<Verification> & Verification)