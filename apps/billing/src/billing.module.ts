import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import {RmqModule} from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/billing/.env',
      validationSchema: Joi.object({
        RMQ_URL: Joi.string().required(),
        RMQ_QUEUE_BILLING_QUEUE: Joi.string().required(),
      })
    }),
    RmqModule
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
