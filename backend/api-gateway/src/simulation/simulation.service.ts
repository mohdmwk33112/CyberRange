import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import axios from 'axios';

@Injectable()
export class SimulationService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async startSimulation(slug: string): Promise<any> {
        return this.client.send({ cmd: 'start-simulation' }, { slug }).toPromise();
    }

    private async callIDSService(path: string, method: 'get' | 'post', data?: any): Promise<any> {
        const urls = [
            process.env.IDS_SERVICE_URL, // Explicitly set via Env
            'http://localhost:5005',     // Local port-forwarding fallback
            'http://localhost:5000',     // Local development fallback (Flask default)
            'http://fl-ids-service.simulations.svc.cluster.local' // Internal cluster URL
        ].filter(Boolean);

        let lastError = null;

        for (const baseUrl of urls) {
            try {
                const url = `${baseUrl}${path}`;
                console.log(`[SimulationService] Calling IDS: ${url}`);
                const response = method === 'post'
                    ? await axios.post(url, data, { timeout: 10000 })
                    : await axios.get(url, { timeout: 10000 });
                return response.data;
            } catch (error) {
                console.warn(`[SimulationService] Failed ${baseUrl}: ${error.message}`);
                lastError = error;
                // Continue to next URL if this one fails
            }
        }

        return {
            status: 'error',
            message: `Failed to connect to IDS service. If running locally, ensure you have port-forwarded the service: 'kubectl port-forward svc/fl-ids-service 5005:80 -n simulations'`,
            error: lastError?.message,
            tried_urls: urls
        };
    }

    async getIDSPrediction(data: any): Promise<any> {
        return this.callIDSService('/predict', 'post', data);
    }

    async getIDSHealth(): Promise<any> {
        return this.callIDSService('/healthz', 'get');
    }

    async getServiceHealth(slug: string): Promise<any> {
        const urls = [
            `http://juice-shop-${slug}.simulations.svc.cluster.local:3000`, // Cluster internal
            `http://localhost:3000`, // Local development (if running standalone)
        ];

        let lastError = null;
        for (const url of urls) {
            try {
                console.log(`[SimulationService] Checking health for ${slug} at ${url}`);
                const response = await axios.get(url, { timeout: 3000 });
                return {
                    status: 'healthy',
                    service: slug,
                    url: url,
                    message: 'Service is reachable'
                };
            } catch (error) {
                console.warn(`[SimulationService] Health check failed for ${url}: ${error.message}`);
                lastError = error;
            }
        }

        return {
            status: 'unhealthy',
            service: slug,
            error: lastError?.message,
            tried_urls: urls
        };
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
