import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { RESEND_CLIENT } from "./resend.provider";
import { Resend } from "resend";

export class ResendService {

    constructor(
        @Inject(RESEND_CLIENT) private readonly resend: Resend
    ) {}

    async sendCode (code : string, receiver : string) {

         this.resend.emails.send({
            from: 'syi-chats <noreply@syhbsrc.site>',
            to: receiver,
            subject: 'Activating syi-chats account',
            html: `<p>Code Verification : <strong>${code}</strong></p>`
        })

    }

    async sendWelcomeEmail (name : string, receiver : string) {

    }

    async sendPasswordReset (receiver : string, resetLink: string) {


    }

}