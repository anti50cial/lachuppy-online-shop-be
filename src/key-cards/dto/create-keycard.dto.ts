import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';

export class CreateKeycardDto {
  @ArrayNotEmpty()
  @IsArray()
  @IsDefined()
  permissions: string[];
}
