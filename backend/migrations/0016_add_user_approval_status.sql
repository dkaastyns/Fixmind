-- Migration 0016: Add approval status to users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_approval_status') THEN
    CREATE TYPE user_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END
$$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS approval_status user_approval_status NOT NULL DEFAULT 'APPROVED';

CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users (approval_status);
