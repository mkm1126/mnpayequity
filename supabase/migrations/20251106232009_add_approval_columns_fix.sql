/*
  # Fix Missing Approval Columns
  
  Add approval workflow columns that were missing from reports table.
*/

-- Add approval columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft';
ALTER TABLE reports ADD COLUMN IF NOT EXISTS approved_by text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS certificate_generated_at timestamptz;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS auto_approved boolean DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS alternative_analysis_notes text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS significant_changes_explanation text;

-- Update existing submitted reports to have pending status
UPDATE reports 
SET approval_status = 'pending' 
WHERE case_status = 'Submitted' AND approval_status = 'draft';

-- Set submitted_at for reports that don't have it
UPDATE reports 
SET submitted_at = created_at 
WHERE case_status = 'Submitted' AND submitted_at IS NULL;
