import { IsArray } from 'class-validator';

export class CreateKeycardDto {
  @IsArray()
  permissions: string[];
}
