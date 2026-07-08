import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { AssetsController } from './assets.controller';
import { AssetsService } from './services/assets.service';
import { AssetsRepository } from './repositories/assets.repository';
import { TransferRepository } from './repositories/transfer.repository';

@Module({
  imports: [RoomsModule],
  controllers: [AssetsController],
  providers: [AssetsService, AssetsRepository, TransferRepository],
  exports: [AssetsService, AssetsRepository, TransferRepository],
})
export class AssetsModule {}
