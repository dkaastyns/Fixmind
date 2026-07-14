-- Migration: Add failed login attempts and lockout until to users table
ALTER TABLE users ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN lockout_until TIMESTAMPTZ DEFAULT NULL;
