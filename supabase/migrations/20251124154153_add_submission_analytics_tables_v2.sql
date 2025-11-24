/*
  # Submission Analytics Enhancement - Reminder and History Tracking

  ## Overview
  This migration adds comprehensive submission analytics capabilities including
  automated reminder tracking, compliance history, and enhanced reporting features.

  ## New Tables
  
  ### 1. submission_reminders
  Tracks all automated and manual reminder emails sent to jurisdictions about upcoming
  or overdue submissions.
  
  Fields:
  - id (uuid, primary key)
  - jurisdiction_id (uuid, references jurisdictions)
  - report_year (integer) - The reporting year for which reminder was sent
  - reminder_type (text) - Type: 'approaching_90d', 'approaching_60d', 'approaching_30d', 'approaching_7d', 'overdue_1d', 'overdue_30d', 'manual'
  - sent_at (timestamptz) - When the reminder was sent
  - email_sent_to (text) - Email address(es) that received the reminder
  - email_subject (text) - Subject line of the email
  - email_delivered (boolean) - Whether email was successfully delivered
  - opened_at (timestamptz) - If email was opened (tracking)
  - created_by (text) - Admin email who triggered manual reminder (null for automated)
  - created_at (timestamptz)

  ### 2. compliance_history
  Stores historical compliance data for trend analysis across multiple reporting cycles.
  
  Fields:
  - id (uuid, primary key)
  - jurisdiction_id (uuid, references jurisdictions)
  - report_id (uuid, references reports)
  - report_year (integer)
  - submission_date (timestamptz) - When report was submitted
  - compliance_status (text) - 'In Compliance' or 'Out of Compliance'
  - approval_status (text) - 'approved', 'rejected', 'auto_approved'
  - submitted_on_time (boolean) - Whether submitted before deadline
  - days_before_deadline (integer) - Positive if early, negative if late
  - statistical_test_passed (boolean)
  - salary_range_test_passed (boolean)
  - exceptional_service_test_passed (boolean)
  - requires_manual_review (boolean)
  - total_jobs (integer) - Number of job classifications
  - total_employees (integer) - Total male + female employees
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Only authenticated admin users can access these tables
  - Read-only access for standard users viewing their own jurisdiction data
*/

-- Create submission_reminders table
CREATE TABLE IF NOT EXISTS submission_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN (
    'approaching_90d', 'approaching_60d', 'approaching_30d', 'approaching_7d',
    'overdue_1d', 'overdue_30d', 'manual'
  )),
  sent_at timestamptz NOT NULL DEFAULT now(),
  email_sent_to text NOT NULL,
  email_subject text NOT NULL,
  email_delivered boolean DEFAULT true,
  opened_at timestamptz,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for submission_reminders
CREATE INDEX IF NOT EXISTS idx_submission_reminders_jurisdiction 
  ON submission_reminders(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_submission_reminders_report_year 
  ON submission_reminders(report_year);
CREATE INDEX IF NOT EXISTS idx_submission_reminders_sent_at 
  ON submission_reminders(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_reminders_type 
  ON submission_reminders(reminder_type);

-- Create compliance_history table
CREATE TABLE IF NOT EXISTS compliance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  submission_date timestamptz NOT NULL,
  compliance_status text NOT NULL,
  approval_status text NOT NULL,
  submitted_on_time boolean DEFAULT false,
  days_before_deadline integer,
  statistical_test_passed boolean,
  salary_range_test_passed boolean,
  exceptional_service_test_passed boolean,
  requires_manual_review boolean DEFAULT false,
  total_jobs integer DEFAULT 0,
  total_employees integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for compliance_history
CREATE INDEX IF NOT EXISTS idx_compliance_history_jurisdiction 
  ON compliance_history(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_compliance_history_report_year 
  ON compliance_history(report_year DESC);
CREATE INDEX IF NOT EXISTS idx_compliance_history_compliance_status 
  ON compliance_history(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_history_submission_date 
  ON compliance_history(submission_date DESC);

-- Add unique constraint to compliance_history on report_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'compliance_history_report_id_key'
  ) THEN
    ALTER TABLE compliance_history ADD CONSTRAINT compliance_history_report_id_key UNIQUE (report_id);
  END IF;
END $$;

-- Enable RLS on submission_reminders
ALTER TABLE submission_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submission_reminders
CREATE POLICY "Admins can view all submission reminders"
  ON submission_reminders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert submission reminders"
  ON submission_reminders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update submission reminders"
  ON submission_reminders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Enable RLS on compliance_history
ALTER TABLE compliance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_history
CREATE POLICY "Admins can view all compliance history"
  ON compliance_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert compliance history"
  ON compliance_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update compliance history"
  ON compliance_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own compliance history"
  ON compliance_history FOR SELECT
  TO authenticated
  USING (
    jurisdiction_id IN (
      SELECT CAST(up.jurisdiction_id AS uuid)
      FROM user_profiles up 
      WHERE up.user_id = auth.uid()
    )
  );

-- Create a function to automatically populate compliance_history when reports are approved
CREATE OR REPLACE FUNCTION populate_compliance_history()
RETURNS TRIGGER AS $$
DECLARE
  v_job_count integer;
  v_total_employees integer;
  v_deadline_date date;
  v_days_diff integer;
BEGIN
  -- Only process when report is submitted and approved
  IF NEW.case_status = 'Submitted' AND 
     NEW.approval_status IN ('approved', 'auto_approved') AND
     (OLD.approval_status IS NULL OR OLD.approval_status != NEW.approval_status) THEN
    
    -- Get job count and total employees
    SELECT COUNT(*), COALESCE(SUM(males + females), 0)
    INTO v_job_count, v_total_employees
    FROM job_classifications
    WHERE report_id = NEW.id;
    
    -- Calculate deadline (January 31st of report year)
    v_deadline_date := DATE(NEW.report_year || '-01-31');
    
    -- Calculate days before deadline (positive if early, negative if late)
    IF NEW.submitted_at IS NOT NULL THEN
      v_days_diff := v_deadline_date - DATE(NEW.submitted_at);
    ELSE
      v_days_diff := NULL;
    END IF;
    
    -- Insert or update compliance history
    INSERT INTO compliance_history (
      jurisdiction_id,
      report_id,
      report_year,
      submission_date,
      compliance_status,
      approval_status,
      submitted_on_time,
      days_before_deadline,
      statistical_test_passed,
      salary_range_test_passed,
      exceptional_service_test_passed,
      requires_manual_review,
      total_jobs,
      total_employees
    ) VALUES (
      NEW.jurisdiction_id,
      NEW.id,
      NEW.report_year,
      NEW.submitted_at,
      NEW.compliance_status,
      NEW.approval_status,
      NEW.submitted_on_time,
      v_days_diff,
      CASE 
        WHEN NEW.test_results IS NOT NULL THEN
          COALESCE((NEW.test_results->>'statisticalTestPassed')::boolean, false)
        ELSE false
      END,
      CASE 
        WHEN NEW.test_results IS NOT NULL THEN
          COALESCE((NEW.test_results->>'salaryRangeTestPassed')::boolean, false)
        ELSE false
      END,
      CASE 
        WHEN NEW.test_results IS NOT NULL THEN
          COALESCE((NEW.test_results->>'exceptionalServiceTestPassed')::boolean, false)
        ELSE false
      END,
      NEW.requires_manual_review,
      v_job_count,
      v_total_employees
    )
    ON CONFLICT (report_id) DO UPDATE SET
      compliance_status = EXCLUDED.compliance_status,
      approval_status = EXCLUDED.approval_status,
      submitted_on_time = EXCLUDED.submitted_on_time,
      days_before_deadline = EXCLUDED.days_before_deadline,
      statistical_test_passed = EXCLUDED.statistical_test_passed,
      salary_range_test_passed = EXCLUDED.salary_range_test_passed,
      exceptional_service_test_passed = EXCLUDED.exceptional_service_test_passed,
      requires_manual_review = EXCLUDED.requires_manual_review,
      total_jobs = EXCLUDED.total_jobs,
      total_employees = EXCLUDED.total_employees,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to populate compliance_history
DROP TRIGGER IF EXISTS trigger_populate_compliance_history ON reports;
CREATE TRIGGER trigger_populate_compliance_history
  AFTER INSERT OR UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION populate_compliance_history();

-- Populate historical compliance data from existing reports
INSERT INTO compliance_history (
  jurisdiction_id,
  report_id,
  report_year,
  submission_date,
  compliance_status,
  approval_status,
  submitted_on_time,
  days_before_deadline,
  statistical_test_passed,
  salary_range_test_passed,
  exceptional_service_test_passed,
  requires_manual_review,
  total_jobs,
  total_employees
)
SELECT 
  r.jurisdiction_id,
  r.id,
  r.report_year,
  r.submitted_at,
  r.compliance_status,
  r.approval_status,
  r.submitted_on_time,
  DATE(r.report_year || '-01-31') - DATE(r.submitted_at) as days_before_deadline,
  COALESCE((r.test_results->>'statisticalTestPassed')::boolean, false),
  COALESCE((r.test_results->>'salaryRangeTestPassed')::boolean, false),
  COALESCE((r.test_results->>'exceptionalServiceTestPassed')::boolean, false),
  r.requires_manual_review,
  (SELECT COUNT(*) FROM job_classifications jc WHERE jc.report_id = r.id),
  (SELECT COALESCE(SUM(males + females), 0) FROM job_classifications jc WHERE jc.report_id = r.id)
FROM reports r
WHERE r.case_status = 'Submitted' 
  AND r.approval_status IN ('approved', 'auto_approved')
  AND r.submitted_at IS NOT NULL
ON CONFLICT (report_id) DO NOTHING;