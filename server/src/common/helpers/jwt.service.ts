import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
import IPayload from '../interfaces/payload.interfaces';
import { ConfigService } from '@nestjs/config';
export enum JWT_TYPE {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
  RESET = "RESET"
}

@Injectable()
export class JwtService {

  constructor(private readonly configService : ConfigService) {}

  private getSecret (type : JWT_TYPE): string {
    const secrets = {
      ACCESS : this.configService.get<string>('JOSE_SECRET_ACCESS_TOKEN_KEY'),
      REFRESH : this.configService.get<string>('JOSE_SECRET_REFRESH_KEY'),
      RESET : this.configService.get<string>('JOSE_SECRET_RESET_PASSWORD_KEY')
    }
    if (!secrets[type]) {
      throw new Error(`JWT ${type} secret not configured`)
    }

    return secrets[type]
  }


  async signToken(payload : IPayload, expireTime : string, secretType : JWT_TYPE) : Promise<string> {
    const secret = new TextEncoder().encode(this.getSecret(secretType));
    const alg = 'HS256';
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(expireTime)
      .sign(secret)
      return jwt

  }

  async verifyToken(access_token : string, secretType : JWT_TYPE) : Promise<IPayload>  {

    try {
      const secret = new TextEncoder().encode(this.getSecret(secretType));

      const {payload} = await jose.jwtVerify(access_token, secret);
      return payload as IPayload
    } catch (error) {
      throw new UnauthorizedException('Invalid token')
    }

  }

  async createAccessAndRefreshToken (user : Pick<IPayload, '_id'> , identifier : string): Promise<string[]> {
          const [access_token, ref_token] = await Promise.all(
                  [
                      this.signToken({ _id: user._id, identifier }, "15m", JWT_TYPE.ACCESS),
                      this.signToken({ _id: user._id, identifier }, "7d", JWT_TYPE.REFRESH)
                  ]
              )
          return [access_token, ref_token]
      }


}