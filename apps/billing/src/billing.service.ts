import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InvoiceRepository } from './repositories/invoice.repository';
import { InvoiceStatus } from './schema/invoice.schema';
import {BillDto} from './dto/bill.dto'

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)

  constructor(
    private readonly invoiceRepository: InvoiceRepository
  ){}

  async bill( data: any) {
    const { orderId, userId, request } = data;

    const existing =  await this.findExistingInvoice(orderId);

    if (existing) {
      this.logger.warn(
        `Duplicate event for orderId=${orderId} — invoice already exists, skipping.`,
      );
      return existing;
    }


    try{
      const invoice = await this.invoiceRepository.create({
        orderId,
        userId,
        amount: request.price,
        description: `Order: ${request.name}`,
        status: InvoiceStatus.ISSUED,
      });

      this.logger.log(
        `Invoice created: invoiceId=${invoice._id}, orderId=${orderId}, amount=${request.price}`,
      );

      return invoice;

    }catch(err:any){
      if (err.code === 11000) {
        this.logger.warn(
          `Race condition detected for orderId=${orderId} — invoice already created.`,
        );
        return;
      }

      this.logger.error(
        `Failed to create invoice for orderId=${orderId}: ${err.message}`,
      );
      throw err;
    }


  }

  async findExistingInvoice(orderId: string){
    try{
      return await this.invoiceRepository.findOne({orderId});
    }catch(err){
      return null;
    }
  }

}
