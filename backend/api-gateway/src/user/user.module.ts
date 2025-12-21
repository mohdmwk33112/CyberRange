/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule { }
