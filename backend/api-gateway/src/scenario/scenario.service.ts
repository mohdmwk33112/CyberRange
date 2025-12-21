/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ScenarioService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async createScenario(scenarioData: any): Promise<any> {
        return this.client.send({ cmd: 'create-scenario' }, scenarioData).toPromise();
    }

    async getAllScenarios(): Promise<any> {
        return this.client.send({ cmd: 'get-scenarios' }, {}).toPromise();
    }

    async getScenarioById(id: string): Promise<any> {
        return this.client.send({ cmd: 'get-scenario' }, id).toPromise();
    }

    async validateTerminalCommand(
        userId: string,
        scenarioId: string,
        command: string,
    ): Promise<any> {
        return this.client
            .send({ cmd: 'validate-terminal-command' }, { userId, scenarioId, command })
            .toPromise();
    }

    async validateWebAction(
        userId: string,
        scenarioId: string,
        action: any,
    ): Promise<any> {
        return this.client
            .send({ cmd: 'validate-web-action' }, { userId, scenarioId, action })
            .toPromise();
    }

    async getUserScenarioState(userId: string, scenarioId: string): Promise<any> {
        return this.client
            .send({ cmd: 'get-scenario-state' }, { userId, scenarioId })
            .toPromise();
    }

    async updateScenarioState(
        userId: string,
        scenarioId: string,
        data: any,
    ): Promise<any> {
        return this.client
            .send({ cmd: 'update-scenario-state' }, { userId, scenarioId, data })
            .toPromise();
    }

    async completeScenario(userId: string, scenarioId: string): Promise<any> {
        return this.client
            .send({ cmd: 'complete-scenario' }, { userId, scenarioId })
            .toPromise();
    }

    async startScenario(scenarioId: string): Promise<any> {
        return this.client.send({ cmd: 'start-scenario' }, { scenarioId }).toPromise();
    }

    async stopScenario(scenarioId: string): Promise<any> {
        return this.client.send({ cmd: 'stop-scenario' }, { scenarioId }).toPromise();
    }

    async resetScenario(scenarioId: string): Promise<any> {
        return this.client.send({ cmd: 'reset-scenario' }, { scenarioId }).toPromise();
    }

    async getScenarioRuntimeStatus(scenarioId: string): Promise<any> {
        return this.client.send({ cmd: 'get-scenario-runtime-status' }, { scenarioId }).toPromise();
    }
}
