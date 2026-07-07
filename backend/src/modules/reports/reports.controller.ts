import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { ReportStatus } from '../../common/types/database-rows';
import {
  AssignReportDto,
  CreateReportDto,
  UpdateReportStatusDto,
} from './dto/report.dto';
import { CreateCommentDto } from './dto/comment.dto';
import { ReportsService } from './services/reports.service';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles('ADMIN')
  @Get('export/excel')
  async exportExcel(
    @CurrentUser() _user: AuthUser, 
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const { rows } = await this.reportsService.exportAllForExcel(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'E-Lapor DPRD';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Reports');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Judul Laporan', key: 'title', width: 40 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Prioritas', key: 'priority', width: 12 },
      { header: 'Ruangan', key: 'room_name', width: 24 },
      { header: 'Pelapor', key: 'reporter_name', width: 24 },
      { header: 'Teknisi', key: 'technician_name', width: 24 },
      { header: 'Dibuat Pada', key: 'created_at', width: 22 },
      { header: 'Selesai Pada', key: 'completed_at', width: 22 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A5F' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const r of rows) {
      sheet.addRow({
        id: r.id,
        title: r.title,
        status: r.status,
        priority: r.priority ?? '',
        room_name: r.room_name,
        reporter_name: r.reporter_name,
        technician_name: r.technician_name ?? '',
        created_at: r.created_at ? new Date(r.created_at).toISOString() : '',
        completed_at: r.completed_at ? new Date(r.completed_at).toISOString() : '',
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="fixmind-reports.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  }

  @Roles('ADMIN')
  @Get('export/pdf')
  async exportPdf(
    @CurrentUser() _user: AuthUser, 
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const { rows } = await this.reportsService.exportAllForExcel(startDate, endDate);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    doc.setFontSize(16);
    doc.text('E-Lapor DPRD – Ekspor Laporan', 40, 40);
    doc.setFontSize(10);
    doc.text(`Dibuat: ${new Date().toISOString()}`, 40, 58);

    autoTable(doc, {
      startY: 70,
      head: [['Judul', 'Status', 'Prioritas', 'Ruangan', 'Pelapor', 'Teknisi', 'Dibuat Pada']],
      body: rows.map((r) => [
        String(r.title),
        String(r.status),
        r.priority ?? '-',
        r.room_name,
        r.reporter_name,
        r.technician_name ?? '-',
        r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="fixmind-reports.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  }

  @Get()
  async list(
    @CurrentUser() user: AuthUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: ReportStatus,
  ) {
    const result = await this.reportsService.list(user, Number(page), Number(limit), status);
    return { message: 'Reports retrieved', ...result };
  }

  @Get(':id')
  async getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    const data = await this.reportsService.getById(user, id);
    return { message: 'Report retrieved', data };
  }

  @Roles('USER', 'ADMIN')
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateReportDto) {
    const data = await this.reportsService.create(user, dto);
    return { message: 'Report created', data };
  }

  @Roles('TECHNICIAN', 'ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    const data = await this.reportsService.updateStatus(user, id, dto);
    return { message: 'Report status updated', data };
  }

  @Roles('ADMIN')
  @Post(':id/assign')
  async assign(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AssignReportDto,
  ) {
    const data = await this.reportsService.assign(user, id, dto);
    return { message: 'Technician assigned', data };
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1.5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) file: Express.Multer.File,
    @Body('type') type: string = 'DAMAGE'
  ) {
    const data = await this.reportsService.uploadAttachment(user, id, file, type);
    return { message: 'Attachment uploaded', data };
  }

  @Post(':id/comments')
  async addComment(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const data = await this.reportsService.addComment(user, id, dto.content);
    return { message: 'Comment added', data };
  }

  @Get(':id/comments')
  async getComments(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    const data = await this.reportsService.getComments(user, id);
    return { message: 'Comments retrieved', data };
  }
}
