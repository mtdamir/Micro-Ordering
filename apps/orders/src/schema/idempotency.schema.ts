import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type IdempotencyDocument  = HydratedDocument<IdempotencyRecord>

@Schema({
    versionKey: false,
    timestamps: true,
    collection: 'idempotency_records',
})
export class IdempotencyRecord{
    @Prop({ required: true, unique: true, index: true })
    idempotencyKey: string;

    @Prop({ required: true })
    userId: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    responseBody: Record<string, any>;

    @Prop({type: Date, expires: 86400})
    createdAt: Date;

}

export const IdempotencyRecordSchema  = SchemaFactory.createForClass(IdempotencyRecord)