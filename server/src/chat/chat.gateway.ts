import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, WsException } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server } from 'ws';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from 'src/common/helpers/jwt.service';

@WebSocketGateway()
export class ChatGateway {

  @WebSocketServer()
  server : Server



  handleConnection(client: any, request: any) {

    try {
      
      if (!client.upgradeReq?.headers?.authorization) {
        client.close()
        return
      }
      const [_, token] = client.upgradeReq.headers.authorization.split(' ') ?? [];
      if (!token) {
        client.close()
       return
      }
      this.jwtService.verifyToken(token, process.env.JOSE_SECRET_ACCESS_TOKEN_KEY as string)
      client.handshakeHeaders = request.headers;
      client.upgradeReq = request;


    } catch (error) {
      throw error
    }
        
       
    } // will be running for the first time when client trying to connect

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService : JwtService
  ) {}

  @UseGuards(AuthGuard)
  @SubscribeMessage('createChat')
  async create(@MessageBody() dto: CreateChatDto) {
    try {
      console.log(dto, "<<<< DTO")
      const a =  await this.chatService.create(dto);
      return a
      
    } catch (error) {
      console.log(error, "<<<<<<<<<")
    }
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    console.log("Find all Chat")
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
