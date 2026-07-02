import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { RmqModule, AuthModule, DatabaseModule } from '@app/common'; // ← DatabaseModule اضافه شد
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schema/invoice.schema';
import { InvoiceRepository } from './repositories/invoice.repository';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/billing/.env',
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(), // ← اضافه شد
        RMQ_URL: Joi.string().required(),
        RMQ_QUEUE_BILLING_QUEUE: Joi.string().required(),
        RABBIT_MQ_AUTH_QUEUE: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    RmqModule,
    AuthModule,
  ],
  controllers: [BillingController],
  providers: [BillingService, InvoiceRepository],
})
export class BillingModule {}
