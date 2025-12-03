-- =====================================================
-- CUSTOM TYPES (ENUMS)
-- =====================================================
-- Run this file first to create all custom enum types
-- Required before creating tables that reference these types

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
