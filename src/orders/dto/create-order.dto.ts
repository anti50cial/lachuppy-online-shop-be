import { InitializePaymentDto } from './initialize-payment.dto';

export class CreateOrderDto extends InitializePaymentDto {
  txreference: string;
  totalPrice: number;
  orderItems: {
    priceAtPurchase: number;
    dishId: string;
    quantity: number;
  }[];
}
