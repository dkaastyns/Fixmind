import { Injectable, NotFoundException } from '@nestjs/common';
import type { RoomRow } from '../../../common/types/database-rows';
import { CreateRoomDto, UpdateRoomDto } from '../dto/room.dto';
import { RoomsRepository } from '../repositories/rooms.repository';

@Injectable()
export class RoomsService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  toPublic(room: RoomRow) {
    return {
      id: room.id,
      name: room.name,
      code: room.code,
      floor: room.floor,
      building: room.building,
      description: room.description,
      isActive: room.is_active,
      createdAt: room.created_at,
    };
  }

  async list(page = 1, limit = 50, activeOnly = false) {
    const { rows, total } = await this.roomsRepository.list({ page, limit, activeOnly });
    return {
      data: rows.map((r) => this.toPublic(r)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string) {
    const room = await this.roomsRepository.findById(id);
    if (!room) throw new NotFoundException('Room not found');
    return this.toPublic(room);
  }

  async create(dto: CreateRoomDto) {
    const room = await this.roomsRepository.create(dto);
    return this.toPublic(room);
  }

  async update(id: string, dto: UpdateRoomDto) {
    const room = await this.roomsRepository.update(id, {
      name: dto.name,
      code: dto.code,
      floor: dto.floor,
      building: dto.building,
      description: dto.description,
      is_active: dto.isActive,
    });
    if (!room) throw new NotFoundException('Room not found');
    return this.toPublic(room);
  }

  async remove(id: string) {
    const ok = await this.roomsRepository.softDelete(id);
    if (!ok) throw new NotFoundException('Room not found');
    return { deleted: true };
  }
}
