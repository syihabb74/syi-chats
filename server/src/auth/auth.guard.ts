import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Request } from "express";
import { JwtService } from "src/common/helpers/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor (private readonly jwtService : JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        try {
            
            const ctxRun = context.getType()
            if (ctxRun == "http") {
                this.handleHttpRequest(context)
            } else if (ctxRun == "ws") {
                this.handleWsRequest(context)
            }
            return false
            
        } catch (error) {
            console.log(error, "<<<<<<<<<<<<<<<<<")
            throw error            
        }
        

    
    }

    private async handleWsRequest (context : ExecutionContext) : Promise<boolean> {

        try {

            const client = context.switchToWs().getClient();
                const token = this.extractTokenFromWs(client)
                if (!token) throw new WsException("Unauthorized")
                const payload = await this.jwtService.verifyToken(token, process.env.JOSE_SECRET_ACCESS_TOKEN_KEY as string);
                client['user'] = payload
                return true
            
        } catch (error) {
            
            throw error

        }

    }

    private async handleHttpRequest (context : ExecutionContext) : Promise<boolean> {

        try {
            
                const request = context.switchToHttp().getRequest();
                const token = this.extractTokenFromHeaderHttp(request);
                if (!token) throw new UnauthorizedException("Unauthorized")
                const payload = await this.jwtService.verifyToken(token, process.env.JOSE_SECRET_ACCESS_TOKEN_KEY as string);
                request['user'] = payload;
                return true

        } catch (error) {
            
            throw error

        }

    }

    private extractTokenFromHeaderHttp(request : Request): string | undefined {

        if (!request.headers?.authorization) return undefined;
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined

    }

    private extractTokenFromWs (client : any): string | undefined {

        try {
            
            // console.log(client.upgradeReq?.headers?.authorization) // this is will be passing from handle connection
            if (!client.upgradeReq?.headers?.authorization) return undefined;
            const [type, token] = client.upgradeReq.headers.authorization.split(' ') ?? [];
            return type === 'Bearer' ? token : undefined

        } catch (error) {
            console.log(error)
        }

    }


}


/* basically the context will be adjusting the request from the client  */