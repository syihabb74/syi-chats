import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  async create(createChatDto: CreateChatDto) {

    try {
      return 'This action adds a new chat';
    } catch (error) {
      console.log("ERROR DETECTEDDDD SLURRRRRRRR")
      console.log(error, "<<<<<<<<<<<<<<<<< ERRROR")
    }

  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
