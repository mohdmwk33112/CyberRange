/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';

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
    controllers: [SimulationController],
    providers: [SimulationService],
    exports: [SimulationService],
})
export class SimulationModule { }
