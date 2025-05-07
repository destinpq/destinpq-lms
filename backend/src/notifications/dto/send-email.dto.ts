import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  toEmail: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  htmlBody: string;
} 