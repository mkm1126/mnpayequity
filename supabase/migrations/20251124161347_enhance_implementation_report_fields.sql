/*
  # Enhance Implementation Report Fields
  
  1. Purpose
    - Add comprehensive fields to implementation_reports table to match official Minnesota Pay Equity Implementation Report format
    - Support Part A (Jurisdiction ID), Part B (Official Verification), and Part C (Total Payroll) sections
  
  2. New Fields Added
    **Part A - Jurisdiction Identification**
    - Fields are primarily pulled from jurisdictions and contacts tables (no new fields needed)
    
    **Part B - Official Verification**
    - evaluation_system_type: Type of evaluation system used
    - system_measures_all_factors: Confirmation that system measures skill, effort, responsibility, working conditions
    - health_benefits_status: Status of health insurance benefits evaluation
    - notice_posting_locations: Where the official notice was posted
    - notice_sent_to_representatives: Confirmation notice sent to exclusive representatives
    - notice_sent_to_library: Confirmation notice sent to public library
    
    **Part C - Total Payroll**
    - payroll_year: Calendar year for payroll reporting
    - certification_checkbox_confirmed: Confirmation of all certifications
    - date_submitted: Official submission date
    
  3. Changes
    - Add new columns to implementation_reports table
    - Set appropriate defaults and constraints
    - No RLS changes needed (inherits from existing policies)
*/

-- Add new fields for Part B: Official Verification
DO $$
BEGIN
  -- Evaluation system type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'evaluation_system_type'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN evaluation_system_type TEXT;
  END IF;
  
  -- System measures all factors confirmation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'system_measures_all_factors'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN system_measures_all_factors BOOLEAN DEFAULT false;
  END IF;
  
  -- Health benefits status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'health_benefits_status'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN health_benefits_status TEXT;
  END IF;
  
  -- Notice posting locations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'notice_posting_locations'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN notice_posting_locations TEXT;
  END IF;
  
  -- Notice sent to representatives
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'notice_sent_to_representatives'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN notice_sent_to_representatives BOOLEAN DEFAULT false;
  END IF;
  
  -- Notice sent to library
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'notice_sent_to_library'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN notice_sent_to_library BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add new fields for Part C: Total Payroll
DO $$
BEGIN
  -- Payroll year
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'payroll_year'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN payroll_year INTEGER;
  END IF;
  
  -- Certification checkbox confirmed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'certification_checkbox_confirmed'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN certification_checkbox_confirmed BOOLEAN DEFAULT false;
  END IF;
  
  -- Date submitted
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'implementation_reports' AND column_name = 'date_submitted'
  ) THEN
    ALTER TABLE implementation_reports 
    ADD COLUMN date_submitted TIMESTAMPTZ;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN implementation_reports.evaluation_system_type IS 'Type of job evaluation system: Designed Own, Purchased System, Consultant Developed, etc.';
COMMENT ON COLUMN implementation_reports.system_measures_all_factors IS 'Confirms system measures skill, effort, responsibility, and working conditions';
COMMENT ON COLUMN implementation_reports.health_benefits_status IS 'Status of health insurance benefits evaluation for male/female classes';
COMMENT ON COLUMN implementation_reports.notice_posting_locations IS 'Locations where official notice was posted (e.g., Bulletin Boards and Website)';
COMMENT ON COLUMN implementation_reports.notice_sent_to_representatives IS 'Confirmation that notice was sent to exclusive representatives';
COMMENT ON COLUMN implementation_reports.notice_sent_to_library IS 'Confirmation that notice was sent to public library';
COMMENT ON COLUMN implementation_reports.payroll_year IS 'Calendar year for total payroll reporting';
COMMENT ON COLUMN implementation_reports.certification_checkbox_confirmed IS 'Confirms signature, approval, accuracy, and completeness';
COMMENT ON COLUMN implementation_reports.date_submitted IS 'Official submission date of the implementation report';