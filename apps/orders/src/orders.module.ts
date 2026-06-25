import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import {DatabaseModule} from '@app/common'
import * as Joi from 'joi'
import { MongooseModule } from '@nestjs/mongoose';
import {Order,OrderSchema} from './schema/order.schema'
import { OrderRepository } from './order.repository';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    validationSchema: Joi.object({
      MONGO_URI: Joi.string().required(),
      PORT: Joi.number().required()
    }),
    envFilePath: './apps/orders/.env',
  }),
  DatabaseModule,
  MongooseModule.forFeature([{name:Order.name,schema:OrderSchema}])
],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository],
})
export class OrdersModule {}
