/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { SimulationService } from './simulation.service';

@Controller()
export class SimulationController {
    constructor(private readonly simulationService: SimulationService) { }

    @MessagePattern({ cmd: 'start-simulation' })
    startSimulation(payload: { slug: string }) {
        return this.simulationService.startSimulation(payload.slug);
    }

    @MessagePattern({ cmd: 'stop-simulation' })
    stopSimulation(payload: { slug: string }) {
        return this.simulationService.stopSimulation(payload.slug);
    }

    @MessagePattern({ cmd: 'reset-simulation' })
    resetSimulation(payload: { slug: string }) {
        return this.simulationService.resetSimulation(payload.slug);
    }

    @MessagePattern({ cmd: 'get-simulation-status' })
    getSimulationStatus(payload: { slug: string }) {
        return this.simulationService.getSimulationStatus(payload.slug);
    }

    @MessagePattern({ cmd: 'get-active-simulations' })
    getActiveSimulations(payload: { userId: string }) {
        return this.simulationService.getActiveSimulations(payload.userId);
    }
}
