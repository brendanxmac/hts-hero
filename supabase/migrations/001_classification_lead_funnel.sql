-- Classification Lead Funnel: Schema Changes
-- Run this migration against your Supabase database

-- 1. Add anonymous classification support columns
ALTER TABLE classifications
  ADD COLUMN IF NOT EXISTS anonymous_token text,
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false;

-- Allow null user_id for anonymous classifications
ALTER TABLE classifications
  ALTER COLUMN user_id DROP NOT NULL;

-- Index for fast anonymous token lookups
CREATE INDEX IF NOT EXISTS idx_classifications_anonymous_token
  ON classifications (anonymous_token)
  WHERE anonymous_token IS NOT NULL;

-- Index for share token lookups
CREATE INDEX IF NOT EXISTS idx_classifications_share_token
  ON classifications (share_token)
  WHERE share_token IS NOT NULL;

-- 2. Add classification count to users table for trial gating
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS classification_count integer DEFAULT 0;

-- 3. RPC to atomically increment classification_count (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_classification_count(user_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET classification_count = COALESCE(classification_count, 0) + 1
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
