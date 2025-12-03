import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AuthGuard } from 'src/auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtService } from 'src/common/helpers/jwt.service';

@Module({
  imports : [],
  providers: [ChatGateway, ChatService, JwtService],
})
export class ChatModule {}
