import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrderRepository } from './order.repository';
import { BILING_SERVICE } from './constants/servises';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo: OrderRepository,
    @Inject(BILING_SERVICE) private billingClient: ClientProxy,
  ) {}

  async createOrder(request: CreateOrderRequest, authentication:string) {
    const session = await this.orderRepo.startTransaction();
    try {
      const order = await this.orderRepo.create(request, { session });
      await lastValueFrom(
        this.billingClient.emit('order_created', {
          request,
          Authentication:authentication
        }),
      );
      await session.commitTransaction();
      return order
    } catch (err) {
      await session.abortTransaction();
      throw err;
    }
  }

  async getOrder() {
    return await this.orderRepo.find({});
  }
}
