import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";




@Controller()
export class Auth {



    @Post('/login')
    async login (@Body() createUser : CreateUserDto ) {

        try {
            
        } catch (error) {
            
            console.log(error)

        }

    }

    @Post('/register') 
    async register (@Body() createUser : CreateUserDto) {
        
        console.log(createUser)

        try {
            
            console.log("masuk sini")

        } catch (error) {
            
            console.log(error)

        }

    }



}