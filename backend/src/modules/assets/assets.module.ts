import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './services/assets.service';
import { AssetsRepository } from './repositories/assets.repository';

@Module({
  imports: [RoomsModule],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsRepository],
  exports: [AssetsService, AssetsRepository],
})
export class AssetsModule {}
