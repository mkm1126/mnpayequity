/*
  # Add Admin Dashboard Features

  ## Overview
  This migration adds comprehensive features for the admin dashboard including:
  - Follow-up due dates for case notes
  - Notification tracking and dismissal
  - Admin activity logging
  - Email notification preferences

  ## 1. Admin Case Notes Updates
    - Add `due_date` (date, nullable) - For tracking follow-up deadlines
    - Add `completed_at` (timestamptz, nullable) - When follow-up was completed
    - Add `completed_by` (uuid, nullable) - User who completed the follow-up

  ## 2. New Tables
    - `dismissed_notifications`
      - Tracks which notifications admins have dismissed
      - Links to admin_case_notes for notification source
      - Stores dismissal timestamp and admin user
    
    - `notification_preferences`
      - Stores admin email notification preferences
      - Controls which notification types trigger emails
      - Allows customization of email frequency
    
    - `admin_activity_log`
      - Comprehensive audit log of all admin actions
      - Tracks actions across the system
      - Includes context and metadata for each action

  ## 3. Indexes
    - Index on due_date for efficient deadline queries
    - Index on completed_at for filtering completed follow-ups
    - Index on admin_activity_log for recent activity queries

  ## 4. Security
    - Enable RLS on all new tables
    - Restrict access to admin users only
    - Proper foreign key constraints and cascading deletes
*/

-- Add new columns to admin_case_notes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_case_notes' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE admin_case_notes ADD COLUMN due_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_case_notes' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE admin_case_notes ADD COLUMN completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_case_notes' AND column_name = 'completed_by'
  ) THEN
    ALTER TABLE admin_case_notes ADD COLUMN completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_due_date ON admin_case_notes(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_completed_at ON admin_case_notes(completed_at) WHERE completed_at IS NOT NULL;

-- Create dismissed_notifications table
CREATE TABLE IF NOT EXISTS dismissed_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id uuid NOT NULL REFERENCES admin_case_notes(id) ON DELETE CASCADE,
  dismissed_at timestamptz DEFAULT now(),
  dismiss_reason text,
  UNIQUE(admin_user_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_dismissed_notifications_admin_user ON dismissed_notifications(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_dismissed_notifications_note ON dismissed_notifications(note_id);

ALTER TABLE dismissed_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view their dismissed notifications"
  ON dismissed_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admin users can dismiss notifications"
  ON dismissed_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
    AND admin_user_id = auth.uid()
  );

CREATE POLICY "Admin users can delete their dismissed notifications"
  ON dismissed_notifications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
    AND admin_user_id = auth.uid()
  );

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_urgent_notes boolean DEFAULT true,
  email_overdue_followups boolean DEFAULT true,
  email_pending_approvals boolean DEFAULT true,
  email_daily_digest boolean DEFAULT false,
  email_weekly_digest boolean DEFAULT false,
  digest_time time DEFAULT '09:00:00',
  do_not_disturb boolean DEFAULT false,
  dnd_start_time time,
  dnd_end_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(admin_user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_admin_user ON notification_preferences(admin_user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view their notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
    AND admin_user_id = auth.uid()
  );

CREATE POLICY "Admin users can insert their notification preferences"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
    AND admin_user_id = auth.uid()
  );

CREATE POLICY "Admin users can update their notification preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
    AND admin_user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
    AND admin_user_id = auth.uid()
  );

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text NOT NULL,
  action_type text NOT NULL,
  action_description text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON admin_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_entity ON admin_activity_log(entity_type, entity_id);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view activity log"
  ON admin_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admin users can insert activity log"
  ON admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create trigger for notification_preferences updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Helper function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action_type text,
  p_action_description text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
  v_admin_email text;
BEGIN
  SELECT email INTO v_admin_email
  FROM user_profiles
  WHERE user_id = auth.uid();

  INSERT INTO admin_activity_log (
    admin_user_id,
    admin_email,
    action_type,
    action_description,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    auth.uid(),
    v_admin_email,
    p_action_type,
    p_action_description,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
