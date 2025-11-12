import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AspectRatio {
  VERTICAL = '9:16',
  HORIZONTAL = '16:9',
  SQUARE = '1:1',
  PORTRAIT = '4:5',
}

export enum FramingStrategy {
  SMART_CROP = 'smart_crop',
  CENTER_CROP = 'center_crop',
  PAD_BLUR = 'pad_blur',
  PAD_COLOR = 'pad_color',
}

export class ReframeDto {
  @ApiProperty({
    enum: AspectRatio,
    description: 'Target aspect ratio',
    example: AspectRatio.VERTICAL,
  })
  @IsEnum(AspectRatio)
  aspectRatio: AspectRatio;

  @ApiProperty({
    enum: FramingStrategy,
    description: 'Framing strategy',
    example: FramingStrategy.SMART_CROP,
    required: false,
  })
  @IsEnum(FramingStrategy)
  @IsOptional()
  strategy?: FramingStrategy = FramingStrategy.SMART_CROP;

  @ApiProperty({
    description: 'Background color for pad_color strategy (hex)',
    example: '#000000',
    required: false,
  })
  @IsString()
  @IsOptional()
  backgroundColor?: string = '#000000';
}
