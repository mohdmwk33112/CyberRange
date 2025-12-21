/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'Microservices-services',
                transport: Transport.TCP,
                options: { port: 3011 },
            },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule { }
