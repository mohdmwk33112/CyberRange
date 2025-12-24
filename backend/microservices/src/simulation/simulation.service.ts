/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { PassThrough } from 'stream';
import { createInterface } from 'readline';
import axios from 'axios';

@Injectable()
export class SimulationService {
    private k8sApi: k8s.CoreV1Api;
    private k8sAppsApi: k8s.AppsV1Api;
    private k8sBatchApi: k8s.BatchV1Api;
    private kc: k8s.KubeConfig;
    private namespace = 'simulations';
    private readonly logger = new Logger(SimulationService.name);

    constructor() {
        this.kc = new k8s.KubeConfig();
        this.kc.loadFromDefault();
        this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
        this.k8sAppsApi = this.kc.makeApiClient(k8s.AppsV1Api);
        this.k8sBatchApi = this.kc.makeApiClient(k8s.BatchV1Api);
    }

    async startSimulation(slug: string): Promise<any> {
        const manifestDir = path.join(process.cwd(), '..', '..', 'sim-containers', 'k8s', slug);
        const manifestPath = path.join(manifestDir, `${slug}-sim.yaml`);

        if (!fs.existsSync(manifestPath)) {
            this.logger.error(`Manifest not found at ${manifestPath}`);
            throw new Error(`Manifest not found for slug: ${slug}`);
        }

        const fileContent = fs.readFileSync(manifestPath, 'utf8');
        const docs = yaml.loadAll(fileContent) as any[];

        // --- NEW: Load FL-IDS manifests to deploy alongside scenario ---
        const flidsManifestPath = path.join(process.cwd(), '..', '..', 'sim-containers', 'k8s', 'fl-ids', 'fl-ids.yaml');
        if (fs.existsSync(flidsManifestPath)) {
            const flidsContent = fs.readFileSync(flidsManifestPath, 'utf8');
            const flidsDocs = yaml.loadAll(flidsContent) as any[];
            docs.push(...flidsDocs);
        }

        for (const doc of docs) {
            if (!doc.metadata) doc.metadata = {};
            if (!doc.metadata.labels) doc.metadata.labels = {};

            // Only set scenario label if it's NOT an fl-ids resource
            if (doc.metadata.labels['cyberrange.io/scenario'] !== 'fl-ids') {
                doc.metadata.labels['cyberrange.io/scenario'] = slug;
            }
            doc.metadata.labels['cyberrange.io/managed-by'] = 'simulation-controller';

            // CRITICAL: Also inject labels into the Pod Template (if it exists)
            if (doc.spec && doc.spec.template) {
                if (!doc.spec.template.metadata) doc.spec.template.metadata = {};
                if (!doc.spec.template.metadata.labels) doc.spec.template.metadata.labels = {};

                if (doc.spec.template.metadata.labels['cyberrange.io/scenario'] !== 'fl-ids') {
                    doc.spec.template.metadata.labels['cyberrange.io/scenario'] = slug;
                }
                doc.spec.template.metadata.labels['cyberrange.io/managed-by'] = 'simulation-controller';

                // --- NEW: Inject IDS Agent Sidecar into Juice Shop Deployment ---
                if (doc.kind === 'Deployment' && (doc.metadata.name.includes('juice-shop') || doc.metadata.name.includes('victim'))) {
                    const containers = doc.spec.template.spec.containers;
                    const hasIdsAgent = containers.some((c: any) => c.name === 'ids-agent');
                    if (!hasIdsAgent) {
                        containers.push({
                            name: 'ids-agent',
                            image: 'local/ids-agent:latest',
                            imagePullPolicy: 'Never',
                            env: [
                                { name: 'IDS_SERVER_URL', value: 'http://fl-ids-service:5000/predict' }
                            ],
                            volumeMounts: [
                                { name: 'data-volume', mountPath: '/data' }
                            ]
                        });
                        this.logger.log(`Injected ids-agent sidecar into deployment ${doc.metadata.name}`);
                    }
                }
            }

            try {
                if (doc.kind === 'Deployment') {
                    // Try to create, if fails try to replace
                    try {
                        await this.k8sAppsApi.createNamespacedDeployment({ namespace: this.namespace, body: doc });
                        this.logger.log(`Created Deployment ${doc.metadata.name}`);
                    } catch (e: any) {
                        if (e.statusCode === 409 || e.code === 409) {
                            // Resource exists, replace it
                            this.logger.log(`Deployment ${doc.metadata.name} already exists, replacing...`);
                            await this.k8sAppsApi.replaceNamespacedDeployment({
                                name: doc.metadata.name,
                                namespace: this.namespace,
                                body: doc
                            });
                            this.logger.log(`Replaced Deployment ${doc.metadata.name}`);
                        } else throw e;
                    }
                } else if (doc.kind === 'Service') {
                    try {
                        await this.k8sApi.createNamespacedService({ namespace: this.namespace, body: doc });
                        this.logger.log(`Created Service ${doc.metadata.name}`);
                    } catch (e: any) {
                        if (e.statusCode === 409 || e.code === 409) {
                            // Resource exists, replace it
                            this.logger.log(`Service ${doc.metadata.name} already exists, replacing...`);
                            // For services, we need to preserve the clusterIP
                            const existing = await this.k8sApi.readNamespacedService({
                                name: doc.metadata.name,
                                namespace: this.namespace
                            });
                            // Preserve clusterIP and resourceVersion
                            if (existing.spec?.clusterIP) {
                                doc.spec.clusterIP = existing.spec.clusterIP;
                            }
                            if (existing.metadata?.resourceVersion) {
                                doc.metadata.resourceVersion = existing.metadata.resourceVersion;
                            }
                            await this.k8sApi.replaceNamespacedService({
                                name: doc.metadata.name,
                                namespace: this.namespace,
                                body: doc
                            });
                            this.logger.log(`Replaced Service ${doc.metadata.name}`);
                        } else throw e;
                    }
                } else if (doc.kind === 'Job') {
                    // Delete existing job if it exists to allow re-run
                    try {
                        await this.k8sBatchApi.deleteNamespacedJob({ name: doc.metadata.name, namespace: this.namespace });
                        this.logger.log(`Deleted existing Job ${doc.metadata.name}`);
                        // Wait a bit for deletion
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (e) { /* ignore */ }
                    await this.k8sBatchApi.createNamespacedJob({ namespace: this.namespace, body: doc });
                    this.logger.log(`Created Job ${doc.metadata.name}`);
                }
            } catch (err: any) {
                this.logger.error(`Error applying ${doc.kind} ${doc.metadata.name}:`, err.message || err);
            }
        }

        return { message: `Simulation ${slug} started` };
    }

    async stopSimulation(slug: string): Promise<any> {
        // Delete Jobs
        await this.k8sBatchApi.deleteCollectionNamespacedJob({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });

        // Scale deployments to 0
        const deployments = await this.k8sAppsApi.listNamespacedDeployment({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });

        for (const deploy of deployments.items) {
            if (deploy.metadata?.name) {
                await this.k8sAppsApi.patchNamespacedDeployment(
                    {
                        name: deploy.metadata.name,
                        namespace: this.namespace,
                        body: [
                            {
                                op: 'replace',
                                path: '/spec/replicas',
                                value: 0,
                            },
                        ],
                    }
                );
            }
        }

        return { message: `Simulation ${slug} stopped` };
    }

    async resetSimulation(slug: string): Promise<any> {
        // Full purge
        await this.k8sBatchApi.deleteCollectionNamespacedJob({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });
        await this.k8sAppsApi.deleteCollectionNamespacedDeployment({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });
        await this.k8sApi.deleteCollectionNamespacedService({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });

        // Wait for cleanup (simple delay for now, proper way is checking status)
        await new Promise(resolve => setTimeout(resolve, 5000));

        return this.startSimulation(slug);
    }

    async getSimulationStatus(slug: string): Promise<any> {
        const jobs = await this.k8sBatchApi.listNamespacedJob({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });

        const deployments = await this.k8sAppsApi.listNamespacedDeployment({
            namespace: this.namespace,
            labelSelector: `cyberrange.io/scenario=${slug}`
        });

        let status = 'UNKNOWN';
        if (jobs.items.length > 0) {
            const job = jobs.items[0];
            if (job.status?.succeeded && job.status.succeeded > 0) status = 'COMPLETED';
            else if (job.status?.failed && job.status.failed > 0) status = 'FAILED';
            else if (job.status?.active && job.status.active > 0) status = 'RUNNING';
        }

        return {
            slug,
            status,
            deployments: deployments.items.map(d => ({
                name: d.metadata?.name,
                replicas: d.status?.replicas,
                readyReplicas: d.status?.readyReplicas
            })),
            jobs: jobs.items.map(j => ({
                name: j.metadata?.name,
                succeeded: j.status?.succeeded
            }))
        };
    }

    async getActiveSimulations(userId: string): Promise<any[]> {
        // For strict ownership, we should have labeled resources with userId
        // For now, listing all running simulations as a mockup or based on namespace
        // Ideally, ScenarioState in Mongo holds the source of truth for "active" sessions per user
        // But if we want runtime k8s state:
        const jobs = await this.k8sBatchApi.listNamespacedJob({
            namespace: this.namespace,
        });

        // Filter for active ones and map to structure
        const activeSims: any[] = [];
        for (const job of jobs.items) {
            if (job.status?.active && job.status.active > 0) {
                activeSims.push({
                    _id: job.metadata?.uid,
                    scenarioName: job.metadata?.labels?.['cyberrange.io/scenario'] || 'Unknown',
                    status: 'Running',
                    startedAt: job.metadata?.creationTimestamp
                });
            }
        }
        return activeSims;
    }

    async streamSimulationLogs(slug: string, callback: (log: any) => void) {
        return this.streamLogsInternal(slug, 'attacker', callback);
    }

    async streamVictimLogs(slug: string, callback: (log: any) => void) {
        return this.streamLogsInternal(slug, 'victim', callback);
    }

    private async streamLogsInternal(slug: string, perspective: 'attacker' | 'victim', callback: (log: any) => void) {
        try {
            this.logger.log(`Stream logs requested for scenario: ${slug} (perspective: ${perspective})`);
            const response = await this.k8sApi.listNamespacedPod({ namespace: this.namespace } as any);
            const items = (response as any).items || (response as any).body?.items || [];

            let targetPod = items.find((p: any) => {
                const podLabels = p.metadata?.labels || {};
                const isScenario = podLabels['cyberrange.io/scenario'] === slug;

                const matchesPerspective = perspective === 'attacker'
                    ? (p.metadata?.name?.includes('attacker') || p.spec?.containers?.some((c: any) => c.name === 'attacker'))
                    : (p.metadata?.name?.includes('juice-shop') || p.metadata?.name?.includes('victim') || p.spec?.containers?.some((c: any) => c.name === 'juice-shop'));

                // For logs, we might want to see them even if not fully 'Running' (e.g. if one container is failing)
                // However, we need the container to have started. Pod phase 'Running' is usually what we want.
                // But let's be more lenient and allow 'Running' or 'Pending' if we want to see startup logs.
                const isRunning = p.status?.phase === 'Running' || p.status?.phase === 'Pending';

                return isScenario && matchesPerspective && isRunning;
            });

            if (!targetPod) {
                this.logger.warn(`No ${perspective} pod found for slug ${slug} in phase Running/Pending. Found ${items.length} pods total in namespace.`);
                // Log all pods for debugging
                items.forEach((p: any) => {
                    this.logger.debug(`Pod: ${p.metadata?.name}, Labels: ${JSON.stringify(p.metadata?.labels)}, Phase: ${p.status?.phase}`);
                });
                return;
            }

            const containersToStream = perspective === 'attacker' ? ['attacker'] : ['juice-shop', 'ids-agent'];

            for (const containerName of containersToStream) {
                // Verify container exists in pod spec
                if (!targetPod.spec.containers.some((c: any) => c.name === containerName)) {
                    continue;
                }

                this.logger.log(`Starting log stream for pod ${targetPod.metadata.name} container ${containerName}`);

                const logStream = new k8s.Log(this.kc);
                const passThrough = new PassThrough();

                const rl = createInterface({
                    input: passThrough,
                    terminal: false
                });

                rl.on('line', (line) => {
                    if (!line.trim()) return;
                    try {
                        const jsonLog = JSON.parse(line);
                        // Tag IDS logs for easier frontend processing if they came from ids-agent
                        if (containerName === 'ids-agent' || jsonLog.type?.includes('ids')) {
                            jsonLog.perspective = 'victim';
                            if (!jsonLog.type) jsonLog.type = 'ids-alert';
                        }
                        callback(jsonLog);
                    } catch (e) {
                        callback({ type: 'stdout', message: line, timestamp: Date.now() / 1000, perspective, container: containerName });
                    }
                });

                logStream.log(
                    this.namespace,
                    targetPod.metadata.name,
                    containerName,
                    passThrough,
                    { follow: true, tailLines: 50, pretty: false, timestamps: false }
                ).catch(err => {
                    this.logger.error(`Log stream error for ${containerName}: ${err.message}`);
                });
            }

        } catch (e) {
            this.logger.error(`Error streaming logs: ${e}`);
        }
    }

    async getClusterHealth(): Promise<any[]> {
        try {
            this.logger.log(`Fetching cluster health for namespace: ${this.namespace}`);
            const response = await this.k8sApi.listNamespacedPod({
                namespace: this.namespace
            });

            const items = response.items?.filter((p: any) => p.status?.phase !== 'Succeeded') || [];
            this.logger.log(`Successfully fetched ${items.length} active pods`);

            return items.map((pod: any) => ({
                name: pod.metadata?.name,
                status: pod.status?.phase,
                image: pod.spec?.containers[0]?.image,
                restarts: pod.status?.containerStatuses ? pod.status.containerStatuses[0].restartCount : 0,
                creationTimestamp: pod.metadata?.creationTimestamp,
                labels: pod.metadata?.labels,
                ready: pod.status?.containerStatuses ? pod.status.containerStatuses.every((s: any) => s.ready) : false
            }));
        } catch (e: any) {
            this.logger.error(`Error getting cluster health: ${e.message || e}`);
            if (e.body) {
                this.logger.error(`K8s Error Details: ${JSON.stringify(e.body)}`);
            }
            throw e;
        }
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
                this.logger.log(`[SimulationService] Calling IDS: ${url}`);
                const response = method === 'post'
                    ? await axios.post(url, data, { timeout: 10000 })
                    : await axios.get(url, { timeout: 10000 });
                return response.data;
            } catch (error) {
                this.logger.warn(`[SimulationService] Failed ${baseUrl}: ${error.message}`);
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
        return this.callIDSService('/readyz', 'get');
    }

    async getVictimHealthDetailed(slug: string): Promise<any> {
        try {
            const response = await this.k8sApi.listNamespacedPod({
                namespace: this.namespace,
                labelSelector: `cyberrange.io/scenario=${slug}`
            } as any);

            const pods = (response as any).items || (response as any).body?.items || [];
            const victimPod = pods.find((p: any) => p.metadata?.name?.includes('juice-shop'));

            if (!victimPod) {
                return { status: 'unhealthy', message: 'Victim pod not found' };
            }

            const containerStatus = victimPod.status?.containerStatuses?.find((c: any) => c.name === 'juice-shop');

            return {
                status: victimPod.status?.phase === 'Running' && containerStatus?.ready ? 'healthy' : 'degraded',
                podName: victimPod.metadata?.name,
                phase: victimPod.status?.phase,
                restarts: containerStatus?.restartCount || 0,
                ready: containerStatus?.ready || false,
                creationTimestamp: victimPod.metadata?.creationTimestamp,
            };
        } catch (error: any) {
            this.logger.error(`Error getting victim health: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }

    async getServiceHealth(slug: string): Promise<any> {
        const urls = [
            `http://juice-shop-${slug}.simulations.svc.cluster.local:3000`, // Cluster internal
            `http://localhost:3000`, // Local development (if running standalone)
        ];

        let lastError = null;
        for (const url of urls) {
            try {
                this.logger.log(`[SimulationService] Checking health for ${slug} at ${url}`);
                const response = await axios.get(`${url}/readyz`, { timeout: 3000 });
                return {
                    status: 'healthy',
                    service: slug,
                    url: url,
                    message: 'Service is reachable'
                };
            } catch (error: any) {
                this.logger.warn(`[SimulationService] Health check failed for ${url}: ${error.message}`);
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
}
