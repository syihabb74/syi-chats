import { 
     Refresher,
     refresherSchema 
} from "src/auth/schemas/refresher.token.schema";
import { 
     ResetPassword,
     resetPasswordSchema
} from "./schemas/reset.password.schema";
import {
     Verification,
     verificationSchema 
} from "./schemas/verification.schema";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthRepository } from "./auth.repository";
import { UserModule } from "src/user/user.module";
import { ResendModule } from "src/common/resend/resend.module";
import { RegexService } from "src/common/helpers/regex.service";
import { JwtService } from "src/common/helpers/jwt.service";
import { BcryptService } from "src/common/helpers/bcrypt.service";


@Module({
    imports : [
        MongooseModule.forFeature([
            { name : Refresher.name, schema : refresherSchema}
        ]),
        MongooseModule.forFeature([
            {name : Verification.name, schema : verificationSchema}
        ]),
        MongooseModule.forFeature([
            {name : ResetPassword.name, schema : resetPasswordSchema}
        ])
        ,
        UserModule,
        ResendModule
    ],
    controllers : [
        AuthController
    ],
    providers : [
        AuthService, 
        AuthRepository,
        RegexService,
        JwtService,
        BcryptService
    ],
})

export class AuthModule {}