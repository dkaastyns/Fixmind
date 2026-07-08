-- Migration to remove technician columns and maintenance schedules table
DROP TABLE IF EXISTS maintenance_schedules;
DROP TYPE IF EXISTS maintenance_frequency;
DROP TYPE IF EXISTS maintenance_schedule_status;

DROP INDEX IF EXISTS idx_reports_assigned_technician;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_assigned_technician_role_chk;
ALTER TABLE reports DROP COLUMN IF EXISTS assigned_technician_id;
ALTER TABLE reports DROP COLUMN IF EXISTS assigned_at;
