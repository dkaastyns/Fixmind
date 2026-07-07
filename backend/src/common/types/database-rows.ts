export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'USER';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  is_admin: boolean;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface SessionRow {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  user_agent: string | null;
  ip_address: string | null;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export type AssetStatus = 'OPERATIONAL' | 'NEEDS_MAINTENANCE' | 'OUT_OF_SERVICE';

export interface RoomRow {
  id: string;
  name: string;
  code: string;
  floor: string | null;
  building: string | null;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface AssetRow {
  id: string;
  room_id: string;
  idpemda: string;
  kode_barang: string;
  nomor_register: string;
  nama_barang: string;
  merk_type: string;
  status: AssetStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ReportHistoryRow {
  id: string;
  report_id: string;
  actor_id: string | null;
  action: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus | null;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export type ReportStatus =
  | 'PENDING'
  | 'AI_ANALYSIS'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReportRow {
  id: string;
  reporter_id: string;
  room_id: string;
  asset_id: string | null;
  title: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority | null;
  ai_priority_score: string | null;
  ai_priority_reason: string | null;
  ai_recommendation: string | null;
  ai_estimated_repair_hours: string | null;
  ai_suggested_action: string | null;
  ai_analysis_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  assigned_technician_id: string | null;
  assigned_at: Date | null;
  target_completion_date: Date | null;
  ai_suggested_target_date: Date | null;
  completed_at: Date | null;
  admin_notes: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type AttachmentType = 'DAMAGE' | 'REPAIR' | 'OTHER';

export interface ReportAttachmentRow {
  id: string;
  report_id: string;
  uploaded_by: string;
  type: AttachmentType;
  cloudinary_public_id: string;
  url: string;
  created_at: Date;
}
