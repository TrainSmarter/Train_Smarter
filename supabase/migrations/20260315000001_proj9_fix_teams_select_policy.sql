-- Fix: Allow team creator to read the team immediately after INSERT
-- The existing SELECT policy requires is_team_member(), but the creator
-- isn't a member yet at INSERT time (member row is added in step 2).
-- This caused .insert().select().single() to fail with RLS violation.

DROP POLICY "Team members can read own teams" ON public.teams;

CREATE POLICY "Team members and creator can read teams"
  ON public.teams FOR SELECT
  USING (
    public.is_team_member(id)
    OR auth.uid() = created_by
  );
