-- Add previous period metrics to reports table for Period-Over-Period (PoP) comparison

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS previous_date_from DATE,
ADD COLUMN IF NOT EXISTS previous_date_to DATE,
ADD COLUMN IF NOT EXISTS previous_spend NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS previous_impressions INTEGER,
ADD COLUMN IF NOT EXISTS previous_clicks INTEGER,
ADD COLUMN IF NOT EXISTS previous_conversions INTEGER,
ADD COLUMN IF NOT EXISTS previous_ctr NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS previous_cpc NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS previous_cpm NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS previous_roas NUMERIC(10, 2);

COMMENT ON COLUMN public.reports.previous_spend IS 'Total spend for the comparison period';
