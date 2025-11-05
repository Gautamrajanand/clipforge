import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';

@ApiTags('ingestion')
@ApiBearerAuth()
@Controller('v1/projects/:projectId/ingest')
@UseGuards(AuthGuard('jwt'))
export class IngestionController {
  constructor(private ingestionService: IngestionService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest source (file/URL/script)' })
  async ingest(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: any,
  ) {
    const orgId = req.user.memberships[0]?.org?.id;
    if (!orgId) {
      throw new Error('No organization found');
    }
    return this.ingestionService.ingest(projectId, orgId, dto);
  }
}
