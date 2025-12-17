import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@ApiTags('content')
@Controller('content')
@UseGuards(ClerkAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // ============ Blog Posts ============

  @Get('blog-posts')
  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Blog posts retrieved successfully' })
  async getAllBlogPosts(@Query('published') published?: string) {
    const publishedBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getAllBlogPosts(publishedBool);
  }

  @Get('blog-posts/:slug')
  @ApiOperation({ summary: 'Get blog post by slug' })
  @ApiParam({ name: 'slug', description: 'Blog post slug' })
  @ApiResponse({ status: 200, description: 'Blog post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getBlogPostBySlug(@Param('slug') slug: string) {
    return this.contentService.getBlogPostBySlug(slug);
  }

  @Post('blog-posts')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog post (Admin only)' })
  @ApiResponse({ status: 201, description: 'Blog post created successfully' })
  @ApiResponse({ status: 409, description: 'Blog post with slug already exists' })
  async createBlogPost(@Body() data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    readTime: string;
    published?: boolean;
  }) {
    return this.contentService.createBlogPost(data);
  }

  @Put('blog-posts/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post (Admin only)' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post updated successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async updateBlogPost(@Param('id') id: string, @Body() data: {
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    author?: string;
    readTime?: string;
    published?: boolean;
  }) {
    return this.contentService.updateBlogPost(id, data);
  }

  @Delete('blog-posts/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post (Admin only)' })
  @ApiParam({ name: 'id', description: 'Blog post ID' })
  @ApiResponse({ status: 200, description: 'Blog post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async deleteBlogPost(@Param('id') id: string) {
    return this.contentService.deleteBlogPost(id);
  }

  // ============ Landing Pages ============

  @Get('landing-pages')
  @ApiOperation({ summary: 'Get all landing pages' })
  @ApiQuery({ name: 'type', required: false, enum: ['USE_CASE', 'COMPARISON', 'CUSTOM'] })
  @ApiQuery({ name: 'published', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Landing pages retrieved successfully' })
  async getAllLandingPages(
    @Query('type') type?: 'USE_CASE' | 'COMPARISON' | 'CUSTOM',
    @Query('published') published?: string,
  ) {
    const publishedBool = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getAllLandingPages(type as any, publishedBool);
  }

  @Get('landing-pages/:slug')
  @ApiOperation({ summary: 'Get landing page by slug' })
  @ApiParam({ name: 'slug', description: 'Landing page slug' })
  @ApiResponse({ status: 200, description: 'Landing page retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Landing page not found' })
  async getLandingPageBySlug(@Param('slug') slug: string) {
    return this.contentService.getLandingPageBySlug(slug);
  }

  @Post('landing-pages')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create landing page (Admin only)' })
  @ApiResponse({ status: 201, description: 'Landing page created successfully' })
  @ApiResponse({ status: 409, description: 'Landing page with slug already exists' })
  async createLandingPage(@Body() data: {
    slug: string;
    title: string;
    description: string;
    type: 'USE_CASE' | 'COMPARISON' | 'CUSTOM';
    content: string;
    published?: boolean;
  }) {
    return this.contentService.createLandingPage(data as any);
  }

  @Put('landing-pages/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update landing page (Admin only)' })
  @ApiParam({ name: 'id', description: 'Landing page ID' })
  @ApiResponse({ status: 200, description: 'Landing page updated successfully' })
  @ApiResponse({ status: 404, description: 'Landing page not found' })
  async updateLandingPage(@Param('id') id: string, @Body() data: {
    slug?: string;
    title?: string;
    description?: string;
    type?: 'USE_CASE' | 'COMPARISON' | 'CUSTOM';
    content?: string;
    published?: boolean;
  }) {
    return this.contentService.updateLandingPage(id, data as any);
  }

  @Delete('landing-pages/:id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete landing page (Admin only)' })
  @ApiParam({ name: 'id', description: 'Landing page ID' })
  @ApiResponse({ status: 200, description: 'Landing page deleted successfully' })
  @ApiResponse({ status: 404, description: 'Landing page not found' })
  async deleteLandingPage(@Param('id') id: string) {
    return this.contentService.deleteLandingPage(id);
  }
}
