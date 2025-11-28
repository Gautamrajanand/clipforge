import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { EmailSchedulerService } from './email-scheduler.service';

/**
 * Email Test Controller
 * 
 * Provides endpoints to manually trigger scheduled email jobs for testing.
 * Protected by admin authentication.
 * 
 * ⚠️ FOR TESTING ONLY - Remove or disable in production
 */
@Controller('admin/email-test')
@UseGuards(ClerkAuthGuard, AdminGuard)
export class EmailTestController {
  constructor(private emailScheduler: EmailSchedulerService) {}

  /**
   * Manually trigger Onboarding Day 1 emails
   * POST /admin/email-test/onboarding-day1
   */
  @Post('onboarding-day1')
  async triggerOnboardingDay1() {
    await this.emailScheduler.sendOnboardingDay1Emails();
    return { 
      success: true, 
      message: 'Onboarding Day 1 email job triggered. Check logs for results.' 
    };
  }

  /**
   * Manually trigger Onboarding Day 3 emails
   * POST /admin/email-test/onboarding-day3
   */
  @Post('onboarding-day3')
  async triggerOnboardingDay3() {
    await this.emailScheduler.sendOnboardingDay3Emails();
    return { 
      success: true, 
      message: 'Onboarding Day 3 email job triggered. Check logs for results.' 
    };
  }

  /**
   * Manually trigger Trial Expiry emails
   * POST /admin/email-test/trial-expiry
   */
  @Post('trial-expiry')
  async triggerTrialExpiry() {
    await this.emailScheduler.sendTrialExpiryEmails();
    return { 
      success: true, 
      message: 'Trial Expiry email job triggered. Check logs for results.' 
    };
  }

  /**
   * Manually trigger Weekly Summary emails
   * POST /admin/email-test/weekly-summary
   */
  @Post('weekly-summary')
  async triggerWeeklySummary() {
    await this.emailScheduler.sendWeeklySummaryEmails();
    return { 
      success: true, 
      message: 'Weekly Summary email job triggered. Check logs for results.' 
    };
  }

  /**
   * Manually trigger Inactivity Re-engagement emails
   * POST /admin/email-test/inactivity
   */
  @Post('inactivity')
  async triggerInactivity() {
    await this.emailScheduler.sendInactivityEmails();
    return { 
      success: true, 
      message: 'Inactivity Re-engagement email job triggered. Check logs for results.' 
    };
  }

  /**
   * Trigger all scheduled email jobs at once
   * POST /admin/email-test/all
   */
  @Post('all')
  async triggerAll() {
    const results = [];
    
    try {
      await this.emailScheduler.sendOnboardingDay1Emails();
      results.push('Onboarding Day 1: ✅');
    } catch (e) {
      results.push(`Onboarding Day 1: ❌ ${e.message}`);
    }

    try {
      await this.emailScheduler.sendOnboardingDay3Emails();
      results.push('Onboarding Day 3: ✅');
    } catch (e) {
      results.push(`Onboarding Day 3: ❌ ${e.message}`);
    }

    try {
      await this.emailScheduler.sendTrialExpiryEmails();
      results.push('Trial Expiry: ✅');
    } catch (e) {
      results.push(`Trial Expiry: ❌ ${e.message}`);
    }

    try {
      await this.emailScheduler.sendWeeklySummaryEmails();
      results.push('Weekly Summary: ✅');
    } catch (e) {
      results.push(`Weekly Summary: ❌ ${e.message}`);
    }

    try {
      await this.emailScheduler.sendInactivityEmails();
      results.push('Inactivity: ✅');
    } catch (e) {
      results.push(`Inactivity: ❌ ${e.message}`);
    }

    return { 
      success: true, 
      message: 'All email jobs triggered. Check logs for detailed results.',
      results 
    };
  }
}
