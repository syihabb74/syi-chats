import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";

@Controller('posts')
export class PostController {

    @UseGuards(AuthGuard)
    @Get()
    async getPosts () {
        try {

            return {message :['a', 'b', 'c']}
            
        } catch (error) {
            
            console.log(error)
            throw error

        }

    }

}
