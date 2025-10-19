import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "src/common/entities/user.schema";
import { AuthRepository } from "./auth.repository";

@Module({
    imports : [
        MongooseModule.forFeature([
            {name : User.name, schema : userSchema}
        ])
    ],
    controllers : [AuthController],
    providers : [AuthService, AuthRepository]
})

export class AuthModule {}