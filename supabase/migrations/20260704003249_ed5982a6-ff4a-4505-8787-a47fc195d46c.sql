
-- 1) Restrict URL fields to http/https at the database level
UPDATE public.organizations SET website = NULL
  WHERE website IS NOT NULL AND website !~* '^https?://';
UPDATE public.opportunities SET application_url = 'https://example.invalid/'
  WHERE application_url !~* '^https?://';

ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_website_http_only
  CHECK (website IS NULL OR website ~* '^https?://');

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_application_url_http_only
  CHECK (application_url ~* '^https?://');

-- 2) Stop exposing organization contact emails to the public / anon Data API
REVOKE SELECT (contact_email) ON public.organizations FROM anon;
REVOKE SELECT (contact_email) ON public.organizations FROM authenticated;
GRANT SELECT (contact_email) ON public.organizations TO authenticated;
-- Result: anon cannot read contact_email at all; authenticated can only read
-- rows their RLS policies already permit (owner or admin).

-- 3) Lock down the SECURITY DEFINER is_admin() so it isn't a public/authenticated RPC.
-- It is still used inside RLS policies via the postgres role, which retains EXECUTE.
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM authenticated;
