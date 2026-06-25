import { Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo: OrderRepository
  ){}

  async createOrder(request: CreateOrderRequest){
    return await this.orderRepo.create(request)
  }

  async getOrder(){
    return await this.orderRepo.find({})
  }
}
