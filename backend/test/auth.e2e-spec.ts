import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsersRepository } from '../src/modules/users/repositories/users.repository';
import { UsersService } from '../src/modules/users/services/users.service';
import { AuthService } from '../src/modules/auth/services/auth.service';
import { CloudinaryService } from '../src/modules/cloudinary/services/cloudinary.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/auth.guards';

import { IS_PUBLIC_KEY } from '../src/common/decorators/roles.decorator';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUser = {
    id: '8a83dc53-c9cf-41c6-99b8-3e478eb079c6',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    full_name: 'Test User',
    role: 'USER',
    phone: '0812345678',
    avatar_url: null,
    is_active: true,
  };

  const mockUsersRepository = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  const mockUsersService = {
    update: jest.fn().mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
      fullName: 'Updated Name',
      phone: '089999999',
      role: 'USER',
      avatarUrl: null,
    }),
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockUser),
    login: jest.fn().mockResolvedValue({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.full_name,
        role: mockUser.role,
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: '15m',
    }),
    refresh: jest.fn().mockResolvedValue({
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
      expiresIn: '15m',
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    toPublicUser: jest.fn().mockImplementation((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name || u.fullName,
      role: u.role,
    })),
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn().mockResolvedValue({
      secure_url: 'https://cloudinary.com/avatar.jpg',
      public_id: 'avatar_id',
    }),
  };

  beforeEach(async () => {
    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockImplementation(function (
      this: any,
      context: any,
    ) {
      const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
      const req = context.switchToHttp().getRequest();
      req.user = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };
      return true;
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersRepository)
      .useValue(mockUsersRepository)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .overrideProvider(CloudinaryService)
      .useValue(mockCloudinaryService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/register', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
        phone: '0812345678',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Registration successful');
        expect(res.body.data.accessToken).toBe('mock-access-token');
      });
  });

  it('POST /auth/login', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Login successful');
        expect(res.body.data.accessToken).toBe('mock-access-token');
      });
  });

  it('POST /auth/refresh', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'mock-refresh-token' })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Token refreshed');
        expect(res.body.data.accessToken).toBe('new-mock-access-token');
      });
  });

  it('POST /auth/logout', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Logged out');
        expect(res.body.data.loggedOut).toBe(true);
      });
  });

  it('GET /auth/me', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Profile retrieved');
        expect(res.body.data.id).toBe(mockUser.id);
      });
  });

  it('PATCH /auth/profile', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/auth/profile')
      .send({
        fullName: 'Updated Name',
        phone: '089999999',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Profile updated successfully');
        expect(res.body.data.fullName).toBe('Updated Name');
      });
  });
});
