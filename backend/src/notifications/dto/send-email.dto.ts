import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class SendEmailDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  toEmails: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  htmlBody: string;
} 