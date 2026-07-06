import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './services/rooms.service';
import { RoomsRepository } from './repositories/rooms.repository';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsRepository],
  exports: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
