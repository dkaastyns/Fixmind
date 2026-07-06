import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import type { AssetStatus } from '../../../common/types/database-rows';

export class CreateAssetDto {
  @IsUUID()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  assetCode!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  assetCode?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['OPERATIONAL', 'NEEDS_MAINTENANCE', 'OUT_OF_SERVICE'])
  status?: AssetStatus;
}
