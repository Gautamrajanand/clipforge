import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}
