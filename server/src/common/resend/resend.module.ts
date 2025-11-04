import { Module } from '@nestjs/common';
import { ResendProvider } from './resend.provider';
import { ResendService } from './resend.service';

@Module({
    providers : [ResendProvider, ResendService],
    exports : [ResendService]
})

export class ResendModule {}
