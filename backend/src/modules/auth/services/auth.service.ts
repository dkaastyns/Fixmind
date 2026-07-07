import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthUser } from '../../../common/decorators/current-user.decorator';
import type { UserRow } from '../../../common/types/database-rows';
import {
  SessionsRepository,
} from '../repositories/auth.repository';
import { UsersRepository } from '../../users/repositories/users.repository';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  toAuthUser(user: UserRow): AuthUser {
    return {
      id: user.id,
      email: user.email,
      role: user.is_admin ? 'ADMIN' : 'USER',
      fullName: user.full_name,
    };
  }

  toPublicUser(user: UserRow) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isAdmin: user.is_admin,
      role: user.is_admin ? 'ADMIN' : 'USER',
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      createdAt: user.created_at,
    };
  }

  async login(
    email: string,
    password: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const user = await this.usersRepository.findByEmail(email.toLowerCase());
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user, meta);
    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    const session = await this.sessionsRepository.findValidByTokenHash(hash);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersRepository.findById(session.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.sessionsRepository.revoke(session.id);
    return this.issueTokens(user);
  }

  async logout(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    const session = await this.sessionsRepository.findValidByTokenHash(hash);
    if (session) {
      await this.sessionsRepository.revoke(session.id);
    }
    return { loggedOut: true };
  }

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) {
    const existing = await this.usersRepository.findByEmail(data.email.toLowerCase());
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      isAdmin: false,
      phone: data.phone,
    });

    return this.toPublicUser(user);
  }

  async registerAdminSeed(data: {
    email: string;
    password: string;
    fullName: string;
  }) {
    const existing = await this.usersRepository.findByEmail(
      data.email.toLowerCase(),
    );
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await this.usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      isAdmin: true,
    });

    return this.toPublicUser(user);
  }

  private async issueTokens(
    user: UserRow,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<TokenPair> {
    const payload = this.toAuthUser(user);
    const accessExpires = this.config.get<string>('JWT_ACCESS_EXPIRES', '15m');
    const refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES', '7d');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: accessExpires as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = randomBytes(48).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);

    await this.sessionsRepository.create({
      userId: user.id,
      refreshTokenHash,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      expiresAt: this.parseExpiry(refreshExpires),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpires,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(duration: string): Date {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
