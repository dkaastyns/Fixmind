-- ============================================================
-- Fixmind Performance Indexes Migration
-- Run this directly against your PostgreSQL database.
-- All indexes use IF NOT EXISTS so it's safe to run multiple times.
-- ============================================================

-- Enable pg_trgm for GIN trigram search on ILIKE queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- reports table
-- ============================================================

-- Partial index for soft-delete filter (most queries use this)
CREATE INDEX IF NOT EXISTS idx_reports_deleted_at
  ON reports (deleted_at);

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON reports (status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
  ON reports (reporter_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_room_id
  ON reports (room_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_asset_id
  ON reports (asset_id) WHERE deleted_at IS NULL AND asset_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_created_at_desc
  ON reports (created_at DESC) WHERE deleted_at IS NULL;

-- GIN trigram indexes for fast ILIKE search on text columns
CREATE INDEX IF NOT EXISTS idx_reports_title_trgm
  ON reports USING GIN (title gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reports_description_trgm
  ON reports USING GIN (description gin_trgm_ops) WHERE deleted_at IS NULL AND description IS NOT NULL;

-- ============================================================
-- assets table
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_assets_deleted_at
  ON assets (deleted_at);

CREATE INDEX IF NOT EXISTS idx_assets_room_id
  ON assets (room_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assets_status
  ON assets (status) WHERE deleted_at IS NULL;

-- GIN trigram indexes for ILIKE search across 5 text columns
CREATE INDEX IF NOT EXISTS idx_assets_nama_barang_trgm
  ON assets USING GIN (nama_barang gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assets_kode_barang_trgm
  ON assets USING GIN (kode_barang gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assets_idpemda_trgm
  ON assets USING GIN (idpemda gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assets_nomor_register_trgm
  ON assets USING GIN (nomor_register gin_trgm_ops) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assets_merk_type_trgm
  ON assets USING GIN (merk_type gin_trgm_ops) WHERE deleted_at IS NULL;

-- ============================================================
-- report_histories table
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_report_histories_report_id
  ON report_histories (report_id);

CREATE INDEX IF NOT EXISTS idx_report_histories_created_at
  ON report_histories (created_at DESC);

-- ============================================================
-- report_comments table
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_report_comments_report_id
  ON report_comments (report_id);

-- ============================================================
-- report_attachments table
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_report_attachments_report_id
  ON report_attachments (report_id);

-- ============================================================
-- rooms table
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_rooms_name_trgm
  ON rooms USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_rooms_code_trgm
  ON rooms USING GIN (code gin_trgm_ops);

-- ============================================================
-- Verification query (run after migration to confirm)
-- ============================================================
-- SELECT indexname, tablename, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('reports', 'assets', 'report_histories', 'report_comments', 'rooms')
-- ORDER BY tablename, indexname;
