import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAboutPageImageInfoDto {
  @IsString()
  @IsNotEmpty()
  imageSrc: string;

  @IsString()
  @IsOptional()
  description?: string;
} 