import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @MaxLength(10)
  @MinLength(10)
  @IsNotEmpty()
  accessCode: string;
  @MaxLength(20)
  @MinLength(3)
  @IsNotEmpty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  password: string;
  @MaxLength(20)
  @MinLength(6)
  @IsNotEmpty()
  cpassword: string;
}
