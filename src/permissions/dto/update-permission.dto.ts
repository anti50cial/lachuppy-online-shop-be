import { PartialType } from '@nestjs/mapped-types';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ArrayNotEmpty()
  @IsArray()
  @IsDefined()
  permissions: string[];
}
