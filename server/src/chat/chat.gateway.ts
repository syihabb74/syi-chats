import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, WsException } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server } from 'ws';
import { UseFilters, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { JWT_TYPE, JwtService } from 'src/common/helpers/jwt.service';
import { WsExceptionFilter } from 'src/exceptions/ws.exception';

@UseFilters(WsExceptionFilter)
@WebSocketGateway()
export class ChatGateway {

  @WebSocketServer()
  server : Server



  async handleConnection(client: any, request: any) {

    try {
      
      // console.log(request.headers, "<<<<<") // when handshake happening authorization value exist here
      if (!request.headers?.authorization){
        client.send(JSON.stringify({ error: 'Invalid credential' }));
        client.close();
        return;
      }
      const [_, token] = request.headers.authorization.split(' ') ?? [];
      if (!token) {
        client.send(JSON.stringify({ error: 'Invalid credential' }));
        client.close();
        return;
      }
      await this.jwtService.verifyToken(token, JWT_TYPE.ACCESS)
      client.handshakeHeaders = request.headers;
      client.upgradeReq = request;


    } catch ( error) {
      if (error.name === "UnauthorizedException") {
        client.send(JSON.stringify({ status: 401 ,error: 'Invalid credential' }));
        client.close()
      } else {
        client.send(JSON.stringify({ status: 500 ,error: 'Internal Server Error' }));
        client.close()
      }

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
