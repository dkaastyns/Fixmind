import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
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

export class AssignReportDto {
  @IsUUID()
  technicianId!: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
