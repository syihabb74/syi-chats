import { Module } from '@nestjs/common';;
import {
  ConfigModule,
  ConfigService
} from '@nestjs/config';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
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
  ]
})
export class AppModule { }
