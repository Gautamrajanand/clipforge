import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('v1/uploads')
@UseGuards(AuthGuard('jwt'))
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('sign')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  async sign(
    @Request() req: any,
    @Body() body: { filename: string; mimeType: string; size: number },
  ) {
    return this.storageService.generatePresignedUploadUrl(
      body.filename,
      body.mimeType,
      body.size,
    );
  }
}
