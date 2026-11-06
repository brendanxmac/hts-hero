-- ============================================================
-- Blocked sign-up domains: refuse new accounts from email domains we don't sell to
--
-- Added 2026-11-06: bots were creating accounts with qq.com and 163.com addresses from Chinese
-- residential networks, confirming each one within minutes. Supabase's "Before User Created" auth
-- hook runs this function before any account is created, however it's created (password, emailed
-- code, Google), including calls made straight to Supabase's API, which the Vercel firewall never
-- sees. Existing accounts aren't touched.
--
-- The domains live in a table, so one can be added or removed without changing the function:
--   insert into blocked_signup_domains (domain, reason) values ('example.com', 'why');
--   delete from blocked_signup_domains where domain = 'example.com';
-- A domain also blocks its subdomains (qq.com blocks vip.qq.com).
--
-- Apply:
--   1. Paste this file into the SQL editor and run it.
--   2. Dashboard → Authentication → Hooks → "Before User Created" → Postgres →
--      schema public, function hook_block_signup_domains → Enable.
--   3. Test it as the auth server runs it (before or after enabling):
--        set role supabase_auth_admin;
--        select public.hook_block_signup_domains('{"user":{"email":"a@gmail.com"}}');  -- {}
--        select public.hook_block_signup_domains('{"user":{"email":"a@vip.qq.com"}}'); -- the error
--        reset role;
--      Then sign up once with a normal address to be sure.
-- To turn it off, disable the hook there (the table can stay).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blocked_signup_domains (
  domain    text PRIMARY KEY CHECK (domain = lower(domain)),
  reason    text,
  added_at  timestamptz NOT NULL DEFAULT now()
);

-- Only the auth server reads it (the hook runs as supabase_auth_admin); nobody else sees it
ALTER TABLE public.blocked_signup_domains ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth server reads blocked domains" ON public.blocked_signup_domains;
CREATE POLICY "auth server reads blocked domains"
  ON public.blocked_signup_domains
  AS PERMISSIVE FOR SELECT
  TO supabase_auth_admin
  USING (true);

GRANT SELECT ON public.blocked_signup_domains TO supabase_auth_admin;
REVOKE ALL ON public.blocked_signup_domains FROM anon, authenticated;

INSERT INTO public.blocked_signup_domains (domain, reason) VALUES
  -- Chinese consumer email used by the 2026-11-06 sign-up bots
  ('qq.com', 'sign-up bots 2026-11-06'),
  ('163.com', 'sign-up bots 2026-11-06'),
  ('126.com', 'sign-up bots 2026-11-06'),
  -- Throwaway (disposable) inboxes
  ('mailinator.com', 'disposable'),
  ('guerrillamail.com', 'disposable'),
  ('guerrillamail.net', 'disposable'),
  ('guerrillamailblock.com', 'disposable'),
  ('sharklasers.com', 'disposable'),
  ('grr.la', 'disposable'),
  ('10minutemail.com', 'disposable'),
  ('temp-mail.org', 'disposable'),
  ('tempmail.com', 'disposable'),
  ('tempmail.dev', 'disposable'),
  ('tmpmail.org', 'disposable'),
  ('yopmail.com', 'disposable'),
  ('trashmail.com', 'disposable'),
  ('getnada.com', 'disposable'),
  ('dispostable.com', 'disposable'),
  ('maildrop.cc', 'disposable'),
  ('mailnesia.com', 'disposable'),
  ('throwawaymail.com', 'disposable'),
  ('fakeinbox.com', 'disposable'),
  ('mintemail.com', 'disposable'),
  ('emailondeck.com', 'disposable'),
  ('mohmal.com', 'disposable'),
  ('burnermail.io', 'disposable'),
  ('mytemp.email', 'disposable'),
  ('tempr.email', 'disposable'),
  ('discard.email', 'disposable'),
  ('spamgourmet.com', 'disposable')
ON CONFLICT (domain) DO NOTHING;

-- The hook: {} lets the sign-up through; an error refuses it, and Supabase shows its message.
-- It fails open: if anything inside goes wrong (a permission, a bad row), the sign-up goes through
-- rather than every sign-up failing.
CREATE OR REPLACE FUNCTION public.hook_block_signup_domains(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  email_domain text;
  blocked boolean := false;
BEGIN
  BEGIN
    email_domain := lower(split_part(coalesce(event->'user'->>'email', ''), '@', 2));
    IF email_domain <> '' THEN
      SELECT EXISTS (
        SELECT 1 FROM public.blocked_signup_domains b
        WHERE email_domain = b.domain OR right(email_domain, length(b.domain) + 1) = '.' || b.domain
      ) INTO blocked;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'hook_block_signup_domains failed open: %', SQLERRM;
    RETURN '{}'::jsonb;
  END;

  IF blocked THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Please sign up with your work email address.'
      )
    );
  END IF;
  RETURN '{}'::jsonb;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.hook_block_signup_domains(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.hook_block_signup_domains(jsonb) FROM authenticated, anon, public;
