import { IsOptional, IsString, IsNumber, IsIn, Min, Max, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeframeDto {
  @ApiProperty({ description: 'Start time in seconds', example: 0 })
  @IsNumber()
  @Min(0)
  start: number;

  @ApiProperty({ description: 'End time in seconds', example: 300 })
  @IsNumber()
  @Min(0)
  end: number;
}

export class ClipSettingsDto {
  @ApiProperty({ 
    description: 'Aspect ratio for clips',
    enum: ['9:16', '16:9', '1:1', '4:5'],
    default: '16:9',
    example: '9:16'
  })
  @IsOptional()
  @IsString()
  @IsIn(['9:16', '16:9', '1:1', '4:5'])
  aspectRatio?: string;

  @ApiProperty({ 
    description: 'Desired clip length in seconds',
    minimum: 15,
    maximum: 180,
    default: 60,
    example: 30
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(180)
  clipLength?: number;

  @ApiProperty({ 
    description: 'Number of clips to generate',
    minimum: 1,
    maximum: 10,
    default: 3,
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  numberOfClips?: number;

  @ApiProperty({ 
    description: 'Timeframe to process',
    type: TimeframeDto,
    required: false
  })
  @IsOptional()
  @IsObject()
  timeframe?: TimeframeDto;

  @ApiProperty({ 
    description: 'Target platform for optimization',
    enum: ['youtube-shorts', 'tiktok', 'instagram-reels', 'instagram-feed', 'linkedin', 'youtube', 'custom'],
    required: false,
    example: 'tiktok'
  })
  @IsOptional()
  @IsString()
  @IsIn(['youtube-shorts', 'tiktok', 'instagram-reels', 'instagram-feed', 'linkedin', 'youtube', 'custom'])
  targetPlatform?: string;
}

export class DetectClipsDto {
  @ApiProperty({ 
    description: 'Clip generation settings',
    type: ClipSettingsDto,
    required: false
  })
  @IsOptional()
  @IsObject()
  settings?: ClipSettingsDto;
}
