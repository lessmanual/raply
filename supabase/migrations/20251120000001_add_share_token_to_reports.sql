-- Add share_token column to reports table for public sharing
-- This enables users to share reports via public URL without authentication

-- Add share_token column (UUID, unique, nullable)
ALTER TABLE public.reports
ADD COLUMN share_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Add share_token_expires_at column (optional expiration, default 30 days from creation)
ALTER TABLE public.reports
ADD COLUMN share_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for fast lookups by share_token
CREATE INDEX IF NOT EXISTS reports_share_token_idx ON public.reports(share_token);

-- Function to generate share token if not exists
CREATE OR REPLACE FUNCTION public.ensure_share_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate share_token if it doesn't exist
  IF NEW.share_token IS NULL THEN
    NEW.share_token := gen_random_uuid();
  END IF;

  -- Set expiration to 30 days from creation if not set
  IF NEW.share_token_expires_at IS NULL THEN
    NEW.share_token_expires_at := NEW.created_at + INTERVAL '30 days';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate share_token on insert
CREATE TRIGGER ensure_share_token_on_insert
  BEFORE INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_share_token();

-- Generate share_tokens for existing reports (backfill)
UPDATE public.reports
SET share_token = gen_random_uuid(),
    share_token_expires_at = created_at + INTERVAL '30 days'
WHERE share_token IS NULL;

-- Make share_token NOT NULL after backfill
ALTER TABLE public.reports
ALTER COLUMN share_token SET NOT NULL;

COMMENT ON COLUMN public.reports.share_token IS 'Unique token for public sharing of report';
COMMENT ON COLUMN public.reports.share_token_expires_at IS 'Expiration date for public share link (default: 30 days)';
