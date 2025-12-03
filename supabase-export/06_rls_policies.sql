-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Run this file after 05_functions.sql
-- Enables RLS and creates security policies for all tables

-- =====================================================
-- Enable RLS on all tables
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for users table
-- =====================================================

-- SELECT: Users can view own profile or admin can view all
CREATE POLICY "Users can view own profile or admin can view all"
ON public.users
FOR SELECT
TO public
USING (
  (auth.uid() = id) OR is_admin()
);

-- INSERT: Users can insert own profile
CREATE POLICY "Users can insert own profile"
ON public.users
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
);

-- UPDATE: Users can update own profile or admin can update all
CREATE POLICY "Users can update own profile or admin can update all"
ON public.users
FOR UPDATE
TO public
USING (
  (auth.uid() = id) OR is_admin()
);

-- =====================================================
-- RLS Policies for ad_accounts table
-- =====================================================

-- SELECT: Users can view own ad accounts or admin can view all
CREATE POLICY "Users can view own ad accounts or admin can view all"
ON public.ad_accounts
FOR SELECT
TO public
USING (
  (auth.uid() = user_id) OR is_admin()
);

-- INSERT: Users can insert own ad accounts or admin can insert any
CREATE POLICY "Users can insert own ad accounts or admin can insert any"
ON public.ad_accounts
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) OR is_admin()
);

-- UPDATE: Users can update own ad accounts or admin can update any
CREATE POLICY "Users can update own ad accounts or admin can update any"
ON public.ad_accounts
FOR UPDATE
TO public
USING (
  (auth.uid() = user_id) OR is_admin()
);

-- DELETE: Users can delete own ad accounts or admin can delete any
CREATE POLICY "Users can delete own ad accounts or admin can delete any"
ON public.ad_accounts
FOR DELETE
TO public
USING (
  (auth.uid() = user_id) OR is_admin()
);

-- =====================================================
-- RLS Policies for reports table
-- =====================================================

-- SELECT: Users can view own reports or admin can view all
CREATE POLICY "Users can view own reports or admin can view all"
ON public.reports
FOR SELECT
TO public
USING (
  (auth.uid() = user_id) OR is_admin()
);

-- INSERT: Users can insert own reports or admin can insert any
CREATE POLICY "Users can insert own reports or admin can insert any"
ON public.reports
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id) OR is_admin()
);

-- UPDATE: Users can update own reports or admin can update any
CREATE POLICY "Users can update own reports or admin can update any"
ON public.reports
FOR UPDATE
TO public
USING (
  (auth.uid() = user_id) OR is_admin()
);

-- DELETE: Users can delete own reports or admin can delete any
CREATE POLICY "Users can delete own reports or admin can delete any"
ON public.reports
FOR DELETE
TO public
USING (
  (auth.uid() = user_id) OR is_admin()
);

-- =====================================================
-- RLS Policies for campaigns_data table
-- =====================================================

-- SELECT: Users can view own campaign data (via reports)
CREATE POLICY "Users can view own campaign data"
ON public.campaigns_data
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

-- SELECT: Users can view campaigns data from own accounts or admin can view all
CREATE POLICY "Users can view campaigns data from own accounts or admin can vi"
ON public.campaigns_data
FOR SELECT
TO public
USING (
  (
    EXISTS (
      SELECT 1
      FROM ad_accounts
      WHERE ad_accounts.id = campaigns_data.ad_account_id
        AND ad_accounts.user_id = auth.uid()
    )
  ) OR is_admin()
);

-- INSERT: Users can insert own campaign data (via reports)
CREATE POLICY "Users can insert own campaign data"
ON public.campaigns_data
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

-- INSERT: Users can insert campaigns data to own accounts or admin can insert any
CREATE POLICY "Users can insert campaigns data to own accounts or admin can in"
ON public.campaigns_data
FOR INSERT
TO public
WITH CHECK (
  (
    EXISTS (
      SELECT 1
      FROM ad_accounts
      WHERE ad_accounts.id = campaigns_data.ad_account_id
        AND ad_accounts.user_id = auth.uid()
    )
  ) OR is_admin()
);

-- UPDATE: Users can update own campaign data (via reports)
CREATE POLICY "Users can update own campaign data"
ON public.campaigns_data
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

-- UPDATE: Users can update campaigns data from own accounts or admin can update any
CREATE POLICY "Users can update campaigns data from own accounts or admin can "
ON public.campaigns_data
FOR UPDATE
TO public
USING (
  (
    EXISTS (
      SELECT 1
      FROM ad_accounts
      WHERE ad_accounts.id = campaigns_data.ad_account_id
        AND ad_accounts.user_id = auth.uid()
    )
  ) OR is_admin()
);

-- DELETE: Users can delete own campaign data (via reports)
CREATE POLICY "Users can delete own campaign data"
ON public.campaigns_data
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1
    FROM reports
    WHERE reports.id = campaigns_data.report_id
      AND reports.user_id = auth.uid()
  )
);

-- DELETE: Users can delete campaigns data from own accounts or admin can delete any
CREATE POLICY "Users can delete campaigns data from own accounts or admin can "
ON public.campaigns_data
FOR DELETE
TO public
USING (
  (
    EXISTS (
      SELECT 1
      FROM ad_accounts
      WHERE ad_accounts.id = campaigns_data.ad_account_id
        AND ad_accounts.user_id = auth.uid()
    )
  ) OR is_admin()
);
