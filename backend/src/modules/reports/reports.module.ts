import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AssetsModule } from '../assets/assets.module';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './services/reports.service';
import { ReportsRepository } from './repositories/reports.repository';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [RoomsModule, AssetsModule, UsersModule, AiModule, CloudinaryModule, NotificationsModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
