-- =====================================================
-- TABLES SCHEMA
-- =====================================================
-- Run this file after 01_types.sql
-- Creates all table structures for the public schema

-- =====================================================
-- Users table (extends auth.users)
-- =====================================================
CREATE TABLE public.users (
  id uuid NOT NULL,  -- References auth.users.id
  email text NOT NULL,
  full_name text,
  company_name text,  -- Optional company/agency name
  phone text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role public.user_role NOT NULL DEFAULT 'user'::user_role,  -- User role: user (default) or admin (unlimited access)
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.users IS 'User profiles extending auth.users';
COMMENT ON COLUMN public.users.id IS 'References auth.users.id';
COMMENT ON COLUMN public.users.company_name IS 'Optional company/agency name';
COMMENT ON COLUMN public.users.role IS 'User role: user (default) or admin (unlimited access)';

-- =====================================================
-- Ad Accounts table
-- =====================================================
CREATE TABLE public.ad_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform public.ad_platform NOT NULL,
  platform_account_id text NOT NULL,  -- Meta Ad Account ID (act_xxx) or Google Ads Customer ID
  account_name text NOT NULL,
  currency text DEFAULT 'USD'::text,
  timezone text DEFAULT 'UTC'::text,
  access_token text NOT NULL,  -- OAuth access token (should be encrypted at app level)
  refresh_token text,
  token_expires_at timestamp with time zone,
  status public.account_status NOT NULL DEFAULT 'active'::account_status,
  last_sync_at timestamp with time zone,  -- Last time campaigns data was synced from this account
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ad_accounts_pkey PRIMARY KEY (id),
  CONSTRAINT ad_accounts_user_id_platform_platform_account_id_key
    UNIQUE (user_id, platform, platform_account_id)
);

COMMENT ON TABLE public.ad_accounts IS 'Connected advertising accounts (Meta Ads, Google Ads)';
COMMENT ON COLUMN public.ad_accounts.platform_account_id IS 'Meta Ad Account ID (act_xxx) or Google Ads Customer ID';
COMMENT ON COLUMN public.ad_accounts.access_token IS 'OAuth access token (should be encrypted at app level)';
COMMENT ON COLUMN public.ad_accounts.last_sync_at IS 'Last time campaigns data was synced from this account';

-- =====================================================
-- Reports table
-- =====================================================
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL,
  name text NOT NULL,
  template_type public.report_template NOT NULL,  -- Report template: leads, sales, or reach
  date_from date NOT NULL,
  date_to date NOT NULL,
  status public.report_status NOT NULL DEFAULT 'generating'::report_status,
  ai_description text,  -- Claude AI-generated campaign description
  ai_recommendations jsonb,  -- Claude AI-generated recommendations (JSON array)
  total_spend numeric,
  total_impressions integer,
  total_clicks integer,
  total_conversions integer,
  average_ctr numeric,
  average_cpc numeric,
  average_cpm numeric,
  roas numeric,  -- Return on Ad Spend
  pdf_url text,
  generated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  share_token uuid DEFAULT gen_random_uuid(),
  share_token_expires_at timestamp with time zone,
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_share_token_key UNIQUE (share_token)
);

COMMENT ON TABLE public.reports IS 'Generated advertising reports with AI insights';
COMMENT ON COLUMN public.reports.template_type IS 'Report template: leads, sales, or reach';
COMMENT ON COLUMN public.reports.ai_description IS 'Claude AI-generated campaign description';
COMMENT ON COLUMN public.reports.ai_recommendations IS 'Claude AI-generated recommendations (JSON array)';
COMMENT ON COLUMN public.reports.roas IS 'Return on Ad Spend';

-- =====================================================
-- Campaigns Data table
-- =====================================================
CREATE TABLE public.campaigns_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  ad_account_id uuid NOT NULL,
  campaign_id text NOT NULL,  -- Platform-specific campaign ID
  campaign_name text NOT NULL,
  platform public.ad_platform NOT NULL,
  date_from date NOT NULL,
  date_to date NOT NULL,
  spend numeric NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  ctr numeric,
  cpc numeric,
  cpm numeric,
  cpa numeric,
  conversion_rate numeric,
  revenue numeric DEFAULT 0,
  roas numeric,  -- Return on Ad Spend (Revenue / Spend)
  raw_data jsonb,  -- Complete API response data in JSON format
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_data_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.campaigns_data IS 'Cached campaign performance data from Meta/Google Ads';
COMMENT ON COLUMN public.campaigns_data.campaign_id IS 'Platform-specific campaign ID';
COMMENT ON COLUMN public.campaigns_data.roas IS 'Return on Ad Spend (Revenue / Spend)';
COMMENT ON COLUMN public.campaigns_data.raw_data IS 'Complete API response data in JSON format';
