import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger : ['log', 'error', 'warn', 'debug', 'verbose'] // logger level 
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new WsAdapter(app, {
    messageParser : (data) => {
      const [event, payload] = JSON.parse(data.toString());
      return { event, data: payload };
    }
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
