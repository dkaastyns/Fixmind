import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '../../../common/decorators/current-user.decorator';
import type { ReportListRow } from '../repositories/reports.repository';
import type { ReportRow, ReportStatus } from '../../../common/types/database-rows';
import { PriorityEngineService } from '../../ai/services/priority-engine.service';
import { AssetsRepository } from '../../assets/repositories/assets.repository';
import { RoomsRepository } from '../../rooms/repositories/rooms.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import {
  AssignReportDto,
  CreateRatingDto,
  CreateReportDto,
  UpdateReportStatusDto,
} from '../dto/report.dto';
import { CloudinaryService } from '../../cloudinary/services/cloudinary.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';
import { ReportsRepository } from '../repositories/reports.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly roomsRepository: RoomsRepository,
    private readonly assetsRepository: AssetsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly priorityEngine: PriorityEngineService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  toPublic(row: ReportListRow | ReportRow, extras?: { histories?: unknown[]; rating?: unknown; attachments?: unknown[] }) {
    const isDetail = 'room_name' in row;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      aiPriorityScore: row.ai_priority_score ? Number(row.ai_priority_score) : null,
      aiPriorityReason: row.ai_priority_reason,
      aiRecommendation: row.ai_recommendation,
      aiEstimatedRepairHours: row.ai_estimated_repair_hours
        ? Number(row.ai_estimated_repair_hours)
        : null,
      aiSuggestedAction: row.ai_suggested_action,
      aiAnalysisStatus: row.ai_analysis_status,
      reporterId: row.reporter_id,
      roomId: row.room_id,
      assetId: row.asset_id,
      assignedTechnicianId: row.assigned_technician_id,
      assignedAt: row.assigned_at,
      completedAt: row.completed_at,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ...(isDetail
        ? {
            roomName: row.room_name,
            roomCode: row.room_code,
            assetName: row.asset_name,
            reporterName: row.reporter_name,
            technicianName: row.technician_name,
          }
        : {}),
      ...extras,
    };
  }

  async list(user: AuthUser, page = 1, limit = 20, status?: ReportStatus) {
    const filters: Parameters<ReportsRepository['list']>[0] = { page, limit, status };

    if (user.role === 'USER') filters.reporterId = user.id;
    else if (user.role === 'TECHNICIAN') filters.technicianId = user.id;

    const { rows, total } = await this.reportsRepository.list(filters);
    return {
      data: rows.map((r) => this.toPublic(r)),
      meta: { page, limit, total },
    };
  }

  async getById(user: AuthUser, id: string) {
    const report = await this.reportsRepository.findDetail(id);
    if (!report) throw new NotFoundException('Report not found');
    this.assertCanView(user, report);

    const histories = await this.reportsRepository.getHistories(id);
    const rating = await this.reportsRepository.getRating(id);

    return this.toPublic(report, {
      histories: histories.map((h) => ({
        id: h.id,
        action: h.action,
        oldStatus: h.old_status,
        newStatus: h.new_status,
        note: h.note,
        createdAt: h.created_at,
      })),
      rating: rating
        ? { score: rating.score, comment: rating.comment, createdAt: rating.created_at }
        : null,
      attachments: await this.reportsRepository.getAttachments(id),
    });
  }

  async create(user: AuthUser, dto: CreateReportDto) {
    const room = await this.roomsRepository.findById(dto.roomId);
    if (!room || !room.is_active) throw new NotFoundException('Room not found');

    if (dto.assetId) {
      const asset = await this.assetsRepository.findById(dto.assetId);
      if (!asset || asset.room_id !== dto.roomId) {
        throw new BadRequestException('Invalid asset for selected room');
      }
    }

    const report = await this.reportsRepository.create({
      reporterId: user.id,
      roomId: dto.roomId,
      assetId: dto.assetId,
      title: dto.title,
      description: dto.description,
    });

    await this.reportsRepository.addHistory({
      reportId: report.id,
      actorId: user.id,
      action: 'CREATED',
      newStatus: 'PENDING',
    });

    void this.runAiAnalysis(report.id, room.name, dto.assetId, dto.description);

    const detail = await this.reportsRepository.findDetail(report.id);
    const result = this.toPublic(detail ?? report);

    this.notificationsGateway.notifyAdmins('report.created', result);

    return result;
  }

  async updateStatus(user: AuthUser, id: string, dto: UpdateReportStatusDto) {
    const report = await this.reportsRepository.findById(id);
    if (!report) throw new NotFoundException('Report not found');

    if (user.role === 'TECHNICIAN') {
      if (report.assigned_technician_id !== user.id) {
        throw new ForbiddenException('Not assigned to this report');
      }
      const allowed: ReportStatus[] = ['IN_PROGRESS', 'COMPLETED'];
      if (!allowed.includes(dto.status)) {
        throw new ForbiddenException('Technicians can only set IN_PROGRESS or COMPLETED');
      }
    }

    const completedAt =
      dto.status === 'COMPLETED' ? new Date() : report.completed_at;

    const updated = await this.reportsRepository.updateStatus(id, dto.status, {
      completedAt,
    });
    if (!updated) throw new NotFoundException('Report not found');

    await this.reportsRepository.addHistory({
      reportId: id,
      actorId: user.id,
      action: 'STATUS_CHANGED',
      oldStatus: report.status,
      newStatus: dto.status,
      note: dto.note,
    });

    const detail = await this.reportsRepository.findDetail(id);
    const result = this.toPublic(detail ?? updated);

    this.notificationsGateway.notifyAdmins('report.updated', result);
    if (result.assignedTechnicianId) {
      this.notificationsGateway.notifyTechnician(result.assignedTechnicianId, 'report.updated', result);
    }
    this.notificationsGateway.notifyUser(result.reporterId, 'report.updated', result);

    return result;
  }

  async assign(user: AuthUser, id: string, dto: AssignReportDto) {
    const report = await this.reportsRepository.findById(id);
    if (!report) throw new NotFoundException('Report not found');

    const tech = await this.usersRepository.findById(dto.technicianId);
    if (!tech || tech.role !== 'TECHNICIAN' || !tech.is_active) {
      throw new BadRequestException('Invalid technician');
    }

    const updated = await this.reportsRepository.updateStatus(id, 'ASSIGNED', {
      assignedTechnicianId: dto.technicianId,
      assignedAt: new Date(),
      adminNotes: dto.adminNotes,
    });
    if (!updated) throw new NotFoundException('Report not found');

    await this.reportsRepository.addHistory({
      reportId: id,
      actorId: user.id,
      action: 'ASSIGNED',
      oldStatus: report.status,
      newStatus: 'ASSIGNED',
      note: dto.adminNotes,
      metadata: { technicianId: dto.technicianId },
    });

    const detail = await this.reportsRepository.findDetail(id);
    const result = this.toPublic(detail ?? updated);

    this.notificationsGateway.notifyAdmins('report.assigned', result);
    this.notificationsGateway.notifyTechnician(dto.technicianId, 'report.assigned', result);

    return result;
  }

  async rate(user: AuthUser, id: string, dto: CreateRatingDto) {
    const report = await this.reportsRepository.findById(id);
    if (!report) throw new NotFoundException('Report not found');
    if (report.reporter_id !== user.id) throw new ForbiddenException('Only reporter can rate');
    if (report.status !== 'COMPLETED') throw new BadRequestException('Report not completed');

    const existing = await this.reportsRepository.getRating(id);
    if (existing) throw new BadRequestException('Already rated');

    const rating = await this.reportsRepository.createRating({
      reportId: id,
      userId: user.id,
      score: dto.score,
      comment: dto.comment,
    });

    await this.reportsRepository.addHistory({
      reportId: id,
      actorId: user.id,
      action: 'RATED',
      note: `Rating: ${dto.score}/5`,
    });

    return {
      score: rating.score,
      comment: rating.comment,
      createdAt: rating.created_at,
    };
  }

  async uploadAttachment(user: AuthUser, reportId: string, file: Express.Multer.File, type: string) {
    const report = await this.reportsRepository.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');
    
    // Authorization check
    if (user.role === 'USER' && report.reporter_id !== user.id) {
      throw new ForbiddenException('Not your report');
    }
    if (user.role === 'TECHNICIAN' && report.assigned_technician_id !== user.id) {
      throw new ForbiddenException('Not assigned to this report');
    }

    const currentAttachments = await this.reportsRepository.getAttachments(reportId);
    if (currentAttachments.length >= 3) {
      throw new BadRequestException('Maximum 3 photos allowed per report');
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file, 'fixmind/reports');

    await this.reportsRepository.addAttachment({
      reportId: report.id,
      uploadedBy: user.id,
      type,
      cloudinaryPublicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    });

    return {
      url: uploadResult.secure_url,
    };
  }

  private assertCanView(user: AuthUser, report: ReportListRow) {
    if (user.role === 'ADMIN') return;
    if (user.role === 'USER' && report.reporter_id === user.id) return;
    if (user.role === 'TECHNICIAN' && report.assigned_technician_id === user.id) return;
    throw new ForbiddenException('Access denied');
  }

  private async runAiAnalysis(
    reportId: string,
    roomName: string,
    assetId: string | undefined,
    description: string,
  ) {
    try {
      let assetName: string | undefined;
      if (assetId) {
        const asset = await this.assetsRepository.findById(assetId);
        assetName = asset?.name;
      }

      const result = await this.priorityEngine.analyzeReport({
        roomName,
        assetName,
        description,
      });

      if (!result) {
        await this.reportsRepository.updateAiFields(reportId, { aiAnalysisStatus: 'FAILED' });
        return;
      }

      await this.reportsRepository.updateAiFields(reportId, {
        priority: result.priority,
        aiPriorityScore: result.score,
        aiPriorityReason: result.reason,
        aiRecommendation: result.recommendation,
        aiEstimatedRepairHours: result.estimatedRepairHours,
        aiSuggestedAction: result.suggestedAction,
        aiAnalysisStatus: 'COMPLETED',
      });

      await this.reportsRepository.addHistory({
        reportId,
        action: 'AI_ANALYZED',
        note: `AI priority: ${result.priority}`,
        metadata: { score: result.score },
      });
    } catch {
      await this.reportsRepository.updateAiFields(reportId, { aiAnalysisStatus: 'FAILED' });
    }
  }

  async addComment(user: AuthUser, reportId: string, content: string) {
    const report = await this.reportsRepository.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');

    // Authorization: admin can comment on any, reporter and assigned technician can comment on their own
    if (user.role === 'USER' && report.reporter_id !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'TECHNICIAN' && report.assigned_technician_id !== user.id) {
      throw new ForbiddenException('Not assigned to this report');
    }

    const comment = await this.reportsRepository.addComment(reportId, user.id, content);
    return {
      id: comment.id,
      reportId: comment.report_id,
      authorId: comment.author_id,
      content: comment.content,
      createdAt: comment.created_at,
    };
  }

  async getComments(user: AuthUser, reportId: string) {
    const report = await this.reportsRepository.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');

    if (user.role === 'USER' && report.reporter_id !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'TECHNICIAN' && report.assigned_technician_id !== user.id) {
      throw new ForbiddenException('Not assigned to this report');
    }

    const comments = await this.reportsRepository.getComments(reportId);
    return comments.map((c) => ({
      id: c.id,
      reportId: c.report_id,
      authorId: c.author_id,
      authorName: c.author_name,
      authorRole: c.author_role,
      content: c.content,
      createdAt: c.created_at,
    }));
  }

  async exportAllForExcel() {
    return this.reportsRepository.list({ page: 1, limit: 100000 });
  }
}

