/*
  # Add Submission Deadline Tracking for Auto-Approval

  1. New Fields
    - `reports.submitted_on_time` (boolean) - Indicates if report was submitted by January 31st deadline (every three years)
    - `reports.submission_deadline` (date) - Stores the actual deadline date (January 31st of report year, due every three years)
    - `reports.test_results` (jsonb) - Stores detailed compliance test results for audit trail
    - `reports.test_applicability` (jsonb) - Tracks which tests apply to this report
  
  2. Purpose
    - Enable auto-approval system to validate submission deadline compliance
    - Track which compliance tests are applicable vs skipped (salary range, exceptional service pay)
    - Store detailed test outcomes for transparency and audit purposes
    - Support manual review decisions with complete test data
  
  3. Auto-Approval Logic
    - Reports must be submitted on or before January 31st (every three years) to qualify for auto-approval
    - Late submissions that pass all tests still require manual review
    - Test results stored in structured format for admin dashboard display
*/

-- Add new columns to reports table
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS submitted_on_time BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS submission_deadline DATE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS test_results JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS test_applicability JSONB DEFAULT NULL;

-- Add index for deadline-based queries
CREATE INDEX IF NOT EXISTS idx_reports_deadline ON reports(submission_deadline, submitted_on_time);

-- Add index for submission date queries
CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON reports(submitted_at);

-- Add comment explaining the fields
COMMENT ON COLUMN reports.submitted_on_time IS 'Indicates if report was submitted by January 31st deadline (every three years) for auto-approval eligibility';
COMMENT ON COLUMN reports.submission_deadline IS 'The actual deadline date (January 31st of report year, due every three years) for this report';
COMMENT ON COLUMN reports.test_results IS 'JSON structure storing detailed results of all compliance tests (underpayment ratio, salary range, exceptional service, etc.)';
COMMENT ON COLUMN reports.test_applicability IS 'JSON structure indicating which tests are applicable vs not applicable (e.g., salary range test skipped if no data)';
