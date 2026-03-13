-- Migration: Add locale column to profiles table
-- Feature: Locale/language support for Train Smarter

-- =============================================================================
-- 1. Add locale column to profiles
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN locale text NOT NULL DEFAULT 'de';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_locale_check CHECK (locale IN ('de', 'en'));

-- =============================================================================
-- 2. Update handle_new_user() to set locale from user metadata
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'locale' IN ('de', 'en')
        THEN NEW.raw_user_meta_data ->> 'locale'
      ELSE 'de'
    END
  );
  RETURN NEW;
END;
$$;
