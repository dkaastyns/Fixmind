import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../../common/decorators/current-user.decorator';
import type { MaintenanceListRow } from '../repositories/maintenance.repository';
import type { MaintenanceScheduleRow, MaintenanceScheduleStatus } from '../../../common/types/database-rows';
import { AssetsRepository } from '../../assets/repositories/assets.repository';
import { RoomsRepository } from '../../rooms/repositories/rooms.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { CreateMaintenanceScheduleDto, UpdateMaintenanceScheduleDto, UpdateMaintenanceScheduleStatusDto } from '../dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly maintenanceRepository: MaintenanceRepository,
    private readonly roomsRepository: RoomsRepository,
    private readonly assetsRepository: AssetsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  toPublic(row: MaintenanceListRow | MaintenanceScheduleRow) {
    const isListRow = 'room_name' in row;
    return {
      id: row.id,
      roomId: row.room_id,
      roomName: isListRow ? row.room_name : undefined,
      roomCode: isListRow ? row.room_code : undefined,
      assetId: row.asset_id,
      assetName: isListRow ? row.asset_name : undefined,
      assetKode: isListRow ? row.asset_kode : undefined,
      title: row.title,
      description: row.description ?? '',
      frequency: row.frequency,
      scheduledDate: row.scheduled_date,
      status: row.status,
      assigneeType: row.assignee_type,
      assigneeName: row.assignee_name,
      vendorContactName: row.vendor_contact_name ?? undefined,
      vendorPhone: row.vendor_phone ?? undefined,
      estimatedCost: Number(row.estimated_cost ?? 0),
      notes: row.notes ?? '',
      createdBy: row.created_by,
      createdByName: isListRow ? row.created_by_name : undefined,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async list(user: AuthUser, page = 1, limit = 20, status?: MaintenanceScheduleStatus, search?: string) {
    const { rows, total } = await this.maintenanceRepository.list({
      page,
      limit,
      status,
      search: user.role === 'USER' ? search : search,
    });
    return {
      data: rows.map((row) => this.toPublic(row)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string) {
    const row = await this.maintenanceRepository.findById(id);
    if (!row) throw new NotFoundException('Maintenance schedule not found');
    return this.toPublic(row);
  }

  async create(user: AuthUser, dto: CreateMaintenanceScheduleDto) {
    await this.ensureRoomAndAsset(dto.roomId, dto.assetId);

    const row = await this.maintenanceRepository.create({
      roomId: dto.roomId,
      assetId: dto.assetId,
      title: dto.title,
      description: dto.description,
      frequency: dto.frequency,
      scheduledDate: dto.scheduledDate,
      status: dto.status,
      assigneeType: dto.assigneeType,
      assigneeName: dto.assigneeName,
      vendorContactName: dto.vendorContactName,
      vendorPhone: dto.vendorPhone,
      estimatedCost: dto.estimatedCost,
      notes: dto.notes,
      createdBy: user.id,
    });
    const detail = await this.maintenanceRepository.findById(row.id);
    return this.toPublic(detail ?? row);
  }

  async update(user: AuthUser, id: string, dto: UpdateMaintenanceScheduleDto) {
    const existing = await this.maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundException('Maintenance schedule not found');
    this.assertCanManage(user);

    await this.ensureRoomAndAsset(dto.roomId, dto.assetId);

    const row = await this.maintenanceRepository.update(id, {
      roomId: dto.roomId,
      assetId: dto.assetId,
      title: dto.title,
      description: dto.description,
      frequency: dto.frequency,
      scheduledDate: dto.scheduledDate,
      status: dto.status,
      assigneeType: dto.assigneeType,
      assigneeName: dto.assigneeName,
      vendorContactName: dto.vendorContactName,
      vendorPhone: dto.vendorPhone,
      estimatedCost: dto.estimatedCost,
      notes: dto.notes,
      completedAt: dto.status === 'DONE' ? new Date() : undefined,
    });
    if (!row) throw new NotFoundException('Maintenance schedule not found');
    const detail = await this.maintenanceRepository.findById(id);
    return this.toPublic(detail ?? row);
  }

  async updateStatus(user: AuthUser, id: string, dto: UpdateMaintenanceScheduleStatusDto) {
    const existing = await this.maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundException('Maintenance schedule not found');
    this.assertCanManage(user);

    const completedAt = dto.status === 'DONE' ? new Date() : dto.status === 'CANCELLED' ? existing.completed_at : existing.completed_at;
    const row = await this.maintenanceRepository.updateStatus(id, dto.status, dto.notes, completedAt);
    if (!row) throw new NotFoundException('Maintenance schedule not found');
    const detail = await this.maintenanceRepository.findById(id);
    return this.toPublic(detail ?? row);
  }

  async remove(user: AuthUser, id: string) {
    this.assertCanManage(user);
    const ok = await this.maintenanceRepository.delete(id);
    if (!ok) throw new NotFoundException('Maintenance schedule not found');
    return { deleted: true };
  }

  private async ensureRoomAndAsset(roomId?: string, assetId?: string) {
    if (roomId) {
      const room = await this.roomsRepository.findById(roomId);
      if (!room) throw new NotFoundException('Room not found');
    }

    if (assetId) {
      const asset = await this.assetsRepository.findById(assetId);
      if (!asset) throw new NotFoundException('Asset not found');
      if (roomId && asset.room_id !== roomId) {
        throw new BadRequestException('Asset must belong to the selected room');
      }
    }
  }

  private assertCanManage(user: AuthUser) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied');
    }
  }
}
