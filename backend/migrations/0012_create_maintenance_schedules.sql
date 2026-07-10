-- Migration: Recreate maintenance schedules table with vendor details

CREATE TYPE maintenance_frequency AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'ONE_TIME');
CREATE TYPE maintenance_schedule_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE');
CREATE TYPE maintenance_assignee_type AS ENUM ('INTERNAL', 'EXTERNAL_VENDOR');

CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id             UUID REFERENCES rooms(id) ON DELETE SET NULL,
  asset_id            UUID REFERENCES assets(id) ON DELETE SET NULL,
  title               VARCHAR(255) NOT NULL,
  description         TEXT,
  frequency           maintenance_frequency NOT NULL DEFAULT 'ONE_TIME',
  scheduled_date      DATE NOT NULL,
  status              maintenance_schedule_status NOT NULL DEFAULT 'SCHEDULED',
  assignee_type       maintenance_assignee_type NOT NULL DEFAULT 'EXTERNAL_VENDOR',
  assignee_name       VARCHAR(255) NOT NULL,
  vendor_contact_name VARCHAR(255),
  vendor_phone        VARCHAR(50),
  estimated_cost      NUMERIC(18, 2) NOT NULL DEFAULT 0,
  notes               TEXT,
  created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_room_id ON maintenance_schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_asset_id ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_scheduled_date ON maintenance_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_assignee_type ON maintenance_schedules(assignee_type);
