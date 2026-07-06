import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'OVERDUE';
export type MaintenanceFrequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsUUID()
  roomId!: string;

  @IsUUID()
  @IsOptional()
  assetId?: string;

  @IsUUID()
  technicianId!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsEnum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'])
  frequency!: MaintenanceFrequency;
}

export class UpdateMaintenanceDto {
  @IsEnum(['SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'])
  @IsOptional()
  status?: MaintenanceStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}

