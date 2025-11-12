import { Module } from '@nestjs/common';
import { RegexService } from '../helpers/regex.service';
import { JwtService } from '../helpers/jwt.service';
import { BcryptService } from '../helpers/bcrypt.service';

@Module({
    exports : [
        RegexService,
        JwtService,
        BcryptService
    ],
    providers : [
        RegexService,
        JwtService,
        BcryptService
    ]
})
export class SharedModule {}
