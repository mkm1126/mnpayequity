/*
  # Post-Submission Workflow System

  This migration implements a comprehensive post-submission workflow system that allows
  jurisdictions to reopen submitted reports, make changes, and resubmit with full audit trails.

  ## 1. New Tables
    
    ### `submission_history`
    Tracks all submission and reopening events with complete audit trail
    - `id` (uuid, primary key)
    - `report_id` (uuid, foreign key to reports)
    - `jurisdiction_id` (uuid, foreign key to jurisdictions)
    - `action_type` (text) - 'submitted', 'reopened', 'resubmitted'
    - `previous_status` (text) - Status before the action
    - `new_status` (text) - Status after the action
    - `revision_notes` (text, nullable) - User-provided notes about changes
    - `data_snapshot` (jsonb, nullable) - Snapshot of key data at submission time
    - `performed_by` (uuid, nullable) - User who performed the action
    - `performed_by_email` (text) - Email of user who performed the action
    - `created_at` (timestamptz)

    ### `report_revisions`
    Stores detailed information about each revision made to a report
    - `id` (uuid, primary key)
    - `report_id` (uuid, foreign key to reports)
    - `revision_number` (integer) - Sequential revision counter
    - `revision_notes` (text) - Required notes about what changed
    - `changes_summary` (jsonb) - Structured data about what changed
    - `jobs_modified_count` (integer) - Number of jobs changed
    - `jobs_added_count` (integer) - Number of jobs added
    - `jobs_removed_count` (integer) - Number of jobs removed
    - `implementation_modified` (boolean) - Whether implementation form changed
    - `created_by` (uuid, nullable)
    - `created_by_email` (text)
    - `created_at` (timestamptz)

  ## 2. Modified Tables

    ### `reports` table additions
    - `revision_count` (integer) - Tracks number of times report has been revised
    - `previous_submission_date` (timestamptz) - Stores last submission date when reopened
    - `revision_notes` (text) - Latest revision notes
    - `is_resubmission` (boolean) - Flag indicating if this is a resubmission
    - `workflow_status` (text) - Enhanced status: 'draft', 'submitted', 'under_revision', 'resubmitted', 'finalized'

  ## 3. Security
    - Enable RLS on all new tables
    - Policies allow users to access their jurisdiction's submission history
    - Admin users can view all submission history
    - Audit trail is immutable (insert-only for history tables)

  ## 4. Indexes
    - Index on submission_history for report lookups
    - Index on report_revisions for report and revision number lookups
    - Index on reports for workflow_status filtering

  ## 5. Important Notes
    - All history records are immutable once created
    - Revision counting starts at 0 for new reports
    - Data snapshots capture key metrics at submission time for comparison
    - Change tracking helps admins understand what was modified
*/

-- Add new columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS previous_submission_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revision_notes TEXT,
ADD COLUMN IF NOT EXISTS is_resubmission BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'draft';

-- Add check constraint for workflow_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'reports_workflow_status_check'
  ) THEN
    ALTER TABLE reports
    ADD CONSTRAINT reports_workflow_status_check
    CHECK (workflow_status IN ('draft', 'submitted', 'under_revision', 'resubmitted', 'finalized'));
  END IF;
END $$;

-- Create submission_history table
CREATE TABLE IF NOT EXISTS submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('submitted', 'reopened', 'resubmitted')),
  previous_status TEXT NOT NULL DEFAULT '',
  new_status TEXT NOT NULL DEFAULT '',
  revision_notes TEXT,
  data_snapshot JSONB DEFAULT '{}'::jsonb,
  performed_by UUID,
  performed_by_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create report_revisions table
CREATE TABLE IF NOT EXISTS report_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL DEFAULT 1,
  revision_notes TEXT NOT NULL DEFAULT '',
  changes_summary JSONB DEFAULT '{}'::jsonb,
  jobs_modified_count INTEGER DEFAULT 0,
  jobs_added_count INTEGER DEFAULT 0,
  jobs_removed_count INTEGER DEFAULT 0,
  implementation_modified BOOLEAN DEFAULT false,
  created_by UUID,
  created_by_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, revision_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submission_history_report_id ON submission_history(report_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_jurisdiction_id ON submission_history(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_submission_history_action_type ON submission_history(action_type);
CREATE INDEX IF NOT EXISTS idx_submission_history_created_at ON submission_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_report_revisions_report_id ON report_revisions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_revisions_revision_number ON report_revisions(report_id, revision_number);

CREATE INDEX IF NOT EXISTS idx_reports_workflow_status ON reports(workflow_status);
CREATE INDEX IF NOT EXISTS idx_reports_revision_count ON reports(revision_count);

-- Enable RLS on new tables
ALTER TABLE submission_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_revisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submission_history

-- Users can view submission history for their jurisdiction's reports
CREATE POLICY "Users can view own jurisdiction submission history"
  ON submission_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.jurisdiction_id = (
        SELECT jurisdiction_id::text FROM reports WHERE reports.id = submission_history.report_id
      )
    )
  );

-- Admins can view all submission history
CREATE POLICY "Admins can view all submission history"
  ON submission_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Users can insert submission history for their jurisdiction
CREATE POLICY "Users can insert submission history for own jurisdiction"
  ON submission_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.jurisdiction_id = (
        SELECT jurisdiction_id::text FROM reports WHERE reports.id = submission_history.report_id
      )
    )
  );

-- RLS Policies for report_revisions

-- Users can view revisions for their jurisdiction's reports
CREATE POLICY "Users can view own jurisdiction report revisions"
  ON report_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.jurisdiction_id = (
        SELECT jurisdiction_id::text FROM reports WHERE reports.id = report_revisions.report_id
      )
    )
  );

-- Admins can view all report revisions
CREATE POLICY "Admins can view all report revisions"
  ON report_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Users can insert revisions for their jurisdiction
CREATE POLICY "Users can insert revisions for own jurisdiction"
  ON report_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.jurisdiction_id = (
        SELECT jurisdiction_id::text FROM reports WHERE reports.id = report_revisions.report_id
      )
    )
  );

-- Create a function to automatically log submission events
CREATE OR REPLACE FUNCTION log_submission_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when case_status changes to 'Submitted'
  IF (TG_OP = 'UPDATE' AND OLD.case_status != 'Submitted' AND NEW.case_status = 'Submitted') THEN
    INSERT INTO submission_history (
      report_id,
      jurisdiction_id,
      action_type,
      previous_status,
      new_status,
      performed_by_email,
      data_snapshot
    ) VALUES (
      NEW.id,
      NEW.jurisdiction_id,
      CASE 
        WHEN NEW.is_resubmission = true THEN 'resubmitted'
        ELSE 'submitted'
      END,
      OLD.case_status,
      NEW.case_status,
      COALESCE(
        (SELECT email FROM user_profiles WHERE user_id = auth.uid()),
        'system'
      ),
      jsonb_build_object(
        'case_status', NEW.case_status,
        'compliance_status', NEW.compliance_status,
        'approval_status', NEW.approval_status,
        'submitted_at', NEW.submitted_at,
        'revision_count', NEW.revision_count
      )
    );
  END IF;

  -- Log when report is reopened (Submitted -> Private/Shared)
  IF (TG_OP = 'UPDATE' AND OLD.case_status = 'Submitted' AND NEW.case_status IN ('Private', 'Shared')) THEN
    INSERT INTO submission_history (
      report_id,
      jurisdiction_id,
      action_type,
      previous_status,
      new_status,
      performed_by_email,
      data_snapshot
    ) VALUES (
      NEW.id,
      NEW.jurisdiction_id,
      'reopened',
      OLD.case_status,
      NEW.case_status,
      COALESCE(
        (SELECT email FROM user_profiles WHERE user_id = auth.uid()),
        'system'
      ),
      jsonb_build_object(
        'case_status', NEW.case_status,
        'previous_submission_date', NEW.previous_submission_date,
        'revision_count', NEW.revision_count
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic submission logging
DROP TRIGGER IF EXISTS trigger_log_submission_event ON reports;
CREATE TRIGGER trigger_log_submission_event
  AFTER UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION log_submission_event();

-- Comment on tables for documentation
COMMENT ON TABLE submission_history IS 'Immutable audit log of all report submission, reopening, and resubmission events';
COMMENT ON TABLE report_revisions IS 'Detailed tracking of changes made in each report revision';
COMMENT ON COLUMN reports.revision_count IS 'Number of times report has been reopened and resubmitted';
COMMENT ON COLUMN reports.previous_submission_date IS 'Date of previous submission when report was reopened';
COMMENT ON COLUMN reports.workflow_status IS 'Enhanced workflow status beyond basic case_status';
COMMENT ON COLUMN reports.is_resubmission IS 'Indicates whether current submission is a resubmission after reopening';
