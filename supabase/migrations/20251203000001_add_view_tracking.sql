-- Add view tracking columns to reports table
ALTER TABLE public.reports
ADD COLUMN view_count integer DEFAULT 0 NOT NULL;

ALTER TABLE public.reports
ADD COLUMN last_viewed_at timestamp with time zone;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_view_count ON public.reports(view_count DESC);

-- Function to increment report views
CREATE OR REPLACE FUNCTION increment_report_views(report_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.reports
  SET
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE id = report_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_report_views(uuid) TO authenticated;

-- Comment on function
COMMENT ON FUNCTION increment_report_views IS 'Increments the view count for a report and updates last_viewed_at timestamp';
