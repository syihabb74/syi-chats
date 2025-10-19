import { Body, Controller, Post, Response as ResNest } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import type { Response } from "express";




@Controller('auth')
export class AuthController {

    

    @Post('/login')
    async login (@Body() loginDto : LoginUserDto, @ResNest() Res : Response ) {

        try {

            console.log("Masuk login");

            return Res.status(200).json({message : "login"})
            
        } catch (error) {
            
            console.log(error)

        }

    }

    @Post('/register') 
    async register (@Body() createDto : CreateUserDto, @ResNest() Res : Response) {

        try {

            console.log("Masuk register")
            

            return Res.status(200).json({message : "register"})

        } catch (error) {
            
            console.log(error)

        }

    }



}