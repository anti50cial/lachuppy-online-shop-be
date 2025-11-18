import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDishDto {
  @IsString()
  @MaxLength(100)
  @MinLength(3)
  @IsNotEmpty()
  name: string;
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  price: number;
  @MaxLength(1000)
  @IsString()
  description: string;
}
