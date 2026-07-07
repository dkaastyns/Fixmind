import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateAssetDto, ImportAssetsQueryDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetsService } from './services/assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('roomId') roomId?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.assetsService.list(Number(page), Number(limit), roomId, search);
    return { message: 'Assets retrieved', ...result };
  }

  /**
   * Download template Excel untuk import aset.
   * Endpoint ini harus dideklarasikan SEBELUM :id agar tidak
   * disalah-artikan sebagai parameter id.
   */
  @Roles('ADMIN')
  @Get('import/template')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.assetsService.generateImportTemplate();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template_import_aset.xlsx"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
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
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @Query() query: ImportAssetsQueryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.assetsService.importExcel(query.roomId, file);
    return { message: 'Assets imported', data };
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
