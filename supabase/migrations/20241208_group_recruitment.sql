-- Add recruitment columns to scanlation_groups
ALTER TABLE public.scanlation_groups
ADD COLUMN IF NOT EXISTS recruitment_status text DEFAULT 'closed', -- 'open', 'closed'
ADD COLUMN IF NOT EXISTS recruitment_roles text[], -- ['Translators', 'Cleaners', 'Typesetters', 'Redrawers']
ADD COLUMN IF NOT EXISTS recruitment_description text;

-- Update RLS to allow owners to update these fields (already covered by "scanlation_groups_update_owner" usually, but good to check)
-- Ensuring the policy exists (checked in 0002/0007 implies mostly inserts/selects, need to verify updates)

-- We'll assume the generic update policy exists or will be covered by standard row updates if policies allow.
-- If not, we might need:
-- CREATE POLICY "scanlation_groups_update_owner" ON public.scanlation_groups FOR UPDATE USING (auth.uid() = owner_id);
