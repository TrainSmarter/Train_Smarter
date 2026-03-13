-- Migration: Initial schema for PROJ-4 (Authentication & Onboarding)
-- Applied manually to production before migration tracking was set up.
-- This file documents the existing production schema for reproducibility.

-- =============================================================================
-- 1. Functions
-- =============================================================================

-- Auto-update updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 2. Enum types
-- =============================================================================

CREATE TYPE public.consent_type AS ENUM (
  'terms_privacy',
  'body_wellness_data',
  'nutrition_data'
);

-- =============================================================================
-- 3. Tables
-- =============================================================================

-- User profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    text        NOT NULL DEFAULT '',
  last_name     text        NOT NULL DEFAULT '',
  avatar_url    text,
  birth_date    date,
  onboarding_completed boolean NOT NULL DEFAULT false,
  onboarding_step      integer NOT NULL DEFAULT 1,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User consent records (DSGVO)
CREATE TABLE public.user_consents (
  id             uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type   consent_type   NOT NULL,
  granted        boolean        NOT NULL,
  granted_at     timestamptz    NOT NULL DEFAULT now(),
  policy_version text           NOT NULL DEFAULT 'v1.0'
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Triggers
-- =============================================================================

-- Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profile changes
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 5. RLS Policies
-- =============================================================================

-- Profiles: users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Consents: users can manage their own consent records
CREATE POLICY "Users can read own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents"
  ON public.user_consents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 6. Storage
-- =============================================================================

-- Avatars bucket (public, 5MB limit, image types only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. Helper function for role checking (future-proof for dual-role)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_role(required_role text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT required_role = ANY(
    ARRAY(SELECT jsonb_array_elements_text(
      COALESCE(auth.jwt()->'app_metadata'->'roles', '[]'::jsonb)
    ))
  );
$$;
