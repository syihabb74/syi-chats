import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jose from 'jose';
import IPayload from '../interfaces/payload.interfaces';






@Injectable()


export class JwtService {


  async signToken(payload : IPayload, expireTime : string) : Promise<string> {

    const secret = new TextEncoder().encode(process.env.JOSE_SECRET_KEY);
    const alg = 'HS256';

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(expireTime)
      .sign(secret)

      return jwt

  }

  async verifyToken(access_token : string) : Promise<IPayload>  {

    try {
      
      const secret = new TextEncoder().encode(process.env.JOSE_SECRET_KEY as string)
  
      const {payload} = await jose.jwtVerify(access_token, secret);
  
      return payload as IPayload

    } catch (error) {
      
      throw new UnauthorizedException('Invalid token')

    }


  }


}






