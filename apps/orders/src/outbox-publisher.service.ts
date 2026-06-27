import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';

import { OutboxEvent, OutboxStatus } from './schema/outbox.schema';
import { BILING_SERVICE } from './constants/servises';

@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(
    @InjectModel(OutboxEvent.name)
    private readonly outboxModel: Model<OutboxEvent>,

    @Inject(BILING_SERVICE)
    private readonly billingClient: ClientProxy,
  ) {}

  @Interval(5000)
  async publishPendingEvents() {
    const event = await this.outboxModel.findOneAndUpdate(
      {
        status: OutboxStatus.PENDING,
        retryCount: { $lt: 3 },
      },
      {
        $set: {
          status: OutboxStatus.PROCESSING,
        },
      },
      {
        $sort: { createdAt: 1 },
        new: true,
      },
    );

    if (!event) {
      return;
    }

    try {
      await lastValueFrom(
        this.billingClient.emit(event.eventType, event.payload),
      );

      await this.outboxModel.updateOne(
        { _id: event._id },
        {
          $set: {
            status: OutboxStatus.PUBLISHED,
            publishedAt: new Date(),
            errorMessage: null,
          },
        },
      );
      this.logger.log(`Published outbox event: ${event._id}`);
    } catch (err) {
      const nextRetryCount = event.retryCount + 1;

      await this.outboxModel.updateOne(
        { _id: event._id },
        {
          $set: {
            status:
              nextRetryCount >= 3 ? OutboxStatus.FAILED : OutboxStatus.PENDING,
            errorMessage: err.message,
          },
          $inc: {
            retryCount: 1,
          },
        },
      );

      this.logger.error(`Failed to publish outbox event: ${event._id}`);
    }
  }
}
