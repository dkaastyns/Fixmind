import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { AuthUser } from '../../../common/decorators/current-user.decorator';
import { MaintenanceRepository, type MaintenanceDetailRow, type MaintenanceRow } from '../repositories/maintenance.repository';
import type { CreateMaintenanceDto, UpdateMaintenanceDto } from '../dto/maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(private readonly maintenanceRepository: MaintenanceRepository) {}

  toPublic(row: MaintenanceDetailRow | MaintenanceRow) {
    const isDetail = 'room_name' in row;
    
    // Map DB frequency back to frontend representation
    let freq = row.frequency;
    if (freq === 'ONE_TIME') freq = 'ONCE';

    return {
      id: row.id,
      roomId: row.room_id,
      assetId: row.asset_id,
      technicianId: row.assigned_to,
      frequency: freq,
      title: row.title,
      description: row.description,
      status: row.status,
      notes: row.notes,
      scheduledDate: row.scheduled_date ? new Date(row.scheduled_date).toISOString().split('T')[0] : '',
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...(isDetail
        ? {
            assetName: (row as MaintenanceDetailRow).asset_name,
            assetCode: (row as MaintenanceDetailRow).asset_code,
            roomName: (row as MaintenanceDetailRow).room_name,
            technicianName: (row as MaintenanceDetailRow).technician_name,
          }
        : {}),
    };
  }

  async list(user: AuthUser, page = 1, limit = 20, status?: string) {
    const filters: Parameters<MaintenanceRepository['list']>[0] = { page, limit, status };

    // Technicians can only see their own schedules
    if (user.role === 'TECHNICIAN') {
      filters.technicianId = user.id;
    }

    const { rows, total } = await this.maintenanceRepository.list(filters);
    return {
      data: rows.map((r) => this.toPublic(r)),
      meta: { page, limit, total },
    };
  }

  async getById(user: AuthUser, id: string) {
    const row = await this.maintenanceRepository.findDetail(id);
    if (!row) throw new NotFoundException('Maintenance schedule not found');

    if (user.role === 'TECHNICIAN' && row.assigned_to !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.toPublic(row);
  }

  async create(user: AuthUser, dto: CreateMaintenanceDto) {
    const row = await this.maintenanceRepository.create({ ...dto, createdBy: user.id });
    const detail = await this.maintenanceRepository.findDetail(row.id);
    return this.toPublic(detail ?? row);
  }

  async update(user: AuthUser, id: string, dto: UpdateMaintenanceDto) {
    const existing = await this.maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundException('Maintenance schedule not found');

    // Technicians can only update their own schedules and only status/notes
    if (user.role === 'TECHNICIAN') {
      if (existing.assigned_to !== user.id) {
        throw new ForbiddenException('Not assigned to this schedule');
      }
    }

    const updated = await this.maintenanceRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Maintenance schedule not found');

    const detail = await this.maintenanceRepository.findDetail(id);
    return this.toPublic(detail ?? updated);
  }

  async remove(id: string) {
    const existing = await this.maintenanceRepository.findById(id);
    if (!existing) throw new NotFoundException('Maintenance schedule not found');

    await this.maintenanceRepository.delete(id);
    return { id };
  }
}

