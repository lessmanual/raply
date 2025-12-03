-- =====================================================
-- COMPLETE MIGRATION SCRIPT
-- =====================================================
-- This file contains ALL migration steps in one file
-- You can run this entire file at once in Supabase SQL Editor
--
-- Project: Raply
-- Export Date: 2025-12-02
-- =====================================================

-- =====================================================
-- STEP 1: CUSTOM TYPES (ENUMS)
-- =====================================================

-- Auth schema types
CREATE TYPE auth.aal_level AS ENUM ('aal1', 'aal2', 'aal3');
CREATE TYPE auth.code_challenge_method AS ENUM ('s256', 'plain');
CREATE TYPE auth.factor_status AS ENUM ('unverified', 'verified');
CREATE TYPE auth.factor_type AS ENUM ('totp', 'webauthn', 'phone');
CREATE TYPE auth.oauth_authorization_status AS ENUM ('pending', 'approved', 'denied', 'expired');
CREATE TYPE auth.oauth_client_type AS ENUM ('public', 'confidential');
CREATE TYPE auth.oauth_registration_type AS ENUM ('dynamic', 'manual');
CREATE TYPE auth.oauth_response_type AS ENUM ('code');
CREATE TYPE auth.one_time_token_type AS ENUM (
  'confirmation_token',
  'reauthentication_token',
  'recovery_token',
  'email_change_token_new',
  'email_change_token_current',
  'phone_change_token'
);

-- Public schema types (Application-specific)
CREATE TYPE public.account_status AS ENUM ('active', 'disconnected', 'error');
CREATE TYPE public.ad_platform AS ENUM ('meta', 'google');
CREATE TYPE public.report_status AS ENUM ('generating', 'completed', 'failed');
CREATE TYPE public.report_template AS ENUM ('leads', 'sales', 'reach');
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Storage schema types
CREATE TYPE storage.buckettype AS ENUM ('STANDARD', 'ANALYTICS', 'VECTOR');

-- =====================================================
-- STEP 2: TABLES
-- =====================================================

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  company_name text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role public.user_role NOT NULL DEFAULT 'user'::user_role,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.users IS 'User profiles extending auth.users';
COMMENT ON COLUMN public.users.id IS 'References auth.users.id';
COMMENT ON COLUMN public.users.company_name IS 'Optional company/agency name';
COMMENT ON COLUMN public.users.role IS 'User role: user (default) or admin (unlimited access)';

-- Ad Accounts table
CREATE TABLE public.ad_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform public.ad_platform NOT NULL,
  platform_account_id text NOT NULL,
  account_name text NOT NULL,
  currency text DEFAULT 'USD'::text,
  timezone text DEFAULT 'UTC'::text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamp with time zone,
  status public.account_status NOT NULL DEFAULT 'active'::account_status,
  last_sync_at timestamp with time zone,
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

-- Reports table
CREATE TABLE public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ad_account_id uuid NOT NULL,
  name text NOT NULL,
  template_type public.report_template NOT NULL,
  date_from date NOT NULL,
  date_to date NOT NULL,
  status public.report_status NOT NULL DEFAULT 'generating'::report_status,
  ai_description text,
  ai_recommendations jsonb,
  total_spend numeric,
  total_impressions integer,
  total_clicks integer,
  total_conversions integer,
  average_ctr numeric,
  average_cpc numeric,
  average_cpm numeric,
  roas numeric,
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

-- Campaigns Data table
CREATE TABLE public.campaigns_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  ad_account_id uuid NOT NULL,
  campaign_id text NOT NULL,
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
  roas numeric,
  raw_data jsonb,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT campaigns_data_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.campaigns_data IS 'Cached campaign performance data from Meta/Google Ads';
COMMENT ON COLUMN public.campaigns_data.campaign_id IS 'Platform-specific campaign ID';
COMMENT ON COLUMN public.campaigns_data.roas IS 'Return on Ad Spend (Revenue / Spend)';
COMMENT ON COLUMN public.campaigns_data.raw_data IS 'Complete API response data in JSON format';

-- =====================================================
-- STEP 3: FOREIGN KEYS
-- =====================================================

ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.ad_accounts
  ADD CONSTRAINT ad_accounts_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_ad_account_id_fkey
  FOREIGN KEY (ad_account_id)
  REFERENCES public.ad_accounts(id)
  ON DELETE CASCADE;

ALTER TABLE public.campaigns_data
  ADD CONSTRAINT campaigns_data_report_id_fkey
  FOREIGN KEY (report_id)
  REFERENCES public.reports(id)
  ON DELETE CASCADE;

ALTER TABLE public.campaigns_data
  ADD CONSTRAINT campaigns_data_ad_account_id_fkey
  FOREIGN KEY (ad_account_id)
  REFERENCES public.ad_accounts(id)
  ON DELETE CASCADE;

-- =====================================================
-- STEP 4: INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX users_email_idx ON public.users USING btree (email);
CREATE INDEX users_role_idx ON public.users USING btree (role);

-- Ad accounts indexes
CREATE INDEX ad_accounts_user_id_idx ON public.ad_accounts USING btree (user_id);
CREATE INDEX ad_accounts_platform_idx ON public.ad_accounts USING btree (platform);
CREATE INDEX ad_accounts_status_idx ON public.ad_accounts USING btree (status);

-- Reports indexes
CREATE INDEX reports_user_id_idx ON public.reports USING btree (user_id);
CREATE INDEX reports_ad_account_id_idx ON public.reports USING btree (ad_account_id);
CREATE INDEX reports_status_idx ON public.reports USING btree (status);
CREATE INDEX reports_created_at_idx ON public.reports USING btree (created_at DESC);
CREATE INDEX reports_date_range_idx ON public.reports USING btree (date_from, date_to);
CREATE INDEX reports_share_token_idx ON public.reports USING btree (share_token);

-- Campaigns data indexes
CREATE INDEX campaigns_data_report_id_idx ON public.campaigns_data USING btree (report_id);
CREATE INDEX campaigns_data_ad_account_id_idx ON public.campaigns_data USING btree (ad_account_id);
CREATE INDEX campaigns_data_campaign_id_idx ON public.campaigns_data USING btree (campaign_id);
CREATE INDEX campaigns_data_platform_idx ON public.campaigns_data USING btree (platform);
CREATE INDEX campaigns_data_date_range_idx ON public.campaigns_data USING btree (date_from, date_to);

-- =====================================================
-- STEP 5: HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$function$;

COMMENT ON FUNCTION public.is_admin() IS 'Checks if the current authenticated user has admin role';

-- =====================================================
-- STEP 6: ENABLE RLS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: RLS POLICIES
-- =====================================================

-- Users policies
CREATE POLICY "Users can view own profile or admin can view all"
ON public.users FOR SELECT TO public
USING ((auth.uid() = id) OR is_admin());

CREATE POLICY "Users can insert own profile"
ON public.users FOR INSERT TO public
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile or admin can update all"
ON public.users FOR UPDATE TO public
USING ((auth.uid() = id) OR is_admin());

-- Ad accounts policies
CREATE POLICY "Users can view own ad accounts or admin can view all"
ON public.ad_accounts FOR SELECT TO public
USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can insert own ad accounts or admin can insert any"
ON public.ad_accounts FOR INSERT TO public
WITH CHECK ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can update own ad accounts or admin can update any"
ON public.ad_accounts FOR UPDATE TO public
USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can delete own ad accounts or admin can delete any"
ON public.ad_accounts FOR DELETE TO public
USING ((auth.uid() = user_id) OR is_admin());

-- Reports policies
CREATE POLICY "Users can view own reports or admin can view all"
ON public.reports FOR SELECT TO public
USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can insert own reports or admin can insert any"
ON public.reports FOR INSERT TO public
WITH CHECK ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can update own reports or admin can update any"
ON public.reports FOR UPDATE TO public
USING ((auth.uid() = user_id) OR is_admin());

CREATE POLICY "Users can delete own reports or admin can delete any"
ON public.reports FOR DELETE TO public
USING ((auth.uid() = user_id) OR is_admin());

-- Campaigns data policies
CREATE POLICY "Users can view own campaign data"
ON public.campaigns_data FOR SELECT TO public
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view campaigns data from own accounts or admin can vi"
ON public.campaigns_data FOR SELECT TO public
USING (
  (EXISTS (
    SELECT 1 FROM ad_accounts
    WHERE ad_accounts.id = campaigns_data.ad_account_id
      AND ad_accounts.user_id = auth.uid()
  )) OR is_admin()
);

CREATE POLICY "Users can insert own campaign data"
ON public.campaigns_data FOR INSERT TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert campaigns data to own accounts or admin can in"
ON public.campaigns_data FOR INSERT TO public
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM ad_accounts
    WHERE ad_accounts.id = campaigns_data.ad_account_id
      AND ad_accounts.user_id = auth.uid()
  )) OR is_admin()
);

CREATE POLICY "Users can update own campaign data"
ON public.campaigns_data FOR UPDATE TO public
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update campaigns data from own accounts or admin can "
ON public.campaigns_data FOR UPDATE TO public
USING (
  (EXISTS (
    SELECT 1 FROM ad_accounts
    WHERE ad_accounts.id = campaigns_data.ad_account_id
      AND ad_accounts.user_id = auth.uid()
  )) OR is_admin()
);

CREATE POLICY "Users can delete own campaign data"
ON public.campaigns_data FOR DELETE TO public
USING (
  EXISTS (
    SELECT 1 FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete campaigns data from own accounts or admin can "
ON public.campaigns_data FOR DELETE TO public
USING (
  (EXISTS (
    SELECT 1 FROM ad_accounts
    WHERE ad_accounts.id = campaigns_data.ad_account_id
      AND ad_accounts.user_id = auth.uid()
  )) OR is_admin()
);

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- Your database schema has been successfully migrated
-- Next steps: Consider adding triggers from 07_triggers_recommended.sql
