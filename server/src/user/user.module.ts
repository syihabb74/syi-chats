import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, userSchema } from "src/user/schemas/user.schema";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { SharedModule } from "src/common/shared/shared.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: userSchema }
        ]),
        SharedModule
    ],
    providers: [
        UserService,
        UserRepository
    ],
    exports: [
        UserRepository,
        UserService
    ]
})

export class UserModule { }