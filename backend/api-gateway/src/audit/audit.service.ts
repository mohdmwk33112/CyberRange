import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuditService {
    constructor(
        @Inject('Microservices-services') private readonly client: ClientProxy,
    ) { }

    async getLogs() {
        return this.client.send({ cmd: 'get-audit-logs' }, {}).toPromise();
    }
}
