import { Module } from '@nestjs/common';
import { AssetsModule } from '../assets/assets.module';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceRepository } from './repositories/maintenance.repository';
import { MaintenanceService } from './services/maintenance.service';

@Module({
  imports: [RoomsModule, AssetsModule, UsersModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceRepository],
  exports: [MaintenanceService, MaintenanceRepository],
})
export class MaintenanceModule {}
