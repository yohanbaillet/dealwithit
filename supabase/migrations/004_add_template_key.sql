-- Migration 003: Add template_key to requests
-- Run this in the Supabase SQL editor

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS template_key text;

-- Optional: index for filtering by template in the future
CREATE INDEX IF NOT EXISTS requests_template_key_idx ON requests (template_key);
