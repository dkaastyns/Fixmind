import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { RoomsService } from './services/rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('activeOnly') activeOnly?: string,
  ) {
    const result = await this.roomsService.list(
      Number(page),
      Number(limit),
      activeOnly === 'true',
    );
    return { message: 'Rooms retrieved', ...result };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.roomsService.getById(id);
    return { message: 'Room retrieved', data };
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateRoomDto) {
    const data = await this.roomsService.create(dto);
    return { message: 'Room created', data };
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    const data = await this.roomsService.update(id, dto);
    return { message: 'Room updated', data };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.roomsService.remove(id);
    return { message: 'Room deleted', data };
  }
}
