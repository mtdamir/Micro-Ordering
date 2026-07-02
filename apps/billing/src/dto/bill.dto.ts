import { IsNotEmpty, IsPhoneNumber, IsPositive, IsString } from "class-validator";

export class BillDto  {

    @IsNotEmpty()
    @IsString()
    orderId: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    request: string;
}