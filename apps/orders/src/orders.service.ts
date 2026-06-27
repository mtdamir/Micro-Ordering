import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrderRepository } from './order.repository';
import { BILING_SERVICE } from './constants/servises';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { OutboxEvent, OutboxStatus } from './schema/outbox.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo: OrderRepository,

    @InjectModel(OutboxEvent.name)
    private outboxModel: Model<OutboxEvent>,
  ) {}

  async createOrder(request: CreateOrderRequest, userId: string) {
    const session = await this.orderRepo.startTransaction();

    try {
      const order = await this.orderRepo.create(request, { session });

      await this.outboxModel.create(
        [
          {
            eventType: 'order_created',
            aggregateType: 'Order',
            aggregateId: order._id.toString(),
            payload: {
              orderId: order._id.toString(),
              userId,
              request,
            },
            status: OutboxStatus.PENDING,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return order;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async getOrder() {
    return await this.orderRepo.find({});
  }
}
