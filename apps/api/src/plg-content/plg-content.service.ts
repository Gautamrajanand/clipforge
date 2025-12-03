import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PLGContentService {
  constructor(private prisma: PrismaService) {}

  // ============ ONBOARDING CONTENT ============

  async getOnboardingSteps(activeOnly: boolean = false) {
    return this.prisma.onboardingContent.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  async createOnboardingStep(data: {
    step: number;
    title: string;
    subtitle?: string;
    description: string;
    icon?: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
    isActive?: boolean;
    order?: number;
  }) {
    return this.prisma.onboardingContent.create({
      data: {
        step: data.step,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        icon: data.icon,
        imageUrl: data.imageUrl,
        ctaText: data.ctaText || 'Next',
        ctaUrl: data.ctaUrl,
        isActive: data.isActive ?? true,
        order: data.order ?? data.step,
      },
    });
  }

  async updateOnboardingStep(id: string, data: any) {
    return this.prisma.onboardingContent.update({
      where: { id },
      data,
    });
  }

  async deleteOnboardingStep(id: string) {
    return this.prisma.onboardingContent.delete({
      where: { id },
    });
  }

  // ============ POPUP CONTENT ============

  async getPopups(activeOnly: boolean = false) {
    return this.prisma.popupContent.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { priority: 'desc' },
    });
  }

  async getActivePopups(page?: string) {
    const where: any = { isActive: true };
    
    if (page) {
      where.showOnPages = {
        has: page,
      };
    }

    return this.prisma.popupContent.findMany({
      where,
      orderBy: { priority: 'desc' },
    });
  }

  async createPopup(data: {
    name: string;
    type: string;
    title: string;
    subtitle?: string;
    content: string;
    ctaText: string;
    ctaUrl?: string;
    imageUrl?: string;
    isActive?: boolean;
    showAfter?: number;
    showOnPages?: string[];
    frequency?: string;
    priority?: number;
  }) {
    return this.prisma.popupContent.create({
      data: {
        name: data.name,
        type: data.type as any,
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        imageUrl: data.imageUrl,
        isActive: data.isActive ?? true,
        showAfter: data.showAfter,
        showOnPages: data.showOnPages || [],
        frequency: data.frequency || 'once',
        priority: data.priority ?? 0,
      },
    });
  }

  async updatePopup(id: string, data: any) {
    return this.prisma.popupContent.update({
      where: { id },
      data,
    });
  }

  async deletePopup(id: string) {
    return this.prisma.popupContent.delete({
      where: { id },
    });
  }
}
