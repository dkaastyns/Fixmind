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
import type { UserRole } from '../../common/types/database-rows';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UsersService } from './services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('role') role?: UserRole,
  ) {
    const result = await this.usersService.list(Number(page), Number(limit), role);
    return { message: 'Users retrieved', ...result };
  }

  @Roles('ADMIN', 'TECHNICIAN')
  @Get('technicians')
  async technicians() {
    const data = await this.usersService.listTechnicians();
    return { message: 'Technicians retrieved', data };
  }

  @Roles('ADMIN')
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.usersService.getById(id);
    return { message: 'User retrieved', data };
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return { message: 'User created', data };
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(id, dto);
    return { message: 'User updated', data };
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(id);
    return { message: 'User deleted', data };
  }
}
