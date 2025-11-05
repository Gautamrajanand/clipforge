import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface ClipForgeConfig {
  apiUrl: string;
  apiKey?: string;
  accessToken?: string;
}

export interface Project {
  id: string;
  title: string;
  sourceUrl?: string;
  status: string;
  createdAt: string;
}

export interface Clip {
  tStart: number;
  tEnd: number;
  duration: number;
  score: number;
  features: Record<string, number>;
  reason: string;
  text: string;
}

export interface Export {
  id: string;
  projectId: string;
  momentId: string;
  status: string;
  artifacts?: {
    mp4_url: string;
    srt_url: string;
    thumbnail_url: string;
  };
}

export interface BrandKit {
  id: string;
  name: string;
  fonts: Record<string, string>;
  colors: Record<string, string>;
  logoUrl?: string;
}

export class ClipForgeClient {
  private client: AxiosInstance;
  private config: ClipForgeConfig;

  constructor(config: ClipForgeConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-Api-Key'] = this.config.apiKey;
    } else if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    return headers;
  }

  // Projects
  async createProject(title: string, sourceUrl?: string): Promise<Project> {
    const response = await this.client.post('/v1/projects', {
      title,
      sourceUrl,
    });
    return response.data;
  }

  async listProjects(skip = 0, take = 20): Promise<Project[]> {
    const response = await this.client.get('/v1/projects', {
      params: { skip, take },
    });
    return response.data;
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await this.client.get(`/v1/projects/${projectId}`);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/v1/projects/${projectId}`);
  }

  // Highlight Detection
  async detectHighlights(projectId: string, numClips = 6): Promise<void> {
    await this.client.post(`/v1/projects/${projectId}/detect`, { numClips });
  }

  async listClips(projectId: string): Promise<Clip[]> {
    const response = await this.client.get(`/v1/projects/${projectId}/clips`);
    return response.data;
  }

  // Exports
  async createExport(
    clipId: string,
    format = 'MP4',
    aspectRatio = '9:16',
    template?: string,
    brandKitId?: string,
  ): Promise<Export> {
    const response = await this.client.post(`/v1/clips/${clipId}/export`, {
      format,
      aspectRatio,
      template,
      brandKitId,
    });
    return response.data;
  }

  async getExport(exportId: string): Promise<Export> {
    const response = await this.client.get(`/v1/exports/${exportId}`);
    return response.data;
  }

  // Brand Kits
  async createBrandKit(
    name: string,
    fonts: Record<string, string>,
    colors: Record<string, string>,
    logoUrl?: string,
  ): Promise<BrandKit> {
    const response = await this.client.post('/v1/brand-kits', {
      name,
      fonts,
      colors,
      logoUrl,
    });
    return response.data;
  }

  async listBrandKits(): Promise<BrandKit[]> {
    const response = await this.client.get('/v1/brand-kits');
    return response.data;
  }

  async getBrandKit(kitId: string): Promise<BrandKit> {
    const response = await this.client.get(`/v1/brand-kits/${kitId}`);
    return response.data;
  }

  // Usage
  async getUsage(): Promise<Record<string, any>> {
    const response = await this.client.get('/v1/usage');
    return response.data;
  }

  // Webhooks
  async registerWebhook(
    url: string,
    events: string[],
  ): Promise<Record<string, any>> {
    const response = await this.client.post('/v1/webhooks/endpoints', {
      url,
      events,
    });
    return response.data;
  }

  async listWebhooks(): Promise<Record<string, any>[]> {
    const response = await this.client.get('/v1/webhooks/endpoints');
    return response.data;
  }

  // Webhook verification
  static verifyWebhookSignature(
    secret: string,
    payload: Record<string, any>,
    signature: string,
  ): boolean {
    const json = JSON.stringify(payload);
    const expected = crypto
      .createHmac('sha256', secret)
      .update(json)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}

export default ClipForgeClient;
