import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserRow } from '../../../common/types/database-rows';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  toPublic(user: UserRow) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  async list(page = 1, limit = 20, role?: UserRow['role']) {
    const { rows, total } = await this.usersRepository.list({ page, limit, role });
    return {
      data: rows.map((r) => this.toPublic(r)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email.toLowerCase());
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
      role: dto.role,
      phone: dto.phone,
    });
    return this.toPublic(user);
  }

  async register(dto: { email: string; password: string; fullName: string; phone?: string }) {
    return this.create({
      ...dto,
      role: 'USER',
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Parameters<UsersRepository['update']>[1] = {};
    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.role) data.role = dto.role;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersRepository.update(id, data);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async remove(id: string) {
    const ok = await this.usersRepository.softDelete(id);
    if (!ok) throw new NotFoundException('User not found');
    return { deleted: true };
  }

  async listTechnicians() {
    const rows = await this.usersRepository.listTechnicians();
    return rows.map((r) => this.toPublic(r));
  }
}
