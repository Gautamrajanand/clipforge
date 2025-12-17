import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LandingPageType } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // ============ Blog Posts ============

  async getAllBlogPosts(published?: boolean) {
    return this.prisma.blogPost.findMany({
      where: published !== undefined ? { published } : undefined,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }
    return post;
  }

  async createBlogPost(data: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    readTime: string;
    published?: boolean;
  }) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictException(`Blog post with slug "${data.slug}" already exists`);
    }

    return this.prisma.blogPost.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null,
      },
    });
  }

  async updateBlogPost(id: string, data: {
    slug?: string;
    title?: string;
    excerpt?: string;
    content?: string;
    author?: string;
    readTime?: string;
    published?: boolean;
  }) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }

    // If publishing for the first time, set publishedAt
    const publishedAt = data.published && !post.published ? new Date() : undefined;

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        ...(publishedAt && { publishedAt }),
      },
    });
  }

  async deleteBlogPost(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Blog post with id "${id}" not found`);
    }
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // ============ Landing Pages ============

  async getAllLandingPages(type?: LandingPageType, published?: boolean) {
    return this.prisma.landingPage.findMany({
      where: {
        ...(type && { type }),
        ...(published !== undefined && { published }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLandingPageBySlug(slug: string) {
    const page = await this.prisma.landingPage.findUnique({
      where: { slug },
    });
    if (!page) {
      throw new NotFoundException(`Landing page with slug "${slug}" not found`);
    }
    return page;
  }

  async createLandingPage(data: {
    slug: string;
    title: string;
    description: string;
    type: LandingPageType;
    content: string;
    published?: boolean;
  }) {
    const existing = await this.prisma.landingPage.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      throw new ConflictException(`Landing page with slug "${data.slug}" already exists`);
    }

    return this.prisma.landingPage.create({
      data: {
        ...data,
        publishedAt: data.published ? new Date() : null,
      },
    });
  }

  async updateLandingPage(id: string, data: {
    slug?: string;
    title?: string;
    description?: string;
    type?: LandingPageType;
    content?: string;
    published?: boolean;
  }) {
    const page = await this.prisma.landingPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Landing page with id "${id}" not found`);
    }

    const publishedAt = data.published && !page.published ? new Date() : undefined;

    return this.prisma.landingPage.update({
      where: { id },
      data: {
        ...data,
        ...(publishedAt && { publishedAt }),
      },
    });
  }

  async deleteLandingPage(id: string) {
    const page = await this.prisma.landingPage.findUnique({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Landing page with id "${id}" not found`);
    }
    return this.prisma.landingPage.delete({ where: { id } });
  }
}
