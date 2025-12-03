-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Run this file after 03_constraints.sql
-- Creates all performance indexes for faster queries

-- =====================================================
-- Indexes for users table
-- =====================================================
CREATE INDEX users_email_idx ON public.users USING btree (email);
CREATE INDEX users_role_idx ON public.users USING btree (role);

-- =====================================================
-- Indexes for ad_accounts table
-- =====================================================
CREATE INDEX ad_accounts_user_id_idx ON public.ad_accounts USING btree (user_id);
CREATE INDEX ad_accounts_platform_idx ON public.ad_accounts USING btree (platform);
CREATE INDEX ad_accounts_status_idx ON public.ad_accounts USING btree (status);

-- =====================================================
-- Indexes for reports table
-- =====================================================
CREATE INDEX reports_user_id_idx ON public.reports USING btree (user_id);
CREATE INDEX reports_ad_account_id_idx ON public.reports USING btree (ad_account_id);
CREATE INDEX reports_status_idx ON public.reports USING btree (status);
CREATE INDEX reports_created_at_idx ON public.reports USING btree (created_at DESC);
CREATE INDEX reports_date_range_idx ON public.reports USING btree (date_from, date_to);
CREATE INDEX reports_share_token_idx ON public.reports USING btree (share_token);

-- =====================================================
-- Indexes for campaigns_data table
-- =====================================================
CREATE INDEX campaigns_data_report_id_idx ON public.campaigns_data USING btree (report_id);
CREATE INDEX campaigns_data_ad_account_id_idx ON public.campaigns_data USING btree (ad_account_id);
CREATE INDEX campaigns_data_campaign_id_idx ON public.campaigns_data USING btree (campaign_id);
CREATE INDEX campaigns_data_platform_idx ON public.campaigns_data USING btree (platform);
CREATE INDEX campaigns_data_date_range_idx ON public.campaigns_data USING btree (date_from, date_to);
