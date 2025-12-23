import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './audit.model';

@Injectable()
export class AuditService {
    constructor(
        @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLog>,
    ) { }

    async log(data: Partial<AuditLog>): Promise<AuditLog> {
        const newLog = new this.auditLogModel(data);
        return newLog.save();
    }

    async getAllLogs(): Promise<AuditLog[]> {
        return this.auditLogModel.find().sort({ createdAt: -1 }).limit(100).exec();
    }
}
