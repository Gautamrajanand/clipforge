import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QueuesService } from './queues.service';

@ApiTags('queues')
@ApiBearerAuth()
@Controller('v1/queues')
@UseGuards(AuthGuard('jwt'))
export class QueuesController {
  constructor(private queuesService: QueuesService) {}

  /**
   * Get all queue metrics
   * GET /queues/metrics
   */
  @Get('metrics')
  async getAllMetrics() {
    return this.queuesService.getAllQueueMetrics();
  }

  /**
   * Get specific queue metrics
   * GET /queues/:queueName/metrics
   */
  @Get(':queueName/metrics')
  async getQueueMetrics(@Param('queueName') queueName: string) {
    return this.queuesService.getQueueMetrics(queueName);
  }

  /**
   * Get job status
   * GET /queues/:queueName/jobs/:jobId
   */
  @Get(':queueName/jobs/:jobId')
  async getJobStatus(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    return this.queuesService.getJobStatus(queueName, jobId);
  }
}
