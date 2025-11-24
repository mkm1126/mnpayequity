/*
  # Fix Admin RLS Policies - Case Sensitivity

  ## Changes
  - Update all RLS policies to use case-insensitive role comparison
  - The role field contains 'Admin' (capitalized) but policies check for 'admin' (lowercase)
  - Use LOWER() function for case-insensitive comparison
*/

-- Fix submission_reminders policies
DROP POLICY IF EXISTS "Admins can view all submission reminders" ON submission_reminders;
DROP POLICY IF EXISTS "Admins can insert submission reminders" ON submission_reminders;
DROP POLICY IF EXISTS "Admins can update submission reminders" ON submission_reminders;

CREATE POLICY "Admins can view all submission reminders"
  ON submission_reminders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (LOWER(user_profiles.role) = 'admin' OR user_profiles.is_admin = true)
    )
  );

CREATE POLICY "Admins can insert submission reminders"
  ON submission_reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (LOWER(user_profiles.role) = 'admin' OR user_profiles.is_admin = true)
    )
  );

CREATE POLICY "Admins can update submission reminders"
  ON submission_reminders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (LOWER(user_profiles.role) = 'admin' OR user_profiles.is_admin = true)
    )
  );

-- Fix compliance_history policies
DROP POLICY IF EXISTS "Admins can view all compliance history" ON compliance_history;
DROP POLICY IF EXISTS "Admins can insert compliance history" ON compliance_history;
DROP POLICY IF EXISTS "Admins can update compliance history" ON compliance_history;

CREATE POLICY "Admins can view all compliance history"
  ON compliance_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (LOWER(user_profiles.role) = 'admin' OR user_profiles.is_admin = true)
    )
  );

CREATE POLICY "Admins can insert compliance history"
  ON compliance_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (LOWER(user_profiles.role) = 'admin' OR user_profiles.is_admin = true)
    )
  );

CREATE POLICY "Admins can update compliance history"
  ON compliance_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (LOWER(user_profiles.role) = 'admin' OR user_profiles.is_admin = true)
    )
  );