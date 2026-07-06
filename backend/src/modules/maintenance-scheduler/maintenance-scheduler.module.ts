import { Module } from '@nestjs/common';
import { MaintenanceSchedulerService } from './maintenance-scheduler.service';
import { ReportsModule } from '../reports/reports.module';
import { AssetsModule } from '../assets/assets.module';
import { UsersModule } from '../users/users.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [ReportsModule, AssetsModule, UsersModule, RoomsModule],
  providers: [MaintenanceSchedulerService],
})
export class MaintenanceSchedulerModule {}
