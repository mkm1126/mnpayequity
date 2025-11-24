/*
  # Fix Compliance History RLS Policy

  ## Changes
  - Update the RLS policy for compliance_history to properly handle text-to-uuid conversion
  - The jurisdiction_id in user_profiles is TEXT, but in compliance_history it's UUID
  - Need to cast properly to avoid UUID parsing errors
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view their own compliance history" ON compliance_history;

-- Create corrected policy without problematic casting
CREATE POLICY "Users can view their own compliance history"
  ON compliance_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid()
      AND up.jurisdiction_id = jurisdiction_id::text
    )
  );