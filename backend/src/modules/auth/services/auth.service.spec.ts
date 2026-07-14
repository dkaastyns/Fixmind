import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from '../../users/repositories/users.repository';
import { SessionsRepository } from '../repositories/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService - Account Lockout', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<UsersRepository>;

  const mockUser = {
    id: 'user-1',
    email: 'user@fixmind.local',
    password_hash: 'hashed_password',
    full_name: 'Test User',
    role: 'USER' as const,
    is_admin: false,
    phone: null,
    avatar_url: null,
    is_active: true,
    failed_login_attempts: 0,
    lockout_until: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const mockUsersRepository = {
      findByEmail: jest.fn(),
      update: jest.fn(),
    };
    const mockSessionsRepository = {
      create: jest.fn().mockResolvedValue({}),
    };
    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('access_token'),
    };
    const mockConfigService = {
      get: jest.fn().mockReturnValue('15m'),
      getOrThrow: jest.fn().mockReturnValue('secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: SessionsRepository, useValue: mockSessionsRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(UsersRepository);
  });

  it('successful login resets failed attempts', async () => {
    const userWithAttempts = {
      ...mockUser,
      failed_login_attempts: 2,
    };
    usersRepository.findByEmail.mockResolvedValue(userWithAttempts);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login('user@fixmind.local', 'password');

    expect(result.user.email).toBe('user@fixmind.local');
    expect(usersRepository.update).toHaveBeenCalledWith('user-1', {
      failedLoginAttempts: 0,
      lockoutUntil: null,
    });
  });

  it('failed login increments attempts', async () => {
    usersRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login('user@fixmind.local', 'wrong_password')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(usersRepository.update).toHaveBeenCalledWith('user-1', {
      failedLoginAttempts: 1,
      lockoutUntil: null,
    });
  });

  it('5th failed login locks out the account', async () => {
    const userWith4Attempts = {
      ...mockUser,
      failed_login_attempts: 4,
    };
    usersRepository.findByEmail.mockResolvedValue(userWith4Attempts);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login('user@fixmind.local', 'wrong_password')).rejects.toThrow(
      new UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.'),
    );

    expect(usersRepository.update).toHaveBeenCalledWith('user-1', {
      failedLoginAttempts: 5,
      lockoutUntil: expect.any(Date),
    });
  });

  it('rejects login if account is locked out', async () => {
    const lockedUser = {
      ...mockUser,
      lockout_until: new Date(Date.now() + 10 * 60 * 1000), // locked for 10 more minutes
    };
    usersRepository.findByEmail.mockResolvedValue(lockedUser);

    await expect(service.login('user@fixmind.local', 'password')).rejects.toThrow(
      /Account locked. Please try again in 10 minutes./,
    );

    expect(usersRepository.update).not.toHaveBeenCalled();
  });
});
