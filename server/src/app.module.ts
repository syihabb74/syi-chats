import { Module } from '@nestjs/common';;
import {
  ConfigModule,
  ConfigService
} from '@nestjs/config';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'auth', ttl: 60000, limit: 10 },
      ],
    })
    ,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],

    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
        ...configService.get('database.options'),
      })
    }),
    AuthModule,
    PostModule,
    ChatModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule { }
