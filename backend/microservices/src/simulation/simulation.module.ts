/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { SimulationGateway } from './simulation.gateway';

@Module({
    controllers: [SimulationController],
    providers: [SimulationService, SimulationGateway],
    exports: [SimulationService],
})
export class SimulationModule { }
