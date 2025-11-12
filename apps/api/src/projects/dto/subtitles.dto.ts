import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CaptionStyle {
  KARAOKE = 'karaoke',
  DEEP_DIVER = 'deep_diver',
  POD_P = 'pod_p',
  VIRAL_CAPTIONS = 'viral_captions',
  MR_BEAST = 'mr_beast',
  ALEX_HORMOZI = 'alex_hormozi',
  MINIMALIST = 'minimalist',
  BOLD_IMPACT = 'bold_impact',
  NEON_GLOW = 'neon_glow',
  CLASSIC_SUBTITLE = 'classic_subtitle',
}

export enum CaptionPosition {
  TOP = 'top',
  CENTER = 'center',
  BOTTOM = 'bottom',
}

export class SubtitlesDto {
  @ApiProperty({
    enum: CaptionStyle,
    description: 'Caption style preset',
    example: CaptionStyle.KARAOKE,
  })
  @IsEnum(CaptionStyle)
  captionStyle: CaptionStyle;

  @ApiProperty({
    description: 'Primary text color (hex)',
    example: '#FFFFFF',
    required: false,
  })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({
    description: 'Secondary/highlight color (hex)',
    example: '#FFD700',
    required: false,
  })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiProperty({
    description: 'Font size',
    example: 48,
    required: false,
    minimum: 24,
    maximum: 96,
  })
  @IsNumber()
  @Min(24)
  @Max(96)
  @IsOptional()
  fontSize?: number;

  @ApiProperty({
    enum: CaptionPosition,
    description: 'Caption position',
    example: CaptionPosition.BOTTOM,
    required: false,
  })
  @IsEnum(CaptionPosition)
  @IsOptional()
  position?: CaptionPosition = CaptionPosition.BOTTOM;
}
