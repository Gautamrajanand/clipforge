import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

/**
 * ApiKeysService - Manages API key generation, validation, and usage tracking
 * 
 * Features:
 * - Generate secure API keys with bcrypt hashing
 * - Rate limiting by tier
 * - Usage tracking and analytics
 * - Key rotation and expiration
 */
@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new API key for an organization
   */
  async generateApiKey(
    orgId: string,
    userId: string,
    name?: string,
    expiresInDays?: number,
  ): Promise<{ key: string; id: string }> {
    // Get organization to determine tier-based limits
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { tier: true },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Generate secure random key (32 bytes = 256 bits)
    const key = `cf_${crypto.randomBytes(32).toString('hex')}`;
    
    // Hash the key for storage (never store plain text)
    const keyHash = await bcrypt.hash(key, 10);

    // Set rate limits based on tier
    const limits = this.getTierLimits(org.tier);

    // Calculate expiration date
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create API key record
    const apiKey = await this.prisma.apiKey.create({
      data: {
        orgId,
        userId,
        keyHash,
        name: name || `API Key ${new Date().toLocaleDateString()}`,
        rateLimit: limits.rateLimit,
        quotaMinutes: limits.quotaMinutes,
        quotaExports: limits.quotaExports,
        expiresAt,
      },
    });

    // Return the plain text key (only time it's visible)
    return {
      key, // cf_abc123...
      id: apiKey.id,
    };
  }

  /**
   * Get tier-based rate limits
   */
  private getTierLimits(tier: string): {
    rateLimit: number;
    quotaMinutes: number;
    quotaExports: number;
  } {
    switch (tier) {
      case 'FREE':
        return {
          rateLimit: 10, // 10 requests per minute
          quotaMinutes: 60, // 60 minutes per month
          quotaExports: 10, // 10 exports per month
        };
      case 'STARTER':
        return {
          rateLimit: 30,
          quotaMinutes: 300,
          quotaExports: 50,
        };
      case 'PRO':
        return {
          rateLimit: 100,
          quotaMinutes: 1000,
          quotaExports: 200,
        };
      case 'BUSINESS':
        return {
          rateLimit: 500,
          quotaMinutes: 5000,
          quotaExports: 1000,
        };
      default:
        return {
          rateLimit: 10,
          quotaMinutes: 60,
          quotaExports: 10,
        };
    }
  }

  /**
   * Validate an API key and return associated data
   */
  async validateApiKey(key: string): Promise<{
    id: string;
    orgId: string;
    userId: string;
    rateLimit: number;
    org: any;
    user: any;
  } | null> {
    // Extract key hash prefix for lookup optimization
    // We need to check all keys since bcrypt hashes are unique
    const allKeys = await this.prisma.apiKey.findMany({
      where: {
        OR: [
          { expiresAt: null }, // Never expires
          { expiresAt: { gte: new Date() } }, // Not yet expired
        ],
      },
      include: {
        org: true,
        user: true,
      },
    });

    // Check each key hash
    for (const apiKey of allKeys) {
      const isValid = await bcrypt.compare(key, apiKey.keyHash);
      if (isValid) {
        // Update last used timestamp
        await this.prisma.apiKey.update({
          where: { id: apiKey.id },
          data: { lastUsedAt: new Date() },
        });

        return {
          id: apiKey.id,
          orgId: apiKey.orgId,
          userId: apiKey.userId,
          rateLimit: apiKey.rateLimit,
          org: (apiKey as any).org,
          user: (apiKey as any).user,
        };
      }
    }

    return null;
  }

  /**
   * List all API keys for an organization
   */
  async listApiKeys(orgId: string) {
    return this.prisma.apiKey.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        rateLimit: true,
        quotaMinutes: true,
        quotaExports: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
        // Never return keyHash
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Revoke (delete) an API key
   */
  async revokeApiKey(keyId: string, orgId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, orgId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({
      where: { id: keyId },
    });
  }

  /**
   * Update API key name
   */
  async updateApiKey(
    keyId: string,
    orgId: string,
    name: string,
  ): Promise<void> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, orgId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { name },
    });
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(orgId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    // TODO: Add actual usage tracking from UsageLedger
    // For now, return basic stats
    return {
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.lastUsedAt).length,
      keys: keys.map((k) => ({
        id: k.id,
        name: k.name,
        lastUsed: k.lastUsedAt,
        created: k.createdAt,
      })),
    };
  }

  /**
   * Check if organization has reached API key limit
   */
  async canCreateApiKey(orgId: string): Promise<boolean> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { tier: true },
    });

    if (!org) {
      return false;
    }

    const keyCount = await this.prisma.apiKey.count({
      where: { orgId },
    });

    // Set limits by tier
    const limits: Record<string, number> = {
      FREE: 1,
      STARTER: 3,
      PRO: 10,
      BUSINESS: 50,
    };

    const maxKeys = limits[org.tier] || 1;
    return keyCount < maxKeys;
  }
}
