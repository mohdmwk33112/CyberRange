/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

@Injectable()
export class SimulationService {
    private k8sApi: k8s.CoreV1Api;
    private k8sAppsApi: k8s.AppsV1Api;
    private k8sBatchApi: k8s.BatchV1Api;
    private namespace = 'simulations';
    private readonly logger = new Logger(SimulationService.name);

    constructor() {
        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
        this.k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
        this.k8sBatchApi = kc.makeApiClient(k8s.BatchV1Api);
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

        for (const doc of docs) {
            if (!doc) continue;
            if (!doc.metadata) doc.metadata = {};
            if (!doc.metadata.labels) doc.metadata.labels = {};
            doc.metadata.labels['cyberrange.io/scenario'] = slug;
            doc.metadata.labels['cyberrange.io/managed-by'] = 'simulation-controller';

            try {
                if (doc.kind === 'Deployment') {
                    // Try to create, if fails try to patch
                    try {
                        await this.k8sAppsApi.createNamespacedDeployment({ namespace: this.namespace, body: doc });
                    } catch (e) {
                        if (e.code === 409) {
                            await this.k8sAppsApi.patchNamespacedDeployment(
                                {
                                    name: doc.metadata.name,
                                    namespace: this.namespace,
                                    body: [
                                        { op: 'replace', path: '/spec/replicas', value: doc.spec?.replicas || 1 },
                                        { op: 'add', path: '/metadata/labels/cyberrange.io~1scenario', value: slug },
                                        { op: 'add', path: '/metadata/labels/cyberrange.io~1managed-by', value: 'simulation-controller' }
                                    ],
                                },
                            );
                        } else throw e;
                    }
                } else if (doc.kind === 'Service') {
                    try {
                        await this.k8sApi.createNamespacedService({ namespace: this.namespace, body: doc });
                    } catch (e) {
                        if (e.code === 409) {
                            await this.k8sApi.patchNamespacedService(
                                {
                                    name: doc.metadata.name,
                                    namespace: this.namespace,
                                    body: [
                                        { op: 'add', path: '/metadata/labels/cyberrange.io~1scenario', value: slug },
                                        { op: 'add', path: '/metadata/labels/cyberrange.io~1managed-by', value: 'simulation-controller' }
                                    ],
                                },
                            );
                        } else throw e;
                    }
                } else if (doc.kind === 'Job') {
                    // Delete existing job if it exists to allow re-run
                    try {
                        await this.k8sBatchApi.deleteNamespacedJob({ name: doc.metadata.name, namespace: this.namespace });
                        // Wait a bit for deletion
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (e) { /* ignore */ }
                    await this.k8sBatchApi.createNamespacedJob({ namespace: this.namespace, body: doc });
                }
            } catch (err) {
                this.logger.error(`Error applying ${doc.kind} ${doc.metadata.name}:`, err.body || err);
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
                    },
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
}
