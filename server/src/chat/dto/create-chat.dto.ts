import { IsNotEmpty, IsString } from "class-validator";


export class CreateChatDto {

    @IsString({message : "event is invalid"})
    @IsNotEmpty({message : "event can't be empty"})
    event : string

    @IsString({message : "message is invalid"})
    @IsNotEmpty({message : "message can't be empty"})
    message : string

}
