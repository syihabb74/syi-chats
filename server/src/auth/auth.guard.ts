import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "src/common/helpers/jwt.service";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor (private readonly jwtService : JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException();
        const payload = await this.jwtService.verifyToken(token);
        request['user'] = payload;
        return true
   
    }

    private extractTokenFromHeader(request : Request): string | undefined {

        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined

    }


}