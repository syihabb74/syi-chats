import { Module } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtService } from "src/common/helpers/jwt.service";
import { PostController } from "./post.controller";

@Module({
    imports : [],
    controllers : [PostController],
    providers : [AuthGuard, JwtService]
})


export class PostModule{}