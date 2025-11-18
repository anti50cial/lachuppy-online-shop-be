import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { CreateDishDto } from './create-dish.dto';

export class UpdateDishDto extends PartialType(CreateDishDto) {
  @Transform(({ value }) => {
    if (value === 'true' || value === 1 || value === '1') return true;
    if (value === 'false' || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean()
  available: boolean;
}
