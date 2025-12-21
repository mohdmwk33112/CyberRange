/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ScenarioService } from './scenario.service';

@Controller()
export class ScenarioController {
    constructor(private readonly scenarioService: ScenarioService) { }

    @MessagePattern({ cmd: 'create-scenario' })
    createScenario(scenarioData: any) {
        return this.scenarioService.createScenario(scenarioData);
    }

    @MessagePattern({ cmd: 'get-scenarios' })
    getAllScenarios() {
        return this.scenarioService.getAllScenarios();
    }

    @MessagePattern({ cmd: 'get-scenario' })
    getScenarioById(id: string) {
        return this.scenarioService.getScenarioById(id);
    }

    @MessagePattern({ cmd: 'validate-terminal-command' })
    validateTerminalCommand(payload: { userId: string; scenarioId: string; command: string }) {
        return this.scenarioService.validateTerminalCommand(
            payload.userId,
            payload.scenarioId,
            payload.command,
        );
    }

    @MessagePattern({ cmd: 'validate-web-action' })
    validateWebAction(payload: { userId: string; scenarioId: string; action: any }) {
        return this.scenarioService.validateWebAction(
            payload.userId,
            payload.scenarioId,
            payload.action,
        );
    }

    @MessagePattern({ cmd: 'get-scenario-state' })
    getUserScenarioState(payload: { userId: string; scenarioId: string }) {
        return this.scenarioService.getUserScenarioState(
            payload.userId,
            payload.scenarioId,
        );
    }

    @MessagePattern({ cmd: 'update-scenario-state' })
    updateScenarioState(payload: { userId: string; scenarioId: string; data: any }) {
        return this.scenarioService.updateScenarioState(
            payload.userId,
            payload.scenarioId,
            payload.data,
        );
    }

    @MessagePattern({ cmd: 'complete-scenario' })
    completeScenario(payload: { userId: string; scenarioId: string }) {
        return this.scenarioService.completeScenario(
            payload.userId,
            payload.scenarioId,
        );
    }

    @MessagePattern({ cmd: 'start-scenario' })
    startScenario(payload: { scenarioId: string }) {
        return this.scenarioService.startScenario(payload.scenarioId);
    }

    @MessagePattern({ cmd: 'stop-scenario' })
    stopScenario(payload: { scenarioId: string }) {
        return this.scenarioService.stopScenario(payload.scenarioId);
    }

    @MessagePattern({ cmd: 'reset-scenario' })
    resetScenario(payload: { scenarioId: string }) {
        return this.scenarioService.resetScenario(payload.scenarioId);
    }

    @MessagePattern({ cmd: 'get-scenario-runtime-status' })
    getScenarioRuntimeStatus(payload: { scenarioId: string }) {
        return this.scenarioService.getScenarioRuntimeStatus(payload.scenarioId);
    }
}
