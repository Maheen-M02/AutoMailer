-- ============================================================
-- AutoMailer — Core Tables Migration (Minimal Setup)
-- Run this in your Supabase SQL Editor if tables don't exist yet.
-- This creates the essential tables the backend needs.
-- ============================================================

-- profiles table (if missing)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  name            TEXT,
  role            TEXT NOT NULL DEFAULT 'sender'
                  CHECK (role IN ('super_admin', 'admin', 'sender')),
  admin_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  smtp_configured BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- csv_files table
CREATE TABLE IF NOT EXISTS csv_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  columns     TEXT[] DEFAULT '{}',
  rows        JSONB DEFAULT '[]',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csv_files_admin ON csv_files(admin_id);

-- segments table
CREATE TABLE IF NOT EXISTS segments (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  csv_id  UUID NOT NULL REFERENCES csv_files(id) ON DELETE CASCADE,
  label   TEXT NOT NULL,
  row_ids TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_segments_csv ON segments(csv_id);

-- csv_assignments table
CREATE TABLE IF NOT EXISTS csv_assignments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  csv_id     UUID NOT NULL REFERENCES csv_files(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csv_assignments_csv    ON csv_assignments(csv_id);
CREATE INDEX IF NOT EXISTS idx_csv_assignments_sender ON csv_assignments(sender_id);

-- smtp_configs table
CREATE TABLE IF NOT EXISTS smtp_configs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id           UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  gmail              TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smtp_configs_admin ON smtp_configs(admin_id);

-- email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email  TEXT NOT NULL,
  recipient_name   TEXT,
  subject          TEXT,
  body             TEXT,
  status           TEXT NOT NULL DEFAULT 'sent'
                   CHECK (status IN ('sent', 'failed', 'skipped_duplicate')),
  error_message    TEXT,
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_sender    ON email_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status    ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_timestamp ON email_logs(timestamp DESC);

-- ============================================================
-- Done. All core tables are created.
-- ============================================================
