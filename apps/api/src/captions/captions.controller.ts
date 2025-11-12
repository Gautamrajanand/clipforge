import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { getAllCaptionStylePresets } from './caption-styles';

@ApiTags('captions')
@Controller('captions')
export class CaptionsController {
  /**
   * Get all available caption style presets
   */
  @Get('styles')
  @ApiOperation({ summary: 'Get all caption style presets' })
  getStyles() {
    return {
      styles: getAllCaptionStylePresets(),
    };
  }
}
