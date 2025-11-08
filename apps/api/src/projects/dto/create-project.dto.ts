import { IsString, IsOptional, IsUrl, IsObject } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsObject()
  settings?: any;
}
