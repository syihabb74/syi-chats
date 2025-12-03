import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new WsAdapter(app, {
    messageParser : (data) => {
      console.log("masuk ke message parser")
      const [event, payload] = JSON.parse(data.toString());
      console.log(event, payload, "<<<<<<<<<<< ")
      return { event, data: payload };
    }
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
