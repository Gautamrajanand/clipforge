import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';

@ApiTags('api-keys')
@Controller('v1/api-keys')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  /**
   * Generate a new API key
   */
  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  async createApiKey(
    @Request() req: any,
    @Body() body: { name?: string; expiresInDays?: number },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    const userId = req.user.id;

    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    // Check if user can create more API keys
    const canCreate = await this.apiKeysService.canCreateApiKey(orgId);
    if (!canCreate) {
      throw new BadRequestException(
        'API key limit reached for your plan. Please upgrade to create more keys.',
      );
    }

    const result = await this.apiKeysService.generateApiKey(
      orgId,
      userId,
      body.name,
      body.expiresInDays,
    );

    return {
      message: 'API key created successfully. Save this key - it will not be shown again!',
      key: result.key,
      id: result.id,
    };
  }

  /**
   * List all API keys for the organization
   */
  @Get()
  @ApiOperation({ summary: 'List all API keys' })
  async listApiKeys(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;

    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    const keys = await this.apiKeysService.listApiKeys(orgId);
    return { keys };
  }

  /**
   * Get API key usage statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get API key usage statistics' })
  async getStats(@Request() req: any) {
    const orgId = req.user.memberships[0]?.org?.id;

    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    return this.apiKeysService.getApiKeyStats(orgId);
  }

  /**
   * Update API key name
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update API key name' })
  async updateApiKey(
    @Request() req: any,
    @Param('id') keyId: string,
    @Body() body: { name: string },
  ) {
    const orgId = req.user.memberships[0]?.org?.id;

    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    await this.apiKeysService.updateApiKey(keyId, orgId, body.name);
    return { message: 'API key updated successfully' };
  }

  /**
   * Revoke (delete) an API key
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  async revokeApiKey(@Request() req: any, @Param('id') keyId: string) {
    const orgId = req.user.memberships[0]?.org?.id;

    if (!orgId) {
      throw new BadRequestException('No organization found');
    }

    await this.apiKeysService.revokeApiKey(keyId, orgId);
    return { message: 'API key revoked successfully' };
  }
}
