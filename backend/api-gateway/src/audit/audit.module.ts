import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

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
    controllers: [AuditController],
    providers: [AuditService],
})
export class AuditModule { }
