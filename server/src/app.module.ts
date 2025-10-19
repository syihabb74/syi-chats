import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth } from './auth/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      
    }),
    MongooseModule.forRootAsync({
      inject : [ConfigService],
      useFactory : (configService : ConfigService) => ({
        uri : configService.get('database.uri'),
        ...configService.get('database.options'),
      })
    })
  ],
  controllers: [AppController, Auth],
  providers: [AppService],
})
export class AppModule {}
