import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IdempotencyRecord } from '../schema/idempotency.schema';


@Injectable()
export class IdempotencyGuard  implements CanActivate {
    constructor(
        @InjectModel(IdempotencyRecord.name)
        private readonly idempotencyModel: Model<IdempotencyRecord>
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const idempotencyKey = request.headers['idempotency-key'];

        if(!idempotencyKey){
            throw new ConflictException('Idempotency key is required');
        }


        const existing = await this.idempotencyModel.findOne({
            idempotencyKey,
            userId: request.user?.userId
        });

        if(existing){
            const response = context.switchToHttp().getResponse();
            response.status(200).json(existing.responseBody);
            return false
        }

        request.idempotencyKey = idempotencyKey;
        return true;
    }
}