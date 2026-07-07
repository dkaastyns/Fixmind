import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssetsRepository } from '../assets/repositories/assets.repository';
import { ReportsService } from '../reports/services/reports.service';
import { UsersRepository } from '../users/repositories/users.repository';

@Injectable()
export class MaintenanceSchedulerService {
  private readonly logger = new Logger(MaintenanceSchedulerService.name);

  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly reportsService: ReportsService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleRoutineChecks() {
    this.logger.log('Running scheduled maintenance checks...');

    try {
      // For demonstration: fetch all assets that need maintenance (could be based on next_maintenance_date)
      // Since we don't have next_maintenance_date, let's just find assets with status 'NEEDS_MAINTENANCE'
      const { rows: assets } = await this.assetsRepository.list({ page: 1, limit: 100, status: 'NEEDS_MAINTENANCE' });

      if (assets.length === 0) {
        this.logger.log('No assets require routine maintenance at this time.');
        return;
      }

      // Find an admin user to act as the reporter for scheduled maintenance
      const { rows: admins } = await this.usersRepository.list({ page: 1, limit: 1, isAdmin: true });
      const systemAdmin = admins[0];

      if (!systemAdmin) {
        this.logger.error('No admin found to create scheduled reports.');
        return;
      }

      for (const asset of assets) {
        this.logger.log(`Creating scheduled report for asset: ${asset.nama_barang}`);
        
        await this.reportsService.create(systemAdmin as any, {
          title: `Scheduled Maintenance: ${asset.nama_barang}`,
          description: `Routine scheduled maintenance required for ${asset.nama_barang} (${asset.kode_barang}). Please inspect and perform necessary servicing.`,
          roomId: asset.room_id,
          assetId: asset.id,
        });
      }

      this.logger.log(`Scheduled maintenance checks completed. Created ${assets.length} reports.`);
    } catch (error) {
      this.logger.error('Failed to run scheduled maintenance checks', error.stack);
    }
  }
}
