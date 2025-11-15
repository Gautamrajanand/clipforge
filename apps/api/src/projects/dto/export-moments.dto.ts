import { IsArray, IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExportMomentsDto {
  @ApiProperty({
    description: 'Array of moment IDs to export',
    example: ['cm123abc', 'cm456def'],
  })
  @IsArray()
  @IsString({ each: true })
  momentIds: string[];

  @ApiProperty({
    description: 'Target aspect ratio for export',
    enum: ['9:16', '16:9', '1:1', '4:5', 'original'],
    default: 'original',
    required: false,
  })
  @IsOptional()
  @IsEnum(['9:16', '16:9', '1:1', '4:5', 'original'])
  aspectRatio?: string;

  @ApiProperty({
    description: 'Crop mode for aspect ratio conversion',
    enum: ['crop', 'pad', 'smart'],
    default: 'crop',
    required: false,
  })
  @IsOptional()
  @IsEnum(['crop', 'pad', 'smart'])
  cropMode?: 'crop' | 'pad' | 'smart';

  @ApiProperty({
    description: 'Crop position (center, top, bottom, or custom coordinates)',
    default: 'center',
    required: false,
  })
  @IsOptional()
  cropPosition?: 'center' | 'top' | 'bottom' | { x: number; y: number };

  @ApiProperty({
    description: 'Burn captions into video',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  burnCaptions?: boolean;

  @ApiProperty({
    description: 'Caption style preset ID',
    default: 'karaoke',
    required: false,
  })
  @IsOptional()
  @IsString()
  captionStyle?: string;

  @ApiProperty({
    description: 'Primary caption color (hex)',
    default: '#FFFFFF',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({
    description: 'Secondary/highlight caption color (hex)',
    default: '#FFD700',
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiProperty({
    description: 'Caption font size in pixels',
    default: 48,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fontSize?: number;
}
