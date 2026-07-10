import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SQL_TOKEN, type Sql } from '../../../database/sql';
import ExcelJS from 'exceljs';
import type { AuthUser } from '../../../common/decorators/current-user.decorator';
import type {
  AssetRow,
  AssetTransferRow,
  AssetTransferStatus,
} from '../../../common/types/database-rows';
import { RoomsRepository } from '../../rooms/repositories/rooms.repository';
import { CreateAssetDto, CreateAssetTransferDto, ReviewAssetTransferDto, UpdateAssetDto } from '../dto/asset.dto';
import { AssetsRepository } from '../repositories/assets.repository';
import { TransferRepository } from '../repositories/transfer.repository';

@Injectable()
export class AssetsService {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly transferRepository: TransferRepository,
    private readonly roomsRepository: RoomsRepository,
    @Inject(SQL_TOKEN) private readonly sql: Sql,
  ) {}

  toPublic(asset: AssetRow & { room_name?: string; room_code?: string }) {
    return {
      id: asset.id,
      roomId: asset.room_id,
      roomName: asset.room_name,
      roomCode: asset.room_code,
      idpemda: asset.idpemda,
      kodeBarang: asset.kode_barang,
      nomorRegister: asset.nomor_register,
      namaBarang: asset.nama_barang,
      merkType: asset.merk_type,
      status: asset.status,
      createdAt: asset.created_at,
    };
  }

  toTransferPublic(transfer: AssetTransferRow) {
    return {
      id: transfer.id,
      assetId: transfer.asset_id,
      assetName: transfer.asset_name ?? null,
      assetKode: transfer.asset_kode ?? null,
      requesterId: transfer.requester_id,
      requesterName: transfer.requester_name ?? null,
      fromRoomId: transfer.from_room_id,
      fromRoomName: transfer.from_room_name ?? null,
      fromRoomCode: transfer.from_room_code ?? null,
      toRoomId: transfer.to_room_id,
      toRoomName: transfer.to_room_name ?? null,
      toRoomCode: transfer.to_room_code ?? null,
      reason: transfer.reason,
      status: transfer.status,
      reviewedBy: transfer.reviewed_by,
      reviewedByName: transfer.reviewer_name ?? null,
      reviewedAt: transfer.reviewed_at,
      reviewerNotes: transfer.reviewer_notes,
      createdAt: transfer.created_at,
      updatedAt: transfer.updated_at,
    };
  }

  async list(page = 1, limit = 50, roomId?: string, search?: string) {
    if (search?.trim()) {
      const rows = await this.assetsRepository.search({ query: search, limit });
      return {
        data: rows.map((r) => this.toPublic(r)),
        meta: { page, limit, total: rows.length },
      };
    }

    const { rows, total } = await this.assetsRepository.list({ page, limit, roomId });

    return {
      data: rows.map((r) => this.toPublic(r)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string) {
    const asset = await this.assetsRepository.findById(id);
    if (!asset) throw new NotFoundException('Asset not found');
    return this.toPublic(asset);
  }

  async create(dto: CreateAssetDto) {
    const room = await this.roomsRepository.findById(dto.roomId);
    if (!room) throw new NotFoundException('Room not found');

    const asset = await this.assetsRepository.create({
      roomId: dto.roomId,
      idpemda: dto.idpemda,
      kodeBarang: dto.kodeBarang,
      nomorRegister: dto.nomorRegister,
      namaBarang: dto.namaBarang,
      merkType: dto.merkType,
    });
    return this.toPublic(asset);
  }

  async update(user: AuthUser, id: string, dto: UpdateAssetDto) {
    const oldAsset = await this.assetsRepository.findById(id);
    if (!oldAsset) throw new NotFoundException('Asset not found');

    const roomChanged = dto.roomId && dto.roomId !== oldAsset.room_id;

    if (dto.roomId) {
      const room = await this.roomsRepository.findById(dto.roomId);
      if (!room) throw new NotFoundException('Room not found');
    }

    const asset = await this.assetsRepository.update(id, {
      room_id: dto.roomId,
      idpemda: dto.idpemda,
      kode_barang: dto.kodeBarang,
      nomor_register: dto.nomorRegister,
      nama_barang: dto.namaBarang,
      merk_type: dto.merkType,
      status: dto.status,
    });
    if (!asset) throw new NotFoundException('Asset not found');

    if (roomChanged) {
      try {
        await this.transferRepository.create({
          assetId: id,
          requesterId: user.id,
          fromRoomId: oldAsset.room_id,
          toRoomId: dto.roomId!,
          reason: 'Dipindahkan langsung oleh Admin',
          status: 'APPROVED',
          reviewedBy: user.id,
          reviewedAt: new Date(),
          reviewerNotes: 'Otomatis disetujui melalui pemindahan instan Admin',
        });
      } catch (e) {
        // Ignored
      }
    }

    return this.toPublic(asset);
  }

  async remove(id: string) {
    const ok = await this.assetsRepository.softDelete(id);
    if (!ok) throw new NotFoundException('Asset not found');
    return { deleted: true };
  }

  async listTransfers(
    user: AuthUser,
    page = 1,
    limit = 20,
    status?: AssetTransferStatus,
    mineOnly = false,
    search?: string,
  ) {
    const requesterId = user.role === 'ADMIN' && !mineOnly ? undefined : user.id;
    const { rows, total } = await this.transferRepository.list({
      page,
      limit,
      status,
      requesterId,
      search,
    });

    return {
      data: rows.map((row) => this.toTransferPublic(row)),
      meta: { page, limit, total },
    };
  }

  async getTransferById(user: AuthUser, id: string) {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) throw new NotFoundException('Transfer not found');
    this.assertCanViewTransfer(user, transfer);
    return this.toTransferPublic(transfer);
  }

  async createTransfer(user: AuthUser, dto: CreateAssetTransferDto) {
    const asset = await this.assetsRepository.findById(dto.assetId);
    if (!asset) throw new NotFoundException('Asset not found');

    const fromRoom = await this.roomsRepository.findById(asset.room_id);
    if (!fromRoom) throw new NotFoundException('Current room not found');

    const toRoom = await this.roomsRepository.findById(dto.toRoomId);
    if (!toRoom) throw new NotFoundException('Target room not found');

    if (asset.room_id === dto.toRoomId) {
      throw new BadRequestException('Target room must be different from current room');
    }

    const pending = await this.transferRepository.hasPending(dto.assetId);
    if (pending) {
      throw new BadRequestException('Asset already has a pending transfer request');
    }

    try {
      const transfer = await this.transferRepository.create({
        assetId: dto.assetId,
        requesterId: user.id,
        fromRoomId: asset.room_id,
        toRoomId: dto.toRoomId,
        reason: dto.reason,
      });
      const detail = await this.transferRepository.findById(transfer.id);
      return this.toTransferPublic(detail ?? transfer);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new BadRequestException('Asset already has a pending transfer request');
      }
      throw error;
    }
  }

  async reviewTransfer(user: AuthUser, id: string, dto: ReviewAssetTransferDto) {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (transfer.status !== 'PENDING') {
      throw new BadRequestException('Transfer has already been reviewed');
    }

    const updated = await this.sql.begin(async (tx) => {
      const reviewed = await this.transferRepository.review(id, user.id, dto.decision, dto.notes, tx as unknown as Sql);
      if (!reviewed) {
        throw new BadRequestException('Transfer has already been reviewed');
      }

      if (dto.decision === 'APPROVED') {
        const moved = await this.assetsRepository.moveToRoom(reviewed.asset_id, reviewed.to_room_id, tx as unknown as Sql);
        if (!moved) {
          throw new NotFoundException('Asset not found');
        }
      }

      return reviewed;
    });

    const detail = await this.transferRepository.findById(id);
    return this.toTransferPublic(detail ?? updated);
  }

  async importExcel(roomId: string, file?: Express.Multer.File) {
    const room = await this.roomsRepository.findById(roomId);
    if (!room) throw new NotFoundException('Room not found');
    if (!file?.buffer?.length) throw new BadRequestException('Excel file is required');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new BadRequestException('Excel file does not contain a worksheet');

    const headerRow = worksheet.getRow(1);
    const headers = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      headers.set(this.normalizeHeader(cell.text), colNumber);
    });

    const required = ['idpemda', 'kode_barang', 'nomor_register', 'nama_barang', 'merk_type'];
    const missing = required.filter((name) => !headers.has(name));
    if (missing.length) {
      throw new BadRequestException(`Missing columns: ${missing.join(', ')}`);
    }

    const rows: Array<{
      roomId: string;
      idpemda: string;
      kodeBarang: string;
      nomorRegister: string;
      namaBarang: string;
      merkType: string;
    }> = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const item = {
        roomId,
        idpemda: this.cellText(row, headers.get('idpemda')),
        kodeBarang: this.cellText(row, headers.get('kode_barang')),
        nomorRegister: this.cellText(row, headers.get('nomor_register')),
        namaBarang: this.cellText(row, headers.get('nama_barang')),
        merkType: this.cellText(row, headers.get('merk_type')),
      };

      const hasAnyValue = [
        item.idpemda,
        item.kodeBarang,
        item.nomorRegister,
        item.namaBarang,
        item.merkType,
      ].some((value) => value.trim().length > 0);
      if (!hasAnyValue) return;

      const missingFields = Object.entries(item)
        .filter(([key, value]) => key !== 'roomId' && !value.trim())
        .map(([key]) => key);
      if (missingFields.length) {
        throw new BadRequestException(`Row ${rowNumber} missing: ${missingFields.join(', ')}`);
      }

      rows.push(item);
    });

    if (!rows.length) throw new BadRequestException('No asset rows found in Excel file');

    const imported = await this.assetsRepository.upsertMany(rows);
    return {
      imported: imported.length,
      data: imported.map((asset) => this.toPublic(asset)),
    };
  }

  /** Generate template Excel yang bisa di-download user sebagai panduan format import. */
  async generateImportTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'E-Lapor DPRD';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Template Import Aset', {
      pageSetup: { fitToPage: true },
    });

    // Definisi kolom sesuai skema database
    const columns = [
      { header: 'idpemda', key: 'idpemda', width: 20 },
      { header: 'kode_barang', key: 'kode_barang', width: 20 },
      { header: 'nomor_register', key: 'nomor_register', width: 22 },
      { header: 'nama_barang', key: 'nama_barang', width: 35 },
      { header: 'merk_type', key: 'merk_type', width: 25 },
    ];
    sheet.columns = columns;

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEF629F' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    headerRow.height = 22;

    // Contoh data baris pertama
    const exampleRow = sheet.addRow({
      idpemda: '1.3.2.01.10.001',
      kode_barang: 'KMP-001',
      nomor_register: 'REG-2024-001',
      nama_barang: 'Kursi Pimpinan',
      merk_type: 'Chitose / Type-A',
    });
    exampleRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF0F5' },
      };
      cell.font = { italic: true, color: { argb: 'FF888888' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    });

    // Sheet panduan
    const guide = workbook.addWorksheet('Panduan');
    guide.getColumn(1).width = 60;
    const info = [
      ['PANDUAN IMPORT ASET - E-LAPOR DPRD KOTA SEMARANG'],
      [''],
      ['Kolom yang wajib diisi:'],
      ['1. idpemda       - ID Pemda / Kode aset dari Pemkot (contoh: 1.3.2.01.10.001)'],
      ['2. kode_barang   - Kode Barang singkat unik (contoh: KMP-001)'],
      ['3. nomor_register - Nomor Register barang (contoh: REG-2024-001)'],
      ['4. nama_barang   - Nama lengkap barang (contoh: Kursi Pimpinan)'],
      ['5. merk_type     - Merk dan Type barang (contoh: Chitose / Type-A)'],
      [''],
      ['Catatan:'],
      ['- Baris pertama (header) harus menggunakan nama kolom persis seperti di atas.'],
      ['- Tidak boleh ada baris kosong di tengah data.'],
      ['- Jika kode_barang sudah ada, data akan diperbarui (upsert).'],
      ['- Hapus baris contoh (baris ke-2) sebelum mengisi data sebenarnya.'],
    ];
    info.forEach((row, i) => {
      const r = guide.getRow(i + 1);
      r.getCell(1).value = row[0];
      if (i === 0) {
        r.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFEF629F' } };
      } else if (i === 2) {
        r.getCell(1).font = { bold: true };
      }
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  private normalizeHeader(value: string) {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/&/g, 'dan')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const aliases: Record<string, string> = {
      id_pemda: 'idpemda',
      kode_barang: 'kode_barang',
      kode_brg: 'kode_barang',
      nomor_register: 'nomor_register',
      no_register: 'nomor_register',
      no_reg: 'nomor_register',
      nama_barang: 'nama_barang',
      nama_brg: 'nama_barang',
      merk_dan_type: 'merk_type',
      merk_type: 'merk_type',
      merk_tipe: 'merk_type',
      merk_dan_tipe: 'merk_type',
      merk: 'merk_type',
    };

    return aliases[normalized] ?? normalized;
  }

  private cellText(row: ExcelJS.Row, colNumber?: number) {
    if (!colNumber) return '';
    const value = row.getCell(colNumber).value;
    if (value == null) return '';
    if (typeof value === 'object' && 'text' in value) return String(value.text).trim();
    if (typeof value === 'object' && 'result' in value) return String(value.result ?? '').trim();
    return String(value).trim();
  }

  private assertCanViewTransfer(user: AuthUser, transfer: AssetTransferRow) {
    if (user.role === 'ADMIN') return;
    if (transfer.requester_id === user.id) return;
    throw new ForbiddenException('Access denied');
  }

  private isUniqueViolation(error: unknown) {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505';
  }
}

