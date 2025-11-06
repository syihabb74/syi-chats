import { Document } from "mongoose"
import { Verification } from "../schemas/verification.schema"

export default interface IVerification {

    type? : string 
    verification_identity : string
    verification_code : string
    expires_at : Date
    attempts? : number



}

export type VerificationDocument = (Document<Verification> & Verification)