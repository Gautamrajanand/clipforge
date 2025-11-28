import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users/recent')
  async getRecentUsers(@Query('limit') limit?: string) {
    return this.adminService.getRecentUsers(limit ? parseInt(limit) : 10);
  }

  @Get('users/search')
  async searchUsers(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.adminService.searchUsers(query, limit ? parseInt(limit) : 20);
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Get('organizations/recent')
  async getRecentOrganizations() {
    return this.adminService.getRecentProjects(10);
  }

  @Get('organizations/search')
  async searchOrganizations(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.adminService.searchOrganizations(query, limit ? parseInt(limit) : 20);
  }

  @Get('organizations/:id')
  async getOrganizationDetails(@Param('id') id: string) {
    return this.adminService.getOrganizationDetails(id);
  }

  @Get('projects/recent')
  async getRecentProjects(@Query('limit') limit?: string) {
    return this.adminService.getRecentProjects(limit ? parseInt(limit) : 10);
  }

  @Get('transactions/recent')
  async getRecentTransactions(@Query('limit') limit?: string) {
    return this.adminService.getRecentTransactions(limit ? parseInt(limit) : 10);
  }

  @Get('health')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Post('organizations/:id/credits/adjust')
  async adjustCredits(
    @Param('id') orgId: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.adminService.adjustCredits(orgId, body.amount, body.reason);
  }

  @Patch('organizations/:id/tier')
  async updateTier(
    @Param('id') orgId: string,
    @Body() body: { tier: string },
  ) {
    return this.adminService.updateTier(orgId, body.tier);
  }

  @Patch('users/:id/admin')
  async toggleAdmin(
    @Param('id') userId: string,
    @Body() body: { isAdmin: boolean },
  ) {
    return this.adminService.toggleAdmin(userId, body.isAdmin);
  }
}
