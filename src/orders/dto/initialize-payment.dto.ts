export class InitializePaymentDto {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  cart: {
    id: string;
    quantity: number;
  }[];
}
