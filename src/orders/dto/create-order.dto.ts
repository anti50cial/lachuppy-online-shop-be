import { InitializePaymentDto } from './initialize-payment.dto';

export class CreateOrderDto extends InitializePaymentDto {
  txreference: string;
  totalPrice: number;
  orderItems: {
    priceAtPurchase: number;
    productId: string;
    quantity: number;
  }[];
}
