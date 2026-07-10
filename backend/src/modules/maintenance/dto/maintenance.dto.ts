import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import type { MaintenanceAssigneeType, MaintenanceFrequency, MaintenanceScheduleStatus } from '../../../common/types/database-rows';

export class CreateMaintenanceScheduleDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME'])
  frequency!: MaintenanceFrequency;

  @IsString()
  scheduledDate!: string;

  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'])
  status!: MaintenanceScheduleStatus;

  @IsIn(['INTERNAL', 'EXTERNAL_VENDOR'])
  assigneeType!: MaintenanceAssigneeType;

  @IsString()
  assigneeName!: string;

  @IsOptional()
  @IsString()
  vendorContactName?: string;

  @IsOptional()
  @IsString()
  vendorPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMaintenanceScheduleDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME'])
  frequency?: MaintenanceFrequency;

  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @IsOptional()
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'])
  status?: MaintenanceScheduleStatus;

  @IsOptional()
  @IsIn(['INTERNAL', 'EXTERNAL_VENDOR'])
  assigneeType?: MaintenanceAssigneeType;

  @IsOptional()
  @IsString()
  assigneeName?: string;

  @IsOptional()
  @IsString()
  vendorContactName?: string;

  @IsOptional()
  @IsString()
  vendorPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMaintenanceScheduleStatusDto {
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'])
  status!: MaintenanceScheduleStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
