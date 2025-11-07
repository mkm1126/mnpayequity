/*
  # Add Comprehensive Test Data for 20 Jurisdictions

  ## Overview
  Creates realistic test data for 20 jurisdictions with reports for 2022 and 2025,
  including job classifications with varying compliance scenarios.
*/

-- Insert 20 jurisdictions
INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES
('12345', 'Minneapolis', 'City', 'Minneapolis', 'MN', '55401', '612-673-2345', '350 S 5th St', now(), now()),
('67890', 'Saint Paul', 'City', 'Saint Paul', 'MN', '55102', '651-266-8989', '15 W Kellogg Blvd', now(), now()),
('54321', 'Bloomington', 'City', 'Bloomington', 'MN', '55431', '952-563-8900', '1800 W Old Shakopee Rd', now(), now()),
('98765', 'Rochester', 'City', 'Rochester', 'MN', '55901', '507-328-2500', '201 4th St SE', now(), now()),
('11111', 'Duluth', 'City', 'Duluth', 'MN', '55802', '218-730-5000', '411 W 1st St', now(), now()),
('22222', 'Hennepin County', 'County', 'Minneapolis', 'MN', '55487', '612-348-3000', '300 S 6th St', now(), now()),
('33333', 'Ramsey County', 'County', 'Saint Paul', 'MN', '55101', '651-266-2000', '15 W Kellogg Blvd', now(), now()),
('44444', 'Dakota County', 'County', 'Hastings', 'MN', '55033', '651-438-4300', '1590 Highway 55', now(), now()),
('55555', 'Anoka County', 'County', 'Anoka', 'MN', '55303', '763-323-5000', '2100 3rd Ave', now(), now()),
('66666', 'Washington County', 'County', 'Stillwater', 'MN', '55082', '651-430-6001', '14949 62nd St N', now(), now()),
('77777', 'Minneapolis Public Schools', 'School District', 'Minneapolis', 'MN', '55413', '612-668-0000', '1250 W Broadway Ave', now(), now()),
('88888', 'Saint Paul Public Schools', 'School District', 'Saint Paul', 'MN', '55103', '651-767-8100', '360 Colborne St', now(), now()),
('99999', 'Anoka-Hennepin Schools', 'School District', 'Coon Rapids', 'MN', '55433', '763-506-1000', '11299 Hanson Blvd NW', now(), now()),
('10001', 'Edina', 'City', 'Edina', 'MN', '55424', '952-927-8861', '4801 W 50th St', now(), now()),
('10002', 'Eden Prairie', 'City', 'Eden Prairie', 'MN', '55344', '952-949-8300', '8080 Mitchell Rd', now(), now()),
('10003', 'Minnetonka', 'City', 'Minnetonka', 'MN', '55345', '952-939-8200', '14600 Minnetonka Blvd', now(), now()),
('10004', 'St. Cloud', 'City', 'St. Cloud', 'MN', '56301', '320-650-2900', '400 2nd St S', now(), now()),
('10005', 'Burnsville', 'City', 'Burnsville', 'MN', '55337', '952-895-4400', '100 Civic Center Pkwy', now(), now()),
('10006', 'Coon Rapids', 'City', 'Coon Rapids', 'MN', '55433', '763-767-6400', '11155 Robinson Dr NW', now(), now()),
('10007', 'Eagan', 'City', 'Eagan', 'MN', '55121', '651-675-5000', '3830 Pilot Knob Rd', now(), now())
ON CONFLICT (jurisdiction_id) DO UPDATE SET name = EXCLUDED.name, updated_at = now();

-- Insert contacts
INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id,
  CASE j.jurisdiction_id 
    WHEN '12345' THEN 'Sarah Johnson' WHEN '67890' THEN 'Michael Chen'
    WHEN '54321' THEN 'Jennifer Martinez' WHEN '98765' THEN 'David Anderson'
    WHEN '11111' THEN 'Emily Thompson' WHEN '22222' THEN 'Robert Wilson'
    WHEN '33333' THEN 'Lisa Brown' WHEN '44444' THEN 'James Taylor'
    WHEN '55555' THEN 'Patricia Davis' WHEN '66666' THEN 'Christopher Miller'
    WHEN '77777' THEN 'Karen White' WHEN '88888' THEN 'Steven Garcia'
    WHEN '99999' THEN 'Michelle Rodriguez' WHEN '10001' THEN 'Daniel Lee'
    WHEN '10002' THEN 'Amanda Harris' WHEN '10003' THEN 'Thomas Clark'
    WHEN '10004' THEN 'Jessica Lewis' WHEN '10005' THEN 'Ryan Walker'
    WHEN '10006' THEN 'Nicole Hall' ELSE 'Kevin Young'
  END,
  'HR Director',
  'hr@' || lower(replace(j.name, ' ', '')) || '.gov',
  j.phone, true, now(), now()
FROM jurisdictions j
ON CONFLICT DO NOTHING;

-- Create reports for 2022 and 2025
INSERT INTO reports (jurisdiction_id, report_year, case_number, case_description, case_status, compliance_status, submitted_at, created_at, updated_at)
SELECT 
  j.id, 2022, 1, 'FY 2022 Pay Equity Analysis',
  CASE WHEN random() < 0.3 THEN 'draft' WHEN random() < 0.6 THEN 'in_progress' ELSE 'submitted' END,
  CASE WHEN random() < 0.3 THEN 'non_compliant' WHEN random() < 0.85 THEN 'compliant' ELSE 'needs_review' END,
  now() - interval '90 days', now() - interval '120 days', now() - interval '90 days'
FROM jurisdictions j;

INSERT INTO reports (jurisdiction_id, report_year, case_number, case_description, case_status, compliance_status, submitted_at, created_at, updated_at)
SELECT 
  j.id, 2025, 1, 'FY 2025 Pay Equity Analysis',
  CASE WHEN random() < 0.4 THEN 'draft' WHEN random() < 0.7 THEN 'in_progress' ELSE 'submitted' END,
  CASE WHEN random() < 0.35 THEN 'non_compliant' WHEN random() < 0.80 THEN 'compliant' ELSE 'needs_review' END,
  CASE WHEN random() > 0.5 THEN now() - interval '10 days' ELSE NULL END,
  now() - interval '30 days', now() - interval '5 days'
FROM jurisdictions j;

-- Add second case for some jurisdictions
INSERT INTO reports (jurisdiction_id, report_year, case_number, case_description, case_status, compliance_status, created_at, updated_at)
SELECT j.id, 2025, 2, 'Public Safety Review', 'in_progress', 'needs_review',
  now() - interval '15 days', now() - interval '3 days'
FROM jurisdictions j WHERE random() < 0.4;

-- Add jobs with correct precision
DO $$
DECLARE
  rep RECORD;
  titles text[] := ARRAY['Admin Assistant', 'Accountant', 'Attorney', 'Inspector',
    'Clerk', 'Engineer', 'Communications Spec', 'DBA', 'Electrician', 'EM Manager',
    'Finance Director', 'Fire Chief', 'GIS Analyst', 'HR Specialist', 'IT Manager',
    'Librarian', 'Maintenance', 'Park Supervisor', 'Planner', 'Police Officer'];
  i int;
BEGIN
  FOR rep IN SELECT id FROM reports LOOP
    FOR i IN 1..6 LOOP
      INSERT INTO job_classifications (
        report_id, job_number, title, males, females, points,
        min_salary, max_salary, years_to_max, years_service_pay,
        benefits_included_in_salary, is_part_time, hours_per_week,
        days_per_year, additional_cash_compensation, created_at, updated_at
      ) VALUES (
        rep.id, i,
        titles[1 + floor(random() * 20)::int],
        2 + floor(random() * 12)::int,
        2 + floor(random() * 12)::int,
        100 + floor(random() * 350)::int,
        round((42000 + random() * 50000)::numeric, 2),
        round((78000 + random() * 60000)::numeric, 2),
        round((5 + random() * 10)::numeric, 2),
        round((random() * 50)::numeric, 2),
        round((random() * 2800)::numeric, 2),
        random() < 0.12, 40.00, 260,
        round((random() * 2200)::numeric, 2),
        now(), now()
      );
    END LOOP;
  END LOOP;
END $$;