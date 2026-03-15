-- Migration: PROJ-9 Team-Verwaltung
-- Tables: teams, team_members, team_athletes, team_invitations
-- Storage: team-logos bucket
-- Trigger: auto-archive team when last trainer leaves
-- Convention: All timestamps use timestamptz (never timestamp without tz)

-- =============================================================================
-- 1. Teams table
-- =============================================================================

CREATE TABLE public.teams (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text,
  logo_url    text,
  created_by  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  archived_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Name max 100 chars, description max 500 chars
  CONSTRAINT chk_team_name_length CHECK (length(name) BETWEEN 1 AND 100),
  CONSTRAINT chk_team_description_length CHECK (description IS NULL OR length(description) <= 500)
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER on_teams_updated
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 2. Team members (trainers in a team)
-- =============================================================================

CREATE TABLE public.team_members (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   uuid        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_team_member UNIQUE (team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. Team athletes (athletes assigned to a team)
-- =============================================================================

CREATE TABLE public.team_athletes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     uuid        NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  athlete_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_team_athlete UNIQUE (team_id, athlete_id)
);

ALTER TABLE public.team_athletes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Team invitations (trainer invitations)
-- =============================================================================

CREATE TYPE public.team_invitation_status AS ENUM (
  'pending',
  'accepted',
  'declined'
);

CREATE TABLE public.team_invitations (
  id               uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id          uuid                     NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email            text                     NOT NULL,
  token            text                     NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  personal_message text,
  invited_by       uuid                     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status           team_invitation_status   NOT NULL DEFAULT 'pending',
  expires_at       timestamptz              NOT NULL DEFAULT (now() + interval '7 days'),
  created_at       timestamptz              NOT NULL DEFAULT now(),
  updated_at       timestamptz              NOT NULL DEFAULT now(),

  CONSTRAINT chk_team_invite_message_length CHECK (personal_message IS NULL OR length(personal_message) <= 500)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER on_team_invitations_updated
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Prevent duplicate pending invitations to same email for same team
CREATE UNIQUE INDEX idx_unique_pending_team_invitation
  ON public.team_invitations(team_id, email)
  WHERE status = 'pending';

-- =============================================================================
-- 5. Indexes
-- =============================================================================

-- Team members: find teams for a user
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- Team members: find members of a team
CREATE INDEX idx_team_members_team ON public.team_members(team_id);

-- Team athletes: find athletes in a team
CREATE INDEX idx_team_athletes_team ON public.team_athletes(team_id);

-- Team athletes: find teams for an athlete
CREATE INDEX idx_team_athletes_athlete ON public.team_athletes(athlete_id);

-- Teams: filter out archived teams
CREATE INDEX idx_teams_archived ON public.teams(archived_at) WHERE archived_at IS NULL;

-- Invitations: lookup by token
CREATE UNIQUE INDEX idx_team_invitations_token ON public.team_invitations(token);

-- Invitations: find pending invitations by email
CREATE INDEX idx_team_invitations_email_pending
  ON public.team_invitations(email, status)
  WHERE status = 'pending';

-- =============================================================================
-- 6. Helper: check if user is a member of a team
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  );
$$;

-- =============================================================================
-- 7. RLS Policies — teams
-- =============================================================================

-- SELECT: only team members can see non-archived teams
CREATE POLICY "Team members can read own teams"
  ON public.teams FOR SELECT
  USING (public.is_team_member(id));

-- INSERT: any trainer can create a team
CREATE POLICY "Trainers can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND public.has_role('TRAINER')
  );

-- UPDATE: only team members can update
CREATE POLICY "Team members can update team"
  ON public.teams FOR UPDATE
  USING (public.is_team_member(id))
  WITH CHECK (public.is_team_member(id));

-- DELETE: not allowed (soft-delete via archived_at)

-- =============================================================================
-- 8. RLS Policies — team_members
-- =============================================================================

-- SELECT: only team members can see other members
CREATE POLICY "Team members can read members"
  ON public.team_members FOR SELECT
  USING (public.is_team_member(team_id));

-- INSERT: only team members can add new members
CREATE POLICY "Team members can add members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    public.is_team_member(team_id)
    OR (
      -- Allow the team creator to insert themselves as first member
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1 FROM public.teams
        WHERE id = team_id AND created_by = auth.uid()
      )
    )
  );

-- DELETE: team members can remove members (or self-leave)
CREATE POLICY "Team members can remove members"
  ON public.team_members FOR DELETE
  USING (
    public.is_team_member(team_id)
    OR auth.uid() = user_id  -- self-leave
  );

-- =============================================================================
-- 9. RLS Policies — team_athletes
-- =============================================================================

-- SELECT: only team members can see athletes
CREATE POLICY "Team members can read team athletes"
  ON public.team_athletes FOR SELECT
  USING (public.is_team_member(team_id));

-- Athletes can see their own team assignments (dashboard transparency)
CREATE POLICY "Athletes can read own team assignments"
  ON public.team_athletes FOR SELECT
  USING (auth.uid() = athlete_id);

-- INSERT: only team members can assign athletes
CREATE POLICY "Team members can assign athletes"
  ON public.team_athletes FOR INSERT
  WITH CHECK (
    public.is_team_member(team_id)
    AND auth.uid() = assigned_by
  );

-- DELETE: only team members can remove athletes
CREATE POLICY "Team members can remove team athletes"
  ON public.team_athletes FOR DELETE
  USING (public.is_team_member(team_id));

-- =============================================================================
-- 10. RLS Policies — team_invitations
-- =============================================================================

-- SELECT: team members + the invited person can see invitations
CREATE POLICY "Team members can read invitations"
  ON public.team_invitations FOR SELECT
  USING (public.is_team_member(team_id));

CREATE POLICY "Invited users can read own invitations"
  ON public.team_invitations FOR SELECT
  USING (email = (auth.jwt() ->> 'email'));

-- INSERT: team members can create invitations
CREATE POLICY "Team members can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    public.is_team_member(team_id)
    AND auth.uid() = invited_by
  );

-- UPDATE: only the invited person can accept/decline
CREATE POLICY "Invited users can respond to invitations"
  ON public.team_invitations FOR UPDATE
  USING (email = (auth.jwt() ->> 'email'))
  WITH CHECK (email = (auth.jwt() ->> 'email'));

-- DELETE: team members can cancel invitations
CREATE POLICY "Team members can cancel invitations"
  ON public.team_invitations FOR DELETE
  USING (public.is_team_member(team_id));

-- =============================================================================
-- 11. Athletes can read team info for their assigned teams
-- =============================================================================

-- Athletes need to read team name/logo for their dashboard card
CREATE POLICY "Athletes can read teams they are assigned to"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_athletes
      WHERE team_athletes.team_id = teams.id
        AND team_athletes.athlete_id = auth.uid()
    )
  );

-- Athletes need to see how many trainers are in their teams
CREATE POLICY "Athletes can read members of their teams"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_athletes
      WHERE team_athletes.team_id = team_members.team_id
        AND team_athletes.athlete_id = auth.uid()
    )
  );

-- =============================================================================
-- 12. Auto-archive trigger: archive team when last trainer leaves
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_last_trainer_leaves()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  remaining_count integer;
BEGIN
  -- Count remaining members after the deletion
  SELECT COUNT(*) INTO remaining_count
  FROM public.team_members
  WHERE team_id = OLD.team_id;

  -- If no trainers remain, archive the team and remove athlete assignments
  IF remaining_count = 0 THEN
    -- Archive the team
    UPDATE public.teams
    SET archived_at = now()
    WHERE id = OLD.team_id AND archived_at IS NULL;

    -- Remove all athlete assignments
    DELETE FROM public.team_athletes
    WHERE team_id = OLD.team_id;
  END IF;

  RETURN OLD;
END;
$$;

CREATE TRIGGER on_team_member_removed
  AFTER DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_last_trainer_leaves();

-- =============================================================================
-- 13. Storage bucket for team logos
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-logos',
  'team-logos',
  true,
  2097152,  -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: team members can upload/delete logos
CREATE POLICY "Team members can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'team-logos'
    AND public.is_team_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Team members can update logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'team-logos'
    AND public.is_team_member((storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Team members can delete logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'team-logos'
    AND public.is_team_member((storage.foldername(name))[1]::uuid)
  );

-- Public read for team logos (bucket is public)
CREATE POLICY "Anyone can read team logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-logos');
