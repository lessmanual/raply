-- =====================================================
-- RECOMMENDED TRIGGERS (OPTIONAL)
-- =====================================================
-- These are optional but highly recommended triggers
-- Run this file AFTER completing migration (01-06)

-- =====================================================
-- Trigger 1: Auto-create user profile on signup
-- =====================================================
-- Automatically creates a profile in public.users when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  RETURN new;
END;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when new user signs up';

-- =====================================================
-- Trigger 2: Auto-update updated_at timestamp
-- =====================================================
-- Automatically updates updated_at column on every UPDATE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Apply to users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to ad_accounts table
CREATE TRIGGER update_ad_accounts_updated_at
  BEFORE UPDATE ON public.ad_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to reports table
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates updated_at timestamp on record changes';

-- =====================================================
-- Trigger 3: Validate share_token expiration
-- =====================================================
-- Ensures share_token_expires_at is set to 7 days from now when share_token is generated
CREATE OR REPLACE FUNCTION public.set_share_token_expiration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
  -- If share_token changed and expires_at is null, set it to 7 days from now
  IF NEW.share_token IS DISTINCT FROM OLD.share_token AND NEW.share_token_expires_at IS NULL THEN
    NEW.share_token_expires_at := now() + interval '7 days';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_reports_share_token_expiration
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.set_share_token_expiration();

COMMENT ON FUNCTION public.set_share_token_expiration() IS 'Sets share_token expiration to 7 days when token is generated';
