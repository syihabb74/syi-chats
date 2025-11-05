import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('posts')
export class PostController {

    @UseGuards(AuthGuard)
    @Get()
    async getPosts () {

        return {message :['a', 'b', 'c']}

    }

}
