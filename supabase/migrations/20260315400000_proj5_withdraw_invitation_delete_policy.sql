-- Migration: PROJ-5 — Add DELETE RLS policy for invitation withdrawal
-- The withdrawInvitation server action performs a hard DELETE on pending connections.
-- Without a DELETE policy, RLS silently blocks the operation (returns 0 rows).

-- Trainers can delete their own pending connections (withdraw invitation)
CREATE POLICY "Trainers can delete own pending connections"
  ON public.trainer_athlete_connections FOR DELETE
  USING (
    auth.uid() = trainer_id
    AND status = 'pending'
  );
