import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "src/common/entities/user.schema";
import { AuthRepository } from "./auth.repository";
import { BcryptService } from "src/common/helpers/bcrypt.service";
import { JwtService } from "src/common/helpers/jwt.service";
import { RegexService } from "src/common/helpers/regex.format-email.service";
import { Refresher, refresherSchema } from "src/common/entities/refresher.token.schema";
import { UserModule } from "src/user/user.module";


@Module({
    imports : [
        MongooseModule.forFeature([
            {name : User.name, schema : userSchema}
        ]),
        MongooseModule.forFeature([
            {name : Refresher.name, schema : refresherSchema}
        ]),
        UserModule
    ],
    controllers : [AuthController],
    providers : [AuthService, AuthRepository, BcryptService, JwtService, RegexService],
})

export class AuthModule {}