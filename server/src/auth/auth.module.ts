import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "src/common/entities/user.schema";
import { AuthRepository } from "./auth.repository";
import { BcryptService } from "src/common/helpers/bcrypt.service";
import { JwtService } from "src/common/helpers/jwt.service";
import { RegexService } from "src/common/helpers/regex.format-email.service";

@Module({
    imports : [
        MongooseModule.forFeature([
            {name : User.name, schema : userSchema}
        ])
    ],
    controllers : [AuthController],
    providers : [AuthService, AuthRepository, BcryptService, JwtService, RegexService]
})

export class AuthModule {}