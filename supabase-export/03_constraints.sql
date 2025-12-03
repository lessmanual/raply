-- =====================================================
-- CONSTRAINTS & FOREIGN KEYS
-- =====================================================
-- Run this file after 02_tables.sql
-- Adds foreign key relationships between tables

-- =====================================================
-- Foreign Keys for users table
-- =====================================================
-- Link to auth.users
ALTER TABLE public.users
  ADD CONSTRAINT users_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- =====================================================
-- Foreign Keys for ad_accounts table
-- =====================================================
ALTER TABLE public.ad_accounts
  ADD CONSTRAINT ad_accounts_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

-- =====================================================
-- Foreign Keys for reports table
-- =====================================================
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

-- =====================================================
-- Foreign Keys for campaigns_data table
-- =====================================================
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
