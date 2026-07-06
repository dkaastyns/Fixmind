-- Migration: Add report_comments and maintenance_schedules tables

-- ========================
-- Report Comments
-- ========================
CREATE TABLE IF NOT EXISTS report_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_comments_report_id ON report_comments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_comments_author_id ON report_comments(author_id);

-- ========================
-- Maintenance Schedules
-- ========================
CREATE TYPE maintenance_frequency AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME');
CREATE TYPE maintenance_schedule_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE');

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID REFERENCES rooms(id) ON DELETE SET NULL,
  asset_id        UUID REFERENCES assets(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  frequency       maintenance_frequency NOT NULL DEFAULT 'ONE_TIME',
  scheduled_date  DATE NOT NULL,
  status          maintenance_schedule_status NOT NULL DEFAULT 'SCHEDULED',
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_room_id ON maintenance_schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_assigned_to ON maintenance_schedules(assigned_to);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);
