import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    ip: string;

    @Prop({ required: true })
    status: 'SUCCESS' | 'FAILURE';

    @Prop()
    userAgent: string;

    @Prop()
    details: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
