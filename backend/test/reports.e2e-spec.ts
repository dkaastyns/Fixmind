import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ReportsRepository } from '../src/modules/reports/repositories/reports.repository';
import { RoomsRepository } from '../src/modules/rooms/repositories/rooms.repository';
import { AssetsRepository } from '../src/modules/assets/repositories/assets.repository';
import { PriorityEngineService } from '../src/modules/ai/services/priority-engine.service';
import { JwtAuthGuard } from '../src/modules/auth/guards/auth.guards';

import { IS_PUBLIC_KEY } from '../src/common/decorators/roles.decorator';

describe('ReportsController (e2e)', () => {
  let app: INestApplication<App>;

  const mockUser = {
    id: '8a83dc53-c9cf-41c6-99b8-3e478eb079c6',
    email: 'test@example.com',
    role: 'ADMIN',
  };

  const mockReport = {
    id: 'f93d1421-c240-410a-b32c-ee6f7902d184',
    title: 'AC Bocor di Ruang Rapat',
    description: 'AC nomor 2 mengeluarkan air terus-menerus.',
    status: 'PENDING',
    priority: 'HIGH',
    reporter_id: mockUser.id,
    room_id: '013dc06e-8260-496a-b2b7-a365df3586aa',
    asset_id: null,
    completed_at: null,
    admin_notes: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockReportsRepository = {
    findById: jest.fn().mockResolvedValue(mockReport),
    list: jest.fn().mockResolvedValue({ rows: [mockReport], total: 1 }),
    findDetail: jest.fn().mockResolvedValue({
      ...mockReport,
      room_name: 'Ruang Rapat DPRD',
      room_code: 'R-101',
      asset_name: null,
      reporter_name: 'Test User',
    }),
    create: jest.fn().mockResolvedValue(mockReport),
    addHistory: jest.fn().mockResolvedValue(undefined),
    updateStatus: jest.fn().mockResolvedValue({
      ...mockReport,
      status: 'IN_PROGRESS',
    }),
    getHistories: jest.fn().mockResolvedValue([]),
    getAttachments: jest.fn().mockResolvedValue([]),
    updateAiFields: jest.fn().mockResolvedValue(undefined),
  };

  const mockRoomsRepository = {
    findById: jest.fn().mockResolvedValue({ id: '013dc06e-8260-496a-b2b7-a365df3586aa', is_active: true, name: 'Ruang Rapat' }),
  };

  const mockAssetsRepository = {
    findById: jest.fn().mockResolvedValue(null),
  };

  const mockPriorityEngine = {
    analyzeReport: jest.fn().mockResolvedValue({
      priority: 'HIGH',
      score: 85,
      reason: 'Bocor menyebabkan gangguan serius pada ruangan rapat utama',
      recommendation: 'Periksa filter dan saluran pembuangan air AC',
      estimatedRepairHours: 2,
      suggestedTargetDate: new Date(),
      suggestedAction: 'Pembersihan pipa pembuangan',
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
      req.user = mockUser;
      return true;
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ReportsRepository)
      .useValue(mockReportsRepository)
      .overrideProvider(RoomsRepository)
      .useValue(mockRoomsRepository)
      .overrideProvider(AssetsRepository)
      .useValue(mockAssetsRepository)
      .overrideProvider(PriorityEngineService)
      .useValue(mockPriorityEngine)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /reports', () => {
    return request(app.getHttpServer())
      .get('/api/v1/reports')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data[0].id).toBe(mockReport.id);
      });
  });

  it('GET /reports/:id', () => {
    return request(app.getHttpServer())
      .get(`/api/v1/reports/${mockReport.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data.id).toBe(mockReport.id);
        expect(res.body.data.roomName).toBe('Ruang Rapat DPRD');
      });
  });

  it('POST /reports (valid)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/reports')
      .send({
        roomId: '013dc06e-8260-496a-b2b7-a365df3586aa',
        title: 'AC Bocor di Ruang Rapat',
        description: 'AC nomor 2 mengeluarkan air terus-menerus.',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Report created');
        expect(res.body.data.title).toBe(mockReport.title);
      });
  });

  it('POST /reports (invalid - missing title)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/reports')
      .send({
        roomId: '013dc06e-8260-496a-b2b7-a365df3586aa',
        description: 'AC nomor 2 mengeluarkan air terus-menerus.',
      })
      .expect(400);
  });

  it('PATCH /reports/:id/status', () => {
    return request(app.getHttpServer())
      .patch(`/api/v1/reports/${mockReport.id}/status`)
      .send({
        status: 'IN_PROGRESS',
        note: 'Teknisi sedang meluncur ke lokasi',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBe('Report status updated');
        expect(res.body.data.status).toBe('IN_PROGRESS');
      });
  });
});
