/*
  # Pay Equity Management System - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for a pay equity management system
  that tracks jurisdictions, compliance reports, job classifications, and user access.

  ## New Tables

  ### Core Tables
  1. `jurisdictions` - Government entities submitting pay equity reports
  2. `contacts` - Contact persons for each jurisdiction
  3. `reports` - Pay equity reports for each jurisdiction/year
  4. `job_classifications` - Job data within each report
  5. `implementation_reports` - Implementation details for reports
  
  ### Supporting Tables
  6. `user_profiles` - User accounts and jurisdiction access
  7. `submission_checklists` - Pre-submission validation tracking
  8. `benefits_worksheets` - Health benefits calculations
  9. `audit_logs` - Change tracking and audit trail
  10. `notes` - General notes linked to various entities
  11. `report_notes` - Notes specific to reports
  12. `email_templates` - Email communication templates
  13. `email_history` - Email communication history

  ## Security
  - RLS enabled on all tables
  - Authenticated users have full access (admin system)
  - Anonymous users can read jurisdictions (for login)

  ## Notes
  - All timestamps use timestamptz for proper timezone handling
  - Foreign keys ensure referential integrity
  - Indexes optimize common query patterns
  - Default values prevent null-related errors
*/

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Jurisdictions table
CREATE TABLE IF NOT EXISTS jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT 'MN',
  zipcode text DEFAULT '',
  phone text DEFAULT '',
  fax text DEFAULT '',
  jurisdiction_type text DEFAULT '',
  next_report_year integer,
  follow_up_type text DEFAULT '',
  follow_up_date date,
  approval_status text DEFAULT 'pending',
  approval_notes text DEFAULT '',
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jurisdictions_jurisdiction_id ON jurisdictions(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_approval_status ON jurisdictions(approval_status);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  title text DEFAULT '',
  is_primary boolean DEFAULT false,
  email text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contacts_jurisdiction_id ON contacts(jurisdiction_id);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  case_number integer NOT NULL DEFAULT 1,
  case_description text NOT NULL DEFAULT '',
  case_status text DEFAULT 'Private',
  compliance_status text DEFAULT '',
  alternative_analysis_notes text,
  significant_changes_explanation text,
  requires_manual_review boolean DEFAULT false,
  approval_status text DEFAULT 'pending',
  approval_notes text DEFAULT '',
  approved_by text,
  approved_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(jurisdiction_id, report_year, case_number)
);

CREATE INDEX IF NOT EXISTS idx_reports_jurisdiction_id ON reports(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_year ON reports(report_year);
CREATE INDEX IF NOT EXISTS idx_reports_approval_status ON reports(approval_status);

-- Job Classifications table
CREATE TABLE IF NOT EXISTS job_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  job_number integer NOT NULL,
  title text NOT NULL DEFAULT '',
  males integer DEFAULT 0,
  females integer DEFAULT 0,
  points integer DEFAULT 0,
  min_salary numeric(10,2) DEFAULT 0,
  max_salary numeric(10,2) DEFAULT 0,
  years_to_max numeric(4,2) DEFAULT 0,
  years_service_pay numeric(4,2) DEFAULT 0,
  exceptional_service_category text DEFAULT '',
  benefits_included_in_salary numeric(10,2) DEFAULT 0,
  is_part_time boolean DEFAULT false,
  hours_per_week numeric(5,2),
  days_per_year integer,
  additional_cash_compensation numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(report_id, job_number)
);

CREATE INDEX IF NOT EXISTS idx_job_classifications_report_id ON job_classifications(report_id);

-- Implementation Reports table
CREATE TABLE IF NOT EXISTS implementation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  evaluation_system text DEFAULT '',
  evaluation_description text DEFAULT '',
  health_benefits_evaluated text DEFAULT '',
  health_benefits_description text DEFAULT '',
  notice_location text DEFAULT '',
  approved_by_body text DEFAULT '',
  chief_elected_official text DEFAULT '',
  official_title text DEFAULT '',
  approval_confirmed boolean DEFAULT false,
  total_payroll numeric(15,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_implementation_reports_report_id ON implementation_reports(report_id);

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  jurisdiction_id text,
  is_admin boolean DEFAULT false,
  role text DEFAULT 'User',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_jurisdiction_id ON user_profiles(jurisdiction_id);

-- =====================================================
-- SUPPORTING TABLES
-- =====================================================

-- Submission Checklists table
CREATE TABLE IF NOT EXISTS submission_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  job_evaluation_complete boolean DEFAULT false,
  jobs_data_entered boolean DEFAULT false,
  benefits_evaluated boolean DEFAULT false,
  compliance_reviewed boolean DEFAULT false,
  implementation_form_complete boolean DEFAULT false,
  governing_body_approved boolean DEFAULT false,
  total_payroll_entered boolean DEFAULT false,
  official_notice_posted boolean DEFAULT false,
  all_validations_passed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_checklists_report_id ON submission_checklists(report_id);

-- Benefits Worksheets table
CREATE TABLE IF NOT EXISTS benefits_worksheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  lowest_points integer NOT NULL DEFAULT 0,
  highest_points integer NOT NULL DEFAULT 0,
  point_range integer NOT NULL DEFAULT 0,
  comparable_value_range integer NOT NULL DEFAULT 0,
  trigger_detected boolean DEFAULT false,
  trigger_explanation text,
  benefits_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_benefits_worksheets_report_id ON benefits_worksheets(report_id);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  user_email text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_jurisdiction_id ON audit_logs(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_report_id ON audit_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_jurisdiction_id ON notes(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_notes_report_id ON notes(report_id);

-- Report Notes table
CREATE TABLE IF NOT EXISTS report_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_notes_report_id ON report_notes(report_id);

-- Email Templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email History table
CREATE TABLE IF NOT EXISTS email_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sent_by text,
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_history_jurisdiction_id ON email_history(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_email_history_report_id ON email_history(report_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits_worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- Jurisdictions policies
CREATE POLICY "Authenticated users can view all jurisdictions"
  ON jurisdictions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anonymous users can read jurisdictions for login"
  ON jurisdictions FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated users can insert jurisdictions"
  ON jurisdictions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update all jurisdictions"
  ON jurisdictions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete jurisdictions"
  ON jurisdictions FOR DELETE TO authenticated USING (true);

-- Contacts policies
CREATE POLICY "Authenticated users can view all contacts"
  ON contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert contacts"
  ON contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update all contacts"
  ON contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
  ON contacts FOR DELETE TO authenticated USING (true);

-- Reports policies
CREATE POLICY "Authenticated users can view all reports"
  ON reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert reports"
  ON reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update reports"
  ON reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reports"
  ON reports FOR DELETE TO authenticated USING (true);

-- Job Classifications policies
CREATE POLICY "Authenticated users can view all job classifications"
  ON job_classifications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert job classifications"
  ON job_classifications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update job classifications"
  ON job_classifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete job classifications"
  ON job_classifications FOR DELETE TO authenticated USING (true);

-- Implementation Reports policies
CREATE POLICY "Authenticated users can view all implementation reports"
  ON implementation_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert implementation reports"
  ON implementation_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update implementation reports"
  ON implementation_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete implementation reports"
  ON implementation_reports FOR DELETE TO authenticated USING (true);

-- User Profiles policies (restricted to own profile and admins)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_admin = true);

CREATE POLICY "Service role can insert user profiles"
  ON user_profiles FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR is_admin = true)
  WITH CHECK (auth.uid() = user_id OR is_admin = true);

-- Submission Checklists policies
CREATE POLICY "Authenticated users can manage submission checklists"
  ON submission_checklists FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Benefits Worksheets policies
CREATE POLICY "Authenticated users can manage benefits worksheets"
  ON benefits_worksheets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Audit Logs policies
CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Notes policies
CREATE POLICY "Authenticated users can manage notes"
  ON notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Report Notes policies
CREATE POLICY "Authenticated users can manage report notes"
  ON report_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email Templates policies
CREATE POLICY "Authenticated users can view email templates"
  ON email_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage email templates"
  ON email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Email History policies
CREATE POLICY "Authenticated users can view email history"
  ON email_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert email history"
  ON email_history FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample jurisdictions
INSERT INTO jurisdictions (jurisdiction_id, name, address, city, state, zipcode, phone, fax, jurisdiction_type, next_report_year, follow_up_type, follow_up_date)
VALUES 
  ('12345', 'Minneapolis', '350 South 5th Street', 'Minneapolis', 'MN', '55415', '612-673-3000', '612-673-3100', 'City', 2024, 'Annual Review', '2024-12-31'),
  ('67890', 'Saint Paul', '390 City Hall', 'Saint Paul', 'MN', '55102', '651-266-8500', '651-266-8510', 'City', 2024, 'Quarterly Check', '2024-09-30')
ON CONFLICT (jurisdiction_id) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (jurisdiction_id, name, title, is_primary, email, phone)
SELECT 
  j.id, 'John Smith', 'HR Director', true, 'john.smith@minneapolis.gov', '612-673-2000'
FROM jurisdictions j WHERE j.jurisdiction_id = '12345'
ON CONFLICT DO NOTHING;

INSERT INTO contacts (jurisdiction_id, name, title, is_primary, email, phone)
SELECT 
  j.id, 'Jane Doe', 'Compensation Analyst', false, 'jane.doe@minneapolis.gov', '612-673-2001'
FROM jurisdictions j WHERE j.jurisdiction_id = '12345'
ON CONFLICT DO NOTHING;

INSERT INTO contacts (jurisdiction_id, name, title, is_primary, email, phone)
SELECT 
  j.id, 'Michael Johnson', 'City HR Manager', true, 'michael.johnson@stpaul.gov', '651-266-8600'
FROM jurisdictions j WHERE j.jurisdiction_id = '67890'
ON CONFLICT DO NOTHING;