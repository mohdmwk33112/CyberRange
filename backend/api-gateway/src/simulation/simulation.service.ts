import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SimulationService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async startSimulation(slug: string): Promise<any> {
        return this.client.send({ cmd: 'start-simulation' }, { slug }).toPromise();
    }

    async getIDSPrediction(data: any): Promise<any> {
        return this.client.send({ cmd: 'ids-prediction' }, { data }).toPromise();
    }

    async getIDSHealth(): Promise<any> {
        return this.client.send({ cmd: 'get-ids-health' }, {}).toPromise();
    }

    async getServiceHealth(slug: string): Promise<any> {
        return this.client.send({ cmd: 'get-service-health' }, { slug }).toPromise();
    }

    async stopSimulation(slug: string): Promise<any> {
        return this.client.send({ cmd: 'stop-simulation' }, { slug }).toPromise();
    }

    async resetSimulation(slug: string): Promise<any> {
        return this.client.send({ cmd: 'reset-simulation' }, { slug }).toPromise();
    }

    async getSimulationStatus(slug: string): Promise<any> {
        return this.client.send({ cmd: 'get-simulation-status' }, { slug }).toPromise();
    }

    async getActiveSimulations(userId: string): Promise<any> {
        return this.client.send({ cmd: 'get-active-simulations' }, { userId }).toPromise();
    }

    async getClusterHealth(): Promise<any> {
        return this.client.send({ cmd: 'get-cluster-health' }, {}).toPromise();
    }
}
