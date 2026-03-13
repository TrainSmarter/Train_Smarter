-- Migration: PROJ-5 Athleten-Management
-- Tables: trainer_athlete_connections, trainer_profiles, athlete_profiles
-- Convention: All timestamps use timestamptz (never timestamp without tz)

-- =============================================================================
-- 1. Role-specific profile extension tables
-- =============================================================================

-- Trainer-specific profile data (1:1 with profiles)
CREATE TABLE public.trainer_profiles (
  id                uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name text,
  specialization    text,
  max_athletes      integer     NOT NULL DEFAULT 100,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER on_trainer_profiles_updated
  BEFORE UPDATE ON public.trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Athlete-specific profile data (1:1 with profiles)
CREATE TABLE public.athlete_profiles (
  id            uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  height_cm     numeric(5,1),
  sport_type    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER on_athlete_profiles_updated
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 2. Trainer-Athlete connections
-- =============================================================================

CREATE TYPE public.connection_status AS ENUM (
  'pending',
  'active',
  'rejected',
  'disconnected'
);

CREATE TABLE public.trainer_athlete_connections (
  id                      uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id              uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id              uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status                  connection_status NOT NULL DEFAULT 'pending',

  -- Invitation data
  invited_at              timestamptz       NOT NULL DEFAULT now(),
  invitation_message      text,
  invitation_expires_at   timestamptz       NOT NULL DEFAULT (now() + interval '7 days'),

  -- Lifecycle timestamps
  connected_at            timestamptz,
  rejected_at             timestamptz,
  disconnected_at         timestamptz,

  -- Granular data visibility (athlete controls these)
  can_see_body_data       boolean           NOT NULL DEFAULT true,
  can_see_nutrition       boolean           NOT NULL DEFAULT false,
  can_see_calendar        boolean           NOT NULL DEFAULT true,

  -- Trainer-controlled visibility
  can_see_analysis        boolean           NOT NULL DEFAULT false,

  -- Optional club context (nullable FK — clubs table created in PROJ-9)
  -- club_id              uuid,

  created_at              timestamptz       NOT NULL DEFAULT now(),
  updated_at              timestamptz       NOT NULL DEFAULT now(),

  -- Prevent duplicate connections
  UNIQUE (trainer_id, athlete_id),
  -- Self-invite prevention
  CHECK (trainer_id != athlete_id)
);

ALTER TABLE public.trainer_athlete_connections ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER on_connections_updated
  BEFORE UPDATE ON public.trainer_athlete_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 3. Indexes for common queries
-- =============================================================================

-- Trainer's athletes list (filtered by status)
CREATE INDEX idx_connections_trainer_status
  ON public.trainer_athlete_connections(trainer_id, status);

-- Athlete's trainer lookup (filtered by status)
CREATE INDEX idx_connections_athlete_status
  ON public.trainer_athlete_connections(athlete_id, status);

-- Expired invitation cleanup query
CREATE INDEX idx_connections_pending_expires
  ON public.trainer_athlete_connections(status, invitation_expires_at)
  WHERE status = 'pending';

-- =============================================================================
-- 4. RLS Policies (using has_role() helper for dual-role readiness)
-- =============================================================================

-- Trainer policies
CREATE POLICY "Trainers can read own connections"
  ON public.trainer_athlete_connections FOR SELECT
  USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can insert connections (invite)"
  ON public.trainer_athlete_connections FOR INSERT
  WITH CHECK (
    auth.uid() = trainer_id
    AND public.has_role('TRAINER')
  );

CREATE POLICY "Trainers can update own connections"
  ON public.trainer_athlete_connections FOR UPDATE
  USING (auth.uid() = trainer_id)
  WITH CHECK (auth.uid() = trainer_id);

-- Athlete policies
CREATE POLICY "Athletes can read own connections"
  ON public.trainer_athlete_connections FOR SELECT
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own connections (accept/reject/visibility)"
  ON public.trainer_athlete_connections FOR UPDATE
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

-- Trainer profiles: readable by self and connected athletes
CREATE POLICY "Users can read own trainer profile"
  ON public.trainer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own trainer profile"
  ON public.trainer_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Connected athletes can read trainer profile"
  ON public.trainer_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainer_athlete_connections
      WHERE trainer_id = trainer_profiles.id
        AND athlete_id = auth.uid()
        AND status = 'active'
    )
  );

-- Athlete profiles: readable by self and connected trainers
CREATE POLICY "Users can read own athlete profile"
  ON public.athlete_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own athlete profile"
  ON public.athlete_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Connected trainers can read athlete profile"
  ON public.athlete_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainer_athlete_connections
      WHERE athlete_id = athlete_profiles.id
        AND trainer_id = auth.uid()
        AND status = 'active'
    )
  );

-- =============================================================================
-- 5. Add timezone to profiles (needed for PROJ-6 server-side date logic)
-- =============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Vienna';
