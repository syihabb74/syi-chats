import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Request } from "express";
import { JWT_TYPE, JwtService } from "src/common/helpers/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor (private readonly jwtService : JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        try {
            
            const ctxRun = context.getType()
            if (ctxRun == "http") {
                console.log("enter here")
                return await this.handleHttpRequest(context)
            } else { // if (ctxRun == "ws") for upcoming another handleRequest
                return await this.handleWsRequest(context)
            }
            
        } catch (error) {
            throw error            
        }
        

    
    }

    private async handleWsRequest (context : ExecutionContext) : Promise<boolean> {

        try {

            const client = context.switchToWs().getClient();
                const token = this.extractTokenFromWs(client)
                if (!token) throw new WsException("Unauthorized")
                const payload = await this.jwtService.verifyToken(token, JWT_TYPE.ACCESS);
                
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
                const payload = await this.jwtService.verifyToken(token, JWT_TYPE.ACCESS);
                console.log("Validate here")
                request['user'] = payload;
                return true

        } catch (error) {
            console.log("error")
            throw error

        }

    }

    private extractTokenFromHeaderHttp(request : Request): string | undefined {

        if (!request.headers?.authorization) return undefined;
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        console.log(token)
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