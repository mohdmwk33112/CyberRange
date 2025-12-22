/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';

@Controller('simulations')
export class SimulationController {
    constructor(private readonly simulationService: SimulationService) { }

    @Post(':slug/start')
    async startSimulation(@Param('slug') slug: string) {
        return this.simulationService.startSimulation(slug);
    }

    @Post(':slug/stop')
    async stopSimulation(@Param('slug') slug: string) {
        return this.simulationService.stopSimulation(slug);
    }

    @Post('ids/predict')
    async predictIDS(@Body() features: any) {
        return this.simulationService.getIDSPrediction(features);
    }

    @Get('ids/healthz')
    async getIDSHealth() {
        return this.simulationService.getIDSHealth();
    }

    @Get(':slug/healthz')
    async getServiceHealth(@Param('slug') slug: string) {
        return this.simulationService.getServiceHealth(slug);
    }

    @Post(':slug/reset')
    async resetSimulation(@Param('slug') slug: string) {
        return this.simulationService.resetSimulation(slug);
    }

    @Get(':slug/status')
    async getSimulationStatus(@Param('slug') slug: string) {
        return this.simulationService.getSimulationStatus(slug);
    }

    @Get('user/:userId/active')
    async getActiveSimulations(@Param('userId') userId: string) {
        return this.simulationService.getActiveSimulations(userId);
    }
}
