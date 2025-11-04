import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";


export const RESEND_CLIENT = "RESEND_CLIENT";

export const ResendProvider : Provider = {
    provide : RESEND_CLIENT,
    useFactory : (configService : ConfigService) => {
        return new Resend(configService.get<string>('RESEND_SECRET_KEY'));
    },
    inject : [ConfigService]
}