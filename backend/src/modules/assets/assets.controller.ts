import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetsService } from './services/assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('roomId') roomId?: string,
  ) {
    const result = await this.assetsService.list(Number(page), Number(limit), roomId);
    return { message: 'Assets retrieved', ...result };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.assetsService.getById(id);
    return { message: 'Asset retrieved', data };
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateAssetDto) {
    const data = await this.assetsService.create(dto);
    return { message: 'Asset created', data };
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    const data = await this.assetsService.update(id, dto);
    return { message: 'Asset updated', data };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.assetsService.remove(id);
    return { message: 'Asset deleted', data };
  }
}
