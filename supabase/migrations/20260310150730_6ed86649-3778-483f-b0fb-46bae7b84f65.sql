
-- Add phone column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text UNIQUE;

-- Function to look up email by username (for username+password login)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.email
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE p.username = p_username
  LIMIT 1;
$$;

-- Function to look up email by phone (for phone+password login)
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT au.email
  FROM auth.users au
  JOIN public.profiles p ON p.id = au.id
  WHERE p.phone = p_phone
  LIMIT 1;
$$;
