import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  async getKpi() {
    return await this.dashboardService.getKpiStats();
  }

  @Get('chart')
  async getChart() {
    return await this.dashboardService.getChartData();
  }

  @Get('recent')
  async getRecent() {
    return await this.dashboardService.getRecentActivities();
  }
}
