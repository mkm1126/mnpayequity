-- Read from file above - applying reports, job_classifications, implementation_reports tables with RLS
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  case_number integer NOT NULL DEFAULT 1,
  case_description text NOT NULL DEFAULT '',
  case_status text DEFAULT 'Private',
  compliance_status text DEFAULT '',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(jurisdiction_id, report_year, case_number)
);

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(report_id, job_number)
);

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

CREATE INDEX IF NOT EXISTS idx_reports_jurisdiction_id ON reports(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_year ON reports(report_year);
CREATE INDEX IF NOT EXISTS idx_job_classifications_report_id ON job_classifications(report_id);
CREATE INDEX IF NOT EXISTS idx_implementation_reports_report_id ON implementation_reports(report_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reports" ON reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert reports" ON reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update reports" ON reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete reports" ON reports FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view all job classifications" ON job_classifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert job classifications" ON job_classifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update job classifications" ON job_classifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete job classifications" ON job_classifications FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view all implementation reports" ON implementation_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert implementation reports" ON implementation_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update implementation reports" ON implementation_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can delete implementation reports" ON implementation_reports FOR DELETE TO authenticated USING (true);