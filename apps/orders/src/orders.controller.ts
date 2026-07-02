import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderRequest } from './dto/create-order.request';
import { JwtAuthGuard } from '@app/common';
import { IdempotencyGuard } from './guards/idempotency.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, IdempotencyGuard)
  async createOrder(@Body() request: CreateOrderRequest, @Req() req: any) {
    return await this.ordersService.createOrder(
      request,
      req.user.userId,
      req.idempotencyKey,
    );
  }

  @Get()
  async getOrder() {
    return this.ordersService.getOrder();
  }
}
