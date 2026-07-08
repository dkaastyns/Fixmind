import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import type { ReportStatus } from '../../../common/types/database-rows';

export class CreateReportDto {
  @IsUUID()
  roomId!: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

export class UpdateReportStatusDto {
  @IsEnum([
    'PENDING',
    'AI_ANALYSIS',
    'REVIEWED',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
  ])
  status!: ReportStatus;

  @IsOptional()
  @IsString()
  note?: string;
}



