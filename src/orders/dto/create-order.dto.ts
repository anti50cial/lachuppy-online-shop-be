import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { InitializePaymentDto } from './initialize-payment.dto';

export class CreateOrderDto extends InitializePaymentDto {
  @IsString()
  @IsNotEmpty()
  txreference: string;
  @Transform(() => Number)
  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;
  @ArrayNotEmpty()
  @IsArray()
  @IsDefined()
  orderItems: {
    priceAtPurchase: number;
    dishId: string;
    quantity: number;
  }[];
}
