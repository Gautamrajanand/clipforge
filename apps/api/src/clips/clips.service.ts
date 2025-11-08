import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FFmpegService } from '../video/ffmpeg.service';

@Injectable()
export class ClipsService {
  private readonly logger = new Logger(ClipsService.name);

  constructor(
    private prisma: PrismaService,
    private ffmpegService: FFmpegService,
  ) {}

  async findByProject(projectId: string, orgId: string) {
    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.moment.findMany({
      where: { projectId },
      orderBy: { score: 'desc' },
    });
  }

  async findOne(momentId: string, orgId: string) {
    const moment = await this.prisma.moment.findUnique({
      where: { id: momentId },
      include: { project: true },
    });

    if (!moment || moment.project.orgId !== orgId) {
      throw new NotFoundException('Moment not found');
    }

    return moment;
  }

  async generateProClips(
    projectId: string,
    orgId: string,
    numClips: number = 3,
    withCrossfade: boolean = false,
  ) {
    this.logger.log(`🎬 Generating ${numClips} Pro Clips for project ${projectId}`);

    // Verify org owns project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        transcript: true,
        assets: {
          where: { kind: 'ORIGINAL' },
        },
      },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundException('Project not found');
    }

    if (!project.transcript) {
      throw new NotFoundException('No transcript found for this project');
    }

    if (!project.assets || project.assets.length === 0) {
      throw new NotFoundException('No video file found for this project');
    }

    const videoAsset = project.assets[0];

    // Call ML worker to detect multi-segment clips
    const mlWorkerUrl = process.env.ML_WORKER_URL || 'http://ml-workers:8000';
    
    this.logger.log('📡 Calling ML worker for multi-segment detection...');
    
    const response = await fetch(`${mlWorkerUrl}/v1/ranker/detect-pro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        transcriptId: project.transcript.id,
        numClips,
        targetDuration: 45.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`ML worker returned ${response.status}`);
    }

    const multiClips = await response.json();
    
    this.logger.log(`✅ Detected ${multiClips.length} multi-segment clips`);

    // Generate video files for each multi-segment clip
    const generatedClips = [];

    for (let i = 0; i < multiClips.length; i++) {
      const multiClip = multiClips[i];
      
      this.logger.log(`🎬 Processing Pro Clip ${i + 1}/${multiClips.length}`);

      // Create output path
      const outputPath = `/tmp/pro_clip_${projectId}_${i}.mp4`;

      // Stitch segments using FFmpeg
      await this.ffmpegService.createMultiSegmentClip(
        videoAsset.url, // Source video
        multiClip.segments.map((seg: any) => ({
          start: seg.start,
          end: seg.end,
          order: seg.order,
        })),
        outputPath,
        withCrossfade,
      );

      // TODO: Upload to MinIO and create Moment record
      // For now, just save metadata
      
      const moment = await this.prisma.moment.create({
        data: {
          projectId,
          tStart: multiClip.segments[0].start,
          tEnd: multiClip.segments[multiClip.segments.length - 1].end,
          duration: multiClip.total_duration,
          title: `Pro Clip ${i + 1}`, // TODO: Generate AI title
          description: multiClip.reason,
          score: multiClip.combined_score,
          aspectRatio: '16:9',
          features: {
            ...multiClip.features,
            segments: multiClip.segments,
            isProClip: true,
            withCrossfade,
          },
        },
      });

      generatedClips.push(moment);
      
      this.logger.log(`✅ Pro Clip ${i + 1} created: ${moment.id}`);
    }

    this.logger.log(`🎉 Generated ${generatedClips.length} Pro Clips successfully`);

    return generatedClips;
  }
}
