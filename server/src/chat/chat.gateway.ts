import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { WebSocket } from 'ws';
import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';

@WebSocketGateway()
export class ChatGateway {

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
   @SubscribeMessage('createChat')
  create(@MessageBody() dto: CreateChatDto) {
    console.log(dto, "<<<< DTO MASUKKK")
    return this.chatService.create(dto);
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto)
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }
}

// gateway is like controllers decorator
