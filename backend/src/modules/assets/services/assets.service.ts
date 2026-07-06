import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomsRepository } from '../../rooms/repositories/rooms.repository';
import type { AssetRow } from '../../../common/types/database-rows';
import { CreateAssetDto, UpdateAssetDto } from '../dto/asset.dto';
import { AssetsRepository } from '../repositories/assets.repository';

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly roomsRepository: RoomsRepository,
  ) {}

  toPublic(asset: AssetRow) {
    return {
      id: asset.id,
      roomId: asset.room_id,
      name: asset.name,
      assetCode: asset.asset_code,
      category: asset.category,
      description: asset.description,
      status: asset.status,
      createdAt: asset.created_at,
    };
  }

  async list(page = 1, limit = 50, roomId?: string) {
    const { rows, total } = await this.assetsRepository.list({ page, limit, roomId });

    return {
      data: rows.map((r) => this.toPublic(r)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string) {
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException('Asset not found');
    return this.toPublic(asset);
  }

  async create(dto: CreateAssetDto) {
    const room = await this.roomsRepository.findById(dto.roomId);
    if (!room) throw new NotFoundException('Room not found');

    const asset = await this.assetsRepository.create({
      roomId: dto.roomId,
      name: dto.name,
      assetCode: dto.assetCode,
      category: dto.category,
      description: dto.description,
    });
    return this.toPublic(asset);
  }

  async update(id: string, dto: UpdateAssetDto) {
    if (dto.roomId) {
      const room = await this.roomsRepository.findById(dto.roomId);
      if (!room) throw new NotFoundException('Room not found');
    }

    const asset = await this.assetsRepository.update(id, {
      room_id: dto.roomId,
      name: dto.name,
      asset_code: dto.assetCode,
      category: dto.category,
      description: dto.description,
      status: dto.status,
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return this.toPublic(asset);
  }

  async remove(id: string) {
    const ok = await this.assetsRepository.softDelete(id);
    if (!ok) throw new NotFoundException('Asset not found');
    return { deleted: true };
  }
}
