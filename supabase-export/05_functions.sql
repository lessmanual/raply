-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================
-- Run this file after 04_indexes.sql
-- Creates custom functions used by RLS policies

-- =====================================================
-- is_admin() function
-- =====================================================
-- Checks if the current user has admin role
-- Used extensively in RLS policies for admin access control
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
