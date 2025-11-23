/**
 * One-time script to fix project expiry dates for existing paid users
 * Run this after upgrading users to ensure their projects have correct expiry
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProjectExpiry() {
  console.log('🔧 Fixing project expiry dates for paid users...\n');

  // Get all organizations with their tier
  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      tier: true,
      _count: {
        select: { projects: true },
      },
    },
  });

  let totalUpdated = 0;

  for (const org of orgs) {
    let newExpiresAt: Date | null = null;

    // Calculate expiry based on tier
    if (org.tier === 'FREE') {
      newExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    } else if (org.tier === 'STARTER') {
      newExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    }
    // PRO and BUSINESS: null (never expire)

    // Update all projects for this organization
    const result = await prisma.project.updateMany({
      where: { orgId: org.id },
      data: { expiresAt: newExpiresAt },
    });

    if (result.count > 0) {
      console.log(
        `✅ ${org.name} (${org.tier}): Updated ${result.count} projects → ` +
        `${newExpiresAt ? `expires ${newExpiresAt.toLocaleDateString()}` : 'never expires'}`
      );
      totalUpdated += result.count;
    }
  }

  console.log(`\n🎉 Total projects updated: ${totalUpdated}`);
}

fixProjectExpiry()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
