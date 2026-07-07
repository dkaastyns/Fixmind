-- Maintenance reports & workflow

CREATE TYPE report_status AS ENUM (
  'PENDING',
  'AI_ANALYSIS',
  'REVIEWED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REJECTED'
);

CREATE TYPE report_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE ai_analysis_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE reports (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id             UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  room_id                 UUID NOT NULL REFERENCES rooms (id) ON DELETE RESTRICT,
  asset_id                UUID REFERENCES assets (id) ON DELETE SET NULL,
  title                   VARCHAR(200) NOT NULL,
  description             TEXT NOT NULL,
  status                  report_status NOT NULL DEFAULT 'PENDING',
  priority                report_priority,
  ai_priority_score       NUMERIC(5, 2),
  ai_priority_reason      TEXT,
  ai_recommendation       TEXT,
  ai_estimated_repair_hours NUMERIC(6, 2),
  ai_suggested_action     TEXT,
  ai_analysis_status      ai_analysis_status NOT NULL DEFAULT 'PENDING',
  assigned_technician_id  UUID REFERENCES users (id) ON DELETE SET NULL,
  assigned_at             TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  admin_notes             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at              TIMESTAMPTZ,
  CONSTRAINT reports_assigned_technician_role_chk
    CHECK (assigned_technician_id IS NULL OR assigned_technician_id IS NOT NULL)
);

CREATE TYPE report_history_action AS ENUM (
  'CREATED',
  'STATUS_CHANGED',
  'ASSIGNED',
  'UNASSIGNED',
  'NOTE_ADDED',
  'AI_ANALYZED',
  'PRIORITY_SET',
  'COMPLETED',
  'RATED'
);

CREATE TABLE report_histories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES reports (id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES users (id) ON DELETE SET NULL,
  action      report_history_action NOT NULL,
  old_status  report_status,
  new_status  report_status,
  note        TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE attachment_type AS ENUM ('DAMAGE', 'REPAIR', 'OTHER');

CREATE TABLE report_attachments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id           UUID NOT NULL REFERENCES reports (id) ON DELETE CASCADE,
  uploaded_by         UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  type                attachment_type NOT NULL DEFAULT 'DAMAGE',
  cloudinary_public_id VARCHAR(255) NOT NULL,
  url                 TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_reporter_id ON reports (reporter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_status ON reports (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_assigned_technician ON reports (assigned_technician_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_created_at ON reports (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_report_histories_report_id ON report_histories (report_id);
CREATE INDEX idx_report_attachments_report_id ON report_attachments (report_id);
