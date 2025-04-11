import { IsString, IsDate, IsArray, IsOptional } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;
  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  videos?: string[];

  @IsDate()
  notificationTime: Date;
}
