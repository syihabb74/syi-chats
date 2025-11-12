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
import { SharedModule } from "src/common/shared/shared.module";


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
        ResendModule,
        SharedModule
    ],
    controllers : [
        AuthController
    ],
    providers : [
        AuthService, 
        AuthRepository,
        
    ],
})

export class AuthModule {}