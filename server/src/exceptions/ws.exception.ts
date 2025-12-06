import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost) {
        const client = host.switchToWs().getClient<WebSocket>();
        const response = {
            error : exception.message,
            exception
        };
        client.send(JSON.stringify(response))
        client.close()
    }
}