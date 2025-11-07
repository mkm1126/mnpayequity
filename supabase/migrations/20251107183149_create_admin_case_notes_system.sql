/*
  # Create Admin Case Notes System

  ## Overview
  This migration creates a comprehensive case notes system for admin users only.
  Admins can create notes at both the jurisdiction level (organizational notes) 
  and case/report level (specific case tracking notes).

  ## 1. New Tables
    - `admin_case_notes`
      - `id` (uuid, primary key) - Unique identifier
      - `note_type` (text) - Either 'jurisdiction' or 'case' to distinguish note types
      - `jurisdiction_id` (uuid, foreign key) - Links to jurisdictions table
      - `report_id` (uuid, foreign key, nullable) - Links to reports table for case notes
      - `title` (text) - Note title with character limit
      - `content` (text) - Full note content
      - `category` (text) - Category for organization (e.g., 'general', 'compliance', 'follow-up', 'issue')
      - `tags` (text[]) - Array of tags for flexible organization
      - `priority` (text) - Priority level: 'low', 'medium', 'high', 'urgent'
      - `is_pinned` (boolean) - Whether note is pinned to top of list
      - `created_by` (uuid, foreign key) - User who created the note
      - `created_by_email` (text) - Email of creator for display
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `attachment_metadata` (jsonb) - Metadata for any attachments

  ## 2. Security
    - Enable RLS on `admin_case_notes` table
    - RESTRICTIVE policies: Only admin users can access these notes
    - Policies check `is_admin` flag in user_profiles
    - All CRUD operations require admin privileges

  ## 3. Indexes
    - Index on jurisdiction_id for fast jurisdiction-based queries
    - Index on report_id for fast case-based queries
    - Index on created_by for author filtering
    - Index on category for category filtering
    - Index on priority for priority-based sorting
    - Index on updated_at for chronological sorting
    - Index on is_pinned for pinned notes query
    - Full-text search index on title and content

  ## 4. Important Notes
    - Data integrity is protected with foreign key constraints
    - Cascade deletes ensure orphaned notes are cleaned up
    - Default values prevent null issues
    - Timestamps are automatically managed
*/

CREATE TABLE IF NOT EXISTS admin_case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_type text NOT NULL DEFAULT 'jurisdiction' CHECK (note_type IN ('jurisdiction', 'case')),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'compliance', 'follow-up', 'issue', 'data-quality', 'communication', 'approval', 'other')),
  tags text[] DEFAULT ARRAY[]::text[],
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_pinned boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  attachment_metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_case_note_has_report CHECK (
    (note_type = 'case' AND report_id IS NOT NULL) OR 
    (note_type = 'jurisdiction' AND report_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_admin_case_notes_jurisdiction_id ON admin_case_notes(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_report_id ON admin_case_notes(report_id) WHERE report_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_created_by ON admin_case_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_category ON admin_case_notes(category);
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_priority ON admin_case_notes(priority);
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_updated_at ON admin_case_notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_is_pinned ON admin_case_notes(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_admin_case_notes_note_type ON admin_case_notes(note_type);

CREATE INDEX IF NOT EXISTS idx_admin_case_notes_search ON admin_case_notes USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
);

ALTER TABLE admin_case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin users can view case notes"
  ON admin_case_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admin users can insert case notes"
  ON admin_case_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admin users can update case notes"
  ON admin_case_notes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Only admin users can delete case notes"
  ON admin_case_notes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE OR REPLACE FUNCTION update_admin_case_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_case_notes_updated_at
  BEFORE UPDATE ON admin_case_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_case_notes_updated_at();
