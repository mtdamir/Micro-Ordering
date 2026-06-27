import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type OutboxEventDocument = HydratedDocument<OutboxEvent>;

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

@Schema({
  versionKey: false,
  timestamps: true,
  collection: 'outbox_events',
})
export class OutboxEvent {
  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true, default: 'Order' })
  aggregateType: string;

  @Prop({ required: true })
  aggregateId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload: Record<string, any>;

  @Prop({
    type: String,
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
    index: true,
  })
  status: OutboxStatus;

  @Prop({ type: Number, default: 0 })
  retryCount: number;

  @Prop({ type: String, default: null })
  errorMessage?: string | null;

  @Prop({ type: Date, default: null })
  publishedAt?: Date | null;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEvent);

OutboxEventSchema.index({ status: 1, createdAt: 1 });
OutboxEventSchema.index({ aggregateId: 1, eventType: 1 });