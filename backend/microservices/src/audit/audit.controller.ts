import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuditService } from './audit.service';

@Controller()
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @MessagePattern({ cmd: 'get-audit-logs' })
    async getAuditLogs() {
        return this.auditService.getAllLogs();
    }

    @MessagePattern({ cmd: 'create-audit-log' })
    async createLog(@Payload() data: any) {
        return this.auditService.log(data);
    }
}
