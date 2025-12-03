import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PLGContentService } from './plg-content.service';
import { AdminGuard } from '../auth/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('plg-content')
@Controller('admin/plg/content')
@UseGuards(AdminGuard)
@ApiBearerAuth()
export class PLGContentController {
  constructor(private plgContent: PLGContentService) {}

  // ============ ONBOARDING CONTENT ============

  @Get('onboarding')
  @ApiOperation({ summary: 'Get all onboarding steps' })
  async getOnboardingSteps(@Query('activeOnly') activeOnly?: string) {
    return this.plgContent.getOnboardingSteps(activeOnly === 'true');
  }

  @Post('onboarding')
  @ApiOperation({ summary: 'Create onboarding step' })
  async createOnboardingStep(@Body() data: any) {
    return this.plgContent.createOnboardingStep(data);
  }

  @Put('onboarding/:id')
  @ApiOperation({ summary: 'Update onboarding step' })
  async updateOnboardingStep(@Param('id') id: string, @Body() data: any) {
    return this.plgContent.updateOnboardingStep(id, data);
  }

  @Delete('onboarding/:id')
  @ApiOperation({ summary: 'Delete onboarding step' })
  async deleteOnboardingStep(@Param('id') id: string) {
    return this.plgContent.deleteOnboardingStep(id);
  }

  // ============ POPUP CONTENT ============

  @Get('popups')
  @ApiOperation({ summary: 'Get all popups' })
  async getPopups(@Query('activeOnly') activeOnly?: string) {
    return this.plgContent.getPopups(activeOnly === 'true');
  }

  @Post('popups')
  @ApiOperation({ summary: 'Create popup' })
  async createPopup(@Body() data: any) {
    return this.plgContent.createPopup(data);
  }

  @Put('popups/:id')
  @ApiOperation({ summary: 'Update popup' })
  async updatePopup(@Param('id') id: string, @Body() data: any) {
    return this.plgContent.updatePopup(id, data);
  }

  @Delete('popups/:id')
  @ApiOperation({ summary: 'Delete popup' })
  async deletePopup(@Param('id') id: string) {
    return this.plgContent.deletePopup(id);
  }
}

// User-facing endpoints
@ApiTags('plg-content')
@Controller('v1/plg/content')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class PLGContentUserController {
  constructor(private plgContent: PLGContentService) {}

  @Get('onboarding')
  @ApiOperation({ summary: 'Get active onboarding steps for user' })
  async getActiveOnboardingSteps() {
    return this.plgContent.getOnboardingSteps(true);
  }

  @Get('popups')
  @ApiOperation({ summary: 'Get active popups for user' })
  async getActivePopups(@Query('page') page?: string) {
    return this.plgContent.getActivePopups(page);
  }
}
