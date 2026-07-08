import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { AssetStatus } from '../../../common/types/database-rows';

export class CreateAssetDto {
  @IsUUID()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  idpemda!: string;

  @IsString()
  @IsNotEmpty()
  kodeBarang!: string;

  @IsString()
  @IsNotEmpty()
  nomorRegister!: string;

  @IsString()
  @IsNotEmpty()
  namaBarang!: string;

  @IsString()
  @IsNotEmpty()
  merkType!: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsString()
  idpemda?: string;

  @IsOptional()
  @IsString()
  kodeBarang?: string;

  @IsOptional()
  @IsString()
  nomorRegister?: string;

  @IsOptional()
  @IsString()
  namaBarang?: string;

  @IsOptional()
  @IsString()
  merkType?: string;

  @IsOptional()
  @IsIn(['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'])
  status?: AssetStatus;
}

export class ImportAssetsQueryDto {
  @IsUUID()
  roomId!: string;
}

export class CreateAssetTransferDto {
  @IsUUID()
  assetId!: string;

  @IsUUID()
  toRoomId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class ReviewAssetTransferDto {
  @IsIn(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  notes?: string;
}
