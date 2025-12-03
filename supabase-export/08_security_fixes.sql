-- =====================================================
-- SECURITY FIXES (RECOMMENDED)
-- =====================================================
-- Fixes security warnings from Supabase Database Linter
-- Run this after completing migration to fix search_path warnings

-- Fix: Function Search Path Mutable
-- These commands set a fixed search_path to prevent search path hijacking attacks

ALTER FUNCTION public.is_admin()
SET search_path = pg_catalog, public;

ALTER FUNCTION public.handle_new_user()
SET search_path = pg_catalog, public;

ALTER FUNCTION public.update_updated_at_column()
SET search_path = pg_catalog, public;

-- Verification query (optional)
-- Run this to verify the fixes were applied:
-- SELECT
--     n.nspname as schema,
--     p.proname as function_name,
--     pg_get_function_identity_arguments(p.oid) as arguments,
--     p.proconfig as search_path_config
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
--     AND p.proname IN ('is_admin', 'handle_new_user', 'update_updated_at_column');
