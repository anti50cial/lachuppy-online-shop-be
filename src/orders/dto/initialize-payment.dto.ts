import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class InitializePaymentDto {
  @MaxLength(50)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsPhoneNumber('NG')
  @IsNotEmpty()
  phoneNumber: string;
  @MaxLength(500)
  @MinLength(10)
  @IsNotEmpty()
  address: string;
  cart: {
    id: string;
    quantity: number;
  }[];
}
