import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateMaintenanceScheduleDto, UpdateMaintenanceScheduleDto, UpdateMaintenanceScheduleStatusDto } from './dto/maintenance.dto';
import { MaintenanceService } from './services/maintenance.service';
import type { MaintenanceScheduleStatus } from '../../common/types/database-rows';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: MaintenanceScheduleStatus,
    @Query('search') search?: string,
  ) {
    const result = await this.maintenanceService.list(user, Number(page), Number(limit), status, search);
    return { message: 'Maintenance schedules retrieved', ...result };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.maintenanceService.getById(id);
    return { message: 'Maintenance schedule retrieved', data };
  }

  @Roles('ADMIN')
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateMaintenanceScheduleDto) {
    const data = await this.maintenanceService.create(user, dto);
    return { message: 'Maintenance schedule created', data };
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceScheduleDto,
  ) {
    const data = await this.maintenanceService.update(user, id, dto);
    return { message: 'Maintenance schedule updated', data };
  }

  @Roles('ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceScheduleStatusDto,
  ) {
    const data = await this.maintenanceService.updateStatus(user, id, dto);
    return { message: 'Maintenance status updated', data };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const data = await this.maintenanceService.remove(user, id);
    return { message: 'Maintenance schedule deleted', data };
  }
}
