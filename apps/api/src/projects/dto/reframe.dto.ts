import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  SIDE_BY_SIDE = 'side_by_side',
  PICTURE_IN_PICTURE = 'picture_in_picture',
  GRID = 'grid',
  ABOVE_BELOW = 'above_below',
}

export enum OverlayPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  CENTER = 'center',
}

export class AdvancedLayoutDto {
  // Side-by-Side Layout
  @ApiProperty({
    description: 'Left video width ratio (0.0-1.0)',
    example: 0.5,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @Max(0.9)
  @IsOptional()
  leftRatio?: number;

  @ApiProperty({
    description: 'Right video width ratio (0.0-1.0)',
    example: 0.5,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @Max(0.9)
  @IsOptional()
  rightRatio?: number;

  // Picture-in-Picture Layout
  @ApiProperty({
    enum: OverlayPosition,
    description: 'Position of overlay video',
    example: OverlayPosition.BOTTOM_RIGHT,
    required: false,
  })
  @IsEnum(OverlayPosition)
  @IsOptional()
  overlayPosition?: OverlayPosition;

  @ApiProperty({
    description: 'Overlay video size as ratio of main video (0.1-0.5)',
    example: 0.25,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @Max(0.5)
  @IsOptional()
  overlaySize?: number;

  @ApiProperty({
    description: 'Padding from edges in pixels',
    example: 20,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  overlayPadding?: number;

  // Grid Layout
  @ApiProperty({
    description: 'Number of rows in grid',
    example: 2,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  rows?: number;

  @ApiProperty({
    description: 'Number of columns in grid',
    example: 2,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Max(4)
  @IsOptional()
  columns?: number;

  // Above/Below Layout
  @ApiProperty({
    description: 'Top video height ratio (0.0-1.0)',
    example: 0.6,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @Max(0.9)
  @IsOptional()
  topRatio?: number;

  @ApiProperty({
    description: 'Bottom video height ratio (0.0-1.0)',
    example: 0.4,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @Max(0.9)
  @IsOptional()
  bottomRatio?: number;

  // Common Properties
  @ApiProperty({
    description: 'Gap between video sections in pixels',
    example: 10,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  gap?: number;

  @ApiProperty({
    description: 'Border width in pixels',
    example: 3,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiProperty({
    description: 'Border color (hex)',
    example: '#ffffff',
    required: false,
  })
  @IsString()
  @IsOptional()
  borderColor?: string;
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

  @ApiProperty({
    description: 'Advanced layout configuration for complex framing modes',
    type: AdvancedLayoutDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => AdvancedLayoutDto)
  @IsOptional()
  layout?: AdvancedLayoutDto;

  @ApiProperty({
    description: 'Enable AI-powered face detection for smart cropping',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enableFaceDetection?: boolean = false;

  @ApiProperty({
    description: 'Enable smooth transitions between framing changes',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enableTransitions?: boolean = false;

  @ApiProperty({
    description: 'Transition duration in seconds',
    example: 0.5,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @Max(2.0)
  @IsOptional()
  transitionDuration?: number = 0.5;
}
