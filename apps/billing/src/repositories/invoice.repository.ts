import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Invoice } from '../schema/invoice.schema';

@Injectable()
export class InvoiceRepository extends AbstractRepository<Invoice> {
    protected readonly logger = new Logger(InvoiceRepository.name);

    constructor(
        @InjectModel(Invoice.name) invoiceModel: Model<Invoice>,
        @InjectConnection()  connection: Connection,
    ){
        super(invoiceModel, connection);
    }
}