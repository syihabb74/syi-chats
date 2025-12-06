import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { RESEND_CLIENT } from "./resend.provider";
import { Resend } from "resend";
import retryStrategy from "../utils/retryStrategy";

export class ResendService {

    constructor(
        @Inject(RESEND_CLIENT) private readonly resend: Resend
    ) {}

    async sendCode (code : string, receiver : string) {

        return retryStrategy(async () => {
            return await this.resend.emails.send({
            from: 'syi-chats <noreply@syhbsrc.site>',
            to: receiver,
            subject: 'Activating syi-chats account',
            html: `<p>Code Verification : <strong>${code}</strong></p>`
            });
        }).catch((err) => {
            console.log("[resend] error causes >>>", err)
        })

    }

    async sendWelcomeEmail (name : string, receiver : string) {

    }

    async sendPasswordReset (receiver : string, resetLink: string) {

        this.resend.emails.send({
            from: 'syi-chats <noreply@syhbsrc.site>',
            to: receiver,
            subject: 'Reset password syi-chats account',
            html: `<p>Code Verification : <strong>${resetLink}</strong></p>`
        })

    }

}