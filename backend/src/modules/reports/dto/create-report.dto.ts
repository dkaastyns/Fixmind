import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, IsIn } from 'class-validator';

export const REPORT_STATUSES = [
  'PENDING',
  'AI_ANALYSIS',
  'REVIEWED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REJECTED'
] as const;

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUUID()
  roomId: string;

  @IsOptional()
  @IsUUID()
  assetId?: string;
}

export class UpdateReportStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(REPORT_STATUSES)
  status: typeof REPORT_STATUSES[number];
}
