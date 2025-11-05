import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandKitsService } from './brand-kits.service';

@ApiTags('brand-kits')
@ApiBearerAuth()
@Controller('v1/brand-kits')
@UseGuards(AuthGuard('jwt'))
export class BrandKitsController {
  constructor(private brandKitsService: BrandKitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create brand kit' })
  async create(@Request() req, @Body() dto: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.brandKitsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List brand kits' })
  async findAll(@Request() req) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.brandKitsService.findAll(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand kit' })
  async findOne(@Request() req, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.brandKitsService.findOne(id, orgId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update brand kit' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: any) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.brandKitsService.update(id, orgId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand kit' })
  async delete(@Request() req, @Param('id') id: string) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.brandKitsService.delete(id, orgId);
  }
}
