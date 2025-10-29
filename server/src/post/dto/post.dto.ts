import { ApiProperty } from "@nestjs/swagger";
import { IsArray, isBase64, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreatePostDto {

    @ApiProperty()
    @IsNotEmpty({message : 'content is required'})
    @IsString()
    content : string

    @ApiProperty()
    @IsArray()
    @IsString({each : true})
    @IsOptional()
    tags: string[] = []

    // @ApiProperty()
    // @isBase64()

}