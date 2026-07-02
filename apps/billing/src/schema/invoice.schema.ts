import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

export enum InvoiceStatus {
  ISSUED   = 'ISSUED',   
  PAID     = 'PAID',    
  FAILED   = 'FAILED',  
  VOID     = 'VOID',     
}

@Schema({ versionKey: false, timestamps: true, collection: 'invoices' })
export class Invoice extends AbstractDocument {

  @Prop({ required: true, unique: true, index: true })
  orderId: string;      

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  description: string;   

  @Prop({
    type: String,
    enum: InvoiceStatus,
    default: InvoiceStatus.ISSUED,
  })
  status: InvoiceStatus;

  @Prop({ type: String, default: null })
  failureReason?: string | null;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);