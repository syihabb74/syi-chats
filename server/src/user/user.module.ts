import { Module } from "@nestjs/common";
import { BcryptService } from "src/common/helpers/bcrypt.service";
import { JwtService } from "src/common/helpers/jwt.service";
import { RegexService } from "src/common/helpers/regex.format-email.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "src/common/entities/user.schema";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";

@Module({
    imports : [
        MongooseModule.forFeature([
            {name : User.name, schema : userSchema}
        ])
    ],
    providers : [JwtService, BcryptService, RegexService, UserService, UserRepository],
    exports : [JwtService, BcryptService, RegexService, UserService, UserRepository]
})

export class UserModule {}