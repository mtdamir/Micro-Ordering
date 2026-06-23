import { Logger, NotFoundException } from '@nestjs/common';
import {
  QueryFilter,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
} from 'mongoose';

import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument>{
    protected abstract readonly logger: Logger;

    constructor(
        protected readonly model: Model<TDocument>,
        private readonly connection: Connection,
    ){}

    async create (document: Omit<TDocument, '_id'>, options?: SaveOptions): Promise<TDocument>{
        const createDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (
            await createDocument.save(options)
        ).toJSON() as unknown as TDocument;
    }


    async findOne(filter: QueryFilter<TDocument>): Promise<TDocument>{
        const document = await this.model.findOne(filter, {}, {lean:true});

        if(!document){
            this.logger.warn('Document not found with filterQuery', filter);
            throw new NotFoundException('Document not found.');
        }

        return document;
    }


    async findOneAndUpdate(filter: QueryFilter<TDocument>, update: UpdateQuery<TDocument>){
        const document = await this.model.findOneAndUpdate(filter, update, {
            lean: true,
            new: true,
        });

        if (!document) {
            this.logger.warn(`Document not found with filterQuery:`, filter);
            throw new NotFoundException('Document not found.');
        }

        return document;
    }



    async upsert(filter: QueryFilter<TDocument>, document: Partial<TDocument>){
        return this.model.findOneAndUpdate(filter, document, {
            lean: true,
            upsert: true,
            new: true,
        });
    }


    async find(filter: QueryFilter<TDocument>){
        return this.model.find(filter, {}, { lean: true });
    }


    async startTransaction(){
        const session = await this.connection.startSession();
        session.startTransaction();
        return session
    }

}