/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScenarioController } from './scenario.controller';
import { ScenarioService } from './scenario.service';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'Microservices-services',
                transport: Transport.TCP,
                options: { port: 3000 },
            },
        ]),
    ],
    controllers: [ScenarioController],
    providers: [ScenarioService],
    exports: [ScenarioService],
})
export class ScenarioModule { }
