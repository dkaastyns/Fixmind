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
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './dto/maintenance.dto';
import { MaintenanceService } from './services/maintenance.service';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const result = await this.maintenanceService.list(user, Number(page), Number(limit), status);
    return { message: 'Maintenance schedules retrieved', ...result };
  }

  @Get(':id')
  async getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const data = await this.maintenanceService.getById(user, id);
    return { message: 'Maintenance schedule retrieved', data };
  }

  @Roles('ADMIN')
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateMaintenanceDto) {
    const data = await this.maintenanceService.create(user, dto);
    return { message: 'Maintenance schedule created', data };
  }

  @Roles('ADMIN', 'TECHNICIAN')
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    const data = await this.maintenanceService.update(user, id, dto);
    return { message: 'Maintenance schedule updated', data };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.maintenanceService.remove(id);
    return { message: 'Maintenance schedule deleted', data };
  }
}
