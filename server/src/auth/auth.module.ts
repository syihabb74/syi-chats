import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthRepository } from "./auth.repository";
import { Refresher, refresherSchema } from "src/auth/interfaces/refresher.token.schema";
import { UserModule } from "src/user/user.module";
import { Verification, verificationSchema } from "./schemas/verification.schema";
import { ResendModule } from "src/common/resend/resend.module";


@Module({
    imports : [
        MongooseModule.forFeature([
            { name : Refresher.name, schema : refresherSchema}
        ]),
        MongooseModule.forFeature([
            {name : Verification.name, schema : verificationSchema}
        ]),
        UserModule,
        ResendModule
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