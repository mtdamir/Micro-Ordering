import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, RmqModule, AuthModule } from '@app/common';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';
import { OrderRepository } from './order.repository';
import { BILING_SERVICE } from './constants/servises';
import { OutboxEvent, OutboxEventSchema } from './schema/outbox.schema';
import{ScheduleModule } from '@nestjs/schedule'
import { OutboxPublisherService } from './outbox-publisher.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/orders/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OutboxEvent.name, schema: OutboxEventSchema },
    ]),

    RmqModule.register({
      name: BILING_SERVICE,
    }),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository, OutboxPublisherService],
})
export class OrdersModule {}
