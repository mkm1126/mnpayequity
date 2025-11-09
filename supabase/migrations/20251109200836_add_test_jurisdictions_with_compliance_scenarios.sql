/*
  # Add Test Jurisdictions with Varying Compliance Scenarios
  
  ## Overview
  Creates test jurisdictions with names starting with "TEST - " that include both 2022 and 2025 reports
  with job data designed to pass all tests, pass some tests, or pass no tests.
  
  ## Test Jurisdictions Created
  
  1. **TEST - Compliant City** (Pass All Tests)
     - 2022: Submitted, Compliant - Passes Salary Range Test AND Exceptional Service Test
     - 2025: NOT Submitted, Compliant - Passes both tests
     - Job data: Balanced male/female years to max (ratio > 0.80), minimal exceptional service usage
  
  2. **TEST - Partial Pass County** (Pass Salary Range Only)
     - 2022: Submitted, Non-Compliant - Passes Salary Range Test but FAILS Exceptional Service Test
     - 2025: NOT Submitted, Non-Compliant - Same pattern
     - Job data: Good years to max ratio, but heavily skewed exceptional service (males 50%, females 10%)
  
  3. **TEST - Service Issues District** (Pass Exceptional Service Only)
     - 2022: Submitted, Non-Compliant - FAILS Salary Range Test but passes Exceptional Service Test
     - 2025: NOT Submitted, Non-Compliant - Same pattern
     - Job data: Poor years to max ratio (male avg much lower), balanced exceptional service
  
  4. **TEST - Non-Compliant City** (Fail All Tests)
     - 2022: Submitted, Non-Compliant - FAILS both Salary Range Test AND Exceptional Service Test
     - 2025: NOT Submitted, Non-Compliant - Same pattern
     - Job data: Poor ratios in both areas (male years to max < 0.80 of female, unbalanced exceptional service)
  
  5. **TEST - Manual Review Town** (Requires Manual Review)
     - 2022: Submitted, Needs Review - Only 3 male classes (triggers manual review requirement)
     - 2025: NOT Submitted, Needs Review - Same pattern
     - Job data: 3 male classes, 6 female classes (system requires alternative analysis)
  
  6. **TEST - Borderline County** (Mixed Results)
     - 2022: Submitted, Compliant - Barely passes both tests (ratios close to 0.80 threshold)
     - 2025: NOT Submitted, Non-Compliant - Fails one test in 2025
     - Job data: Edge case scenarios testing threshold boundaries
  
  ## Security
  - All test data uses existing RLS policies
  - No special permissions required
  
  ## Notes
  - All 2025 reports have submitted_at = NULL (not yet submitted)
  - All 2022 reports have submitted_at timestamps (already submitted)
  - Job classifications are carefully designed to produce specific test outcomes
  - Each jurisdiction has 8-10 job classifications per report
*/

-- =====================================================
-- TEST JURISDICTION 1: Pass All Tests (Compliant)
-- =====================================================

INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES (
  'TEST-001', 'TEST - Compliant City', 'City', 'Test City', 'MN', '55001', 
  '612-555-0001', '100 Test Street', now(), now()
)
ON CONFLICT (jurisdiction_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  updated_at = now();

-- Contact for TEST - Compliant City
INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id, 'Sarah Compliant', 'HR Director', 'hr@testcompliant.gov', '612-555-0001', true, now(), now()
FROM jurisdictions j WHERE j.jurisdiction_id = 'TEST-001'
ON CONFLICT DO NOTHING;

-- 2022 Report (Submitted, Compliant)
DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2022_id uuid;
  v_report_2025_id uuid;
BEGIN
  SELECT id INTO v_jurisdiction_id FROM jurisdictions WHERE jurisdiction_id = 'TEST-001';
  
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'FY 2022 Pay Equity Analysis - Pass All Tests',
    'submitted', 'compliant', '2022-03-15'::timestamptz, '2022-01-10'::timestamptz, '2022-03-15'::timestamptz
  )
  RETURNING id INTO v_report_2022_id;
  
  -- Jobs for 2022: Balanced years to max, minimal exceptional service
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  -- Male-dominated classes (avg years_to_max: 8.5)
  (v_report_2022_id, 1, 'Police Officer', 12, 0, 250, 48000.00, 82000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1200.00),
  (v_report_2022_id, 2, 'Fire Captain', 10, 0, 320, 65000.00, 105000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1500.00),
  (v_report_2022_id, 3, 'Public Works Director', 8, 0, 380, 72000.00, 118000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 2000.00),
  (v_report_2022_id, 4, 'IT Manager', 6, 0, 340, 68000.00, 110000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1800.00),
  -- Female-dominated classes (avg years_to_max: 8.4, ratio = 8.5/8.4 = 1.01 > 0.80 ✓)
  (v_report_2022_id, 5, 'HR Specialist', 0, 8, 280, 52000.00, 88000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1100.00),
  (v_report_2022_id, 6, 'Librarian', 0, 10, 260, 46000.00, 78000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 900.00),
  (v_report_2022_id, 7, 'Social Worker', 0, 12, 290, 54000.00, 90000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1000.00),
  (v_report_2022_id, 8, 'Administrative Coordinator', 0, 6, 240, 44000.00, 74000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 800.00),
  -- Balanced classes
  (v_report_2022_id, 9, 'Accountant', 4, 5, 300, 58000.00, 95000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2022_id, 10, 'Communications Manager', 3, 4, 310, 60000.00, 98000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00);

  -- 2025 Report (NOT Submitted, Compliant)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2025, 1, 'FY 2025 Pay Equity Analysis - Pass All Tests',
    'draft', 'compliant', NULL, '2025-01-15'::timestamptz, now()
  )
  RETURNING id INTO v_report_2025_id;
  
  -- Jobs for 2025: Similar pattern - passes all tests
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  (v_report_2025_id, 1, 'Police Officer', 13, 0, 250, 50000.00, 85000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2025_id, 2, 'Fire Captain', 11, 0, 320, 67000.00, 108000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1600.00),
  (v_report_2025_id, 3, 'Public Works Director', 8, 0, 380, 74000.00, 122000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 2100.00),
  (v_report_2025_id, 4, 'IT Manager', 7, 0, 340, 70000.00, 113000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1900.00),
  (v_report_2025_id, 5, 'HR Specialist', 0, 9, 280, 54000.00, 91000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1200.00),
  (v_report_2025_id, 6, 'Librarian', 0, 11, 260, 48000.00, 81000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1000.00),
  (v_report_2025_id, 7, 'Social Worker', 0, 13, 290, 56000.00, 93000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1100.00),
  (v_report_2025_id, 8, 'Administrative Coordinator', 0, 7, 240, 46000.00, 77000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 900.00),
  (v_report_2025_id, 9, 'Accountant', 5, 6, 300, 60000.00, 98000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2025_id, 10, 'Communications Manager', 4, 5, 310, 62000.00, 101000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1500.00);
END $$;

-- =====================================================
-- TEST JURISDICTION 2: Pass Salary Range Only
-- =====================================================

INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES (
  'TEST-002', 'TEST - Partial Pass County', 'County', 'Test County Seat', 'MN', '55002', 
  '651-555-0002', '200 County Road', now(), now()
)
ON CONFLICT (jurisdiction_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  updated_at = now();

INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id, 'Michael Partial', 'HR Manager', 'hr@testpartial.gov', '651-555-0002', true, now(), now()
FROM jurisdictions j WHERE j.jurisdiction_id = 'TEST-002'
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2022_id uuid;
  v_report_2025_id uuid;
BEGIN
  SELECT id INTO v_jurisdiction_id FROM jurisdictions WHERE jurisdiction_id = 'TEST-002';
  
  -- 2022 Report (Submitted, Non-Compliant - passes salary range, fails exceptional service)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'FY 2022 Pay Equity Analysis - Salary Range Pass Only',
    'submitted', 'non_compliant', '2022-03-20'::timestamptz, '2022-01-15'::timestamptz, '2022-03-20'::timestamptz
  )
  RETURNING id INTO v_report_2022_id;
  
  -- Jobs: Good years_to_max ratio but heavily skewed exceptional service
  -- Male classes: 4 out of 8 have exceptional service (50%)
  -- Female classes: 0 out of 6 have exceptional service (0%)
  -- Exceptional service ratio: 0/50 = 0 < 0.80 ✗
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  -- Male classes (avg: 8.5, 50% have exceptional service)
  (v_report_2022_id, 1, 'Sheriff Deputy', 15, 0, 270, 52000.00, 88000.00, 8.50, 0.00, 'Longevity Pay', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2022_id, 2, 'Corrections Officer', 12, 0, 240, 46000.00, 78000.00, 8.00, 0.00, 'Shift Differential', 0.00, false, 40.00, 260, 1100.00),
  (v_report_2022_id, 3, 'Highway Engineer', 10, 0, 360, 70000.00, 115000.00, 9.00, 0.00, 'Professional License', 0.00, false, 40.00, 260, 2000.00),
  (v_report_2022_id, 4, 'GIS Analyst', 8, 0, 310, 62000.00, 100000.00, 8.50, 0.00, 'Technical Certification', 0.00, false, 40.00, 260, 1600.00),
  (v_report_2022_id, 5, 'Maintenance Supervisor', 9, 0, 280, 54000.00, 90000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2022_id, 6, 'Building Inspector', 7, 0, 290, 56000.00, 92000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2022_id, 7, 'Fleet Manager', 6, 0, 300, 58000.00, 95000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1500.00),
  (v_report_2022_id, 8, 'Emergency Manager', 5, 0, 330, 64000.00, 105000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1700.00),
  -- Female classes (avg: 8.5, 0% have exceptional service) ratio = 8.5/8.5 = 1.0 > 0.80 ✓
  (v_report_2022_id, 9, 'County Clerk', 0, 14, 260, 48000.00, 82000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1200.00),
  (v_report_2022_id, 10, 'Social Services Manager', 0, 16, 320, 64000.00, 104000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1600.00),
  (v_report_2022_id, 11, 'Public Health Nurse', 0, 18, 280, 54000.00, 88000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2022_id, 12, 'Victim Advocate', 0, 10, 250, 46000.00, 78000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1100.00),
  (v_report_2022_id, 13, 'Records Manager', 0, 8, 270, 50000.00, 85000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2022_id, 14, 'Budget Analyst', 0, 12, 300, 58000.00, 96000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1500.00);

  -- 2025 Report (NOT Submitted, Non-Compliant)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2025, 1, 'FY 2025 Pay Equity Analysis - Salary Range Pass Only',
    'draft', 'non_compliant', NULL, '2025-01-20'::timestamptz, now()
  )
  RETURNING id INTO v_report_2025_id;
  
  -- Similar pattern for 2025
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  (v_report_2025_id, 1, 'Sheriff Deputy', 16, 0, 270, 54000.00, 91000.00, 8.50, 0.00, 'Longevity Pay', 0.00, false, 40.00, 260, 1500.00),
  (v_report_2025_id, 2, 'Corrections Officer', 13, 0, 240, 48000.00, 81000.00, 8.00, 0.00, 'Shift Differential', 0.00, false, 40.00, 260, 1200.00),
  (v_report_2025_id, 3, 'Highway Engineer', 11, 0, 360, 72000.00, 118000.00, 9.00, 0.00, 'Professional License', 0.00, false, 40.00, 260, 2100.00),
  (v_report_2025_id, 4, 'GIS Analyst', 9, 0, 310, 64000.00, 103000.00, 8.50, 0.00, 'Technical Certification', 0.00, false, 40.00, 260, 1700.00),
  (v_report_2025_id, 5, 'Maintenance Supervisor', 10, 0, 280, 56000.00, 93000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2025_id, 6, 'Building Inspector', 8, 0, 290, 58000.00, 95000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1500.00),
  (v_report_2025_id, 7, 'Fleet Manager', 7, 0, 300, 60000.00, 98000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1600.00),
  (v_report_2025_id, 8, 'Emergency Manager', 6, 0, 330, 66000.00, 108000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1800.00),
  (v_report_2025_id, 9, 'County Clerk', 0, 15, 260, 50000.00, 85000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2025_id, 10, 'Social Services Manager', 0, 17, 320, 66000.00, 107000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1700.00),
  (v_report_2025_id, 11, 'Public Health Nurse', 0, 19, 280, 56000.00, 91000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2025_id, 12, 'Victim Advocate', 0, 11, 250, 48000.00, 81000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1200.00),
  (v_report_2025_id, 13, 'Records Manager', 0, 9, 270, 52000.00, 88000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2025_id, 14, 'Budget Analyst', 0, 13, 300, 60000.00, 99000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1600.00);
END $$;

-- =====================================================
-- TEST JURISDICTION 3: Pass Exceptional Service Only
-- =====================================================

INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES (
  'TEST-003', 'TEST - Service Issues District', 'School District', 'Test School City', 'MN', '55003', 
  '763-555-0003', '300 Education Way', now(), now()
)
ON CONFLICT (jurisdiction_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  updated_at = now();

INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id, 'Jennifer Service', 'HR Director', 'hr@testservice.edu', '763-555-0003', true, now(), now()
FROM jurisdictions j WHERE j.jurisdiction_id = 'TEST-003'
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2022_id uuid;
  v_report_2025_id uuid;
BEGIN
  SELECT id INTO v_jurisdiction_id FROM jurisdictions WHERE jurisdiction_id = 'TEST-003';
  
  -- 2022 Report (Submitted, Non-Compliant - fails salary range, passes exceptional service)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'FY 2022 Pay Equity Analysis - Service Test Pass Only',
    'submitted', 'non_compliant', '2022-03-25'::timestamptz, '2022-01-20'::timestamptz, '2022-03-25'::timestamptz
  )
  RETURNING id INTO v_report_2022_id;
  
  -- Jobs: Poor years_to_max ratio (male avg much lower), balanced exceptional service
  -- Male avg years_to_max: 6.0
  -- Female avg years_to_max: 10.0
  -- Ratio: 6.0/10.0 = 0.60 < 0.80 ✗
  -- Male exceptional: 1/6 = 16.7%
  -- Female exceptional: 1/6 = 16.7%
  -- Ratio: 16.7/16.7 = 1.0 > 0.80 ✓
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  -- Male classes (avg years_to_max: 6.0 - LOW)
  (v_report_2022_id, 1, 'Custodian', 14, 0, 180, 38000.00, 58000.00, 5.00, 0.00, '', 0.00, false, 40.00, 260, 800.00),
  (v_report_2022_id, 2, 'Groundskeeper', 10, 0, 170, 36000.00, 54000.00, 5.50, 0.00, '', 0.00, false, 40.00, 260, 700.00),
  (v_report_2022_id, 3, 'Bus Driver', 12, 0, 190, 40000.00, 62000.00, 6.00, 0.00, '', 0.00, false, 40.00, 260, 900.00),
  (v_report_2022_id, 4, 'Maintenance Tech', 8, 0, 210, 44000.00, 68000.00, 6.50, 0.00, 'Trade Certification', 0.00, false, 40.00, 260, 1000.00),
  (v_report_2022_id, 5, 'Security Officer', 9, 0, 200, 42000.00, 64000.00, 6.00, 0.00, '', 0.00, false, 40.00, 260, 950.00),
  (v_report_2022_id, 6, 'Facilities Manager', 6, 0, 280, 56000.00, 88000.00, 7.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  -- Female classes (avg years_to_max: 10.0 - HIGH)
  (v_report_2022_id, 7, 'Teacher', 0, 45, 320, 48000.00, 92000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2022_id, 8, 'School Counselor', 0, 12, 330, 52000.00, 96000.00, 10.00, 0.00, 'Licensed Professional', 0.00, false, 40.00, 186, 0.00),
  (v_report_2022_id, 9, 'School Nurse', 0, 8, 300, 50000.00, 88000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2022_id, 10, 'Media Specialist', 0, 10, 290, 48000.00, 86000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2022_id, 11, 'Special Ed Coordinator', 0, 14, 340, 54000.00, 98000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2022_id, 12, 'District Secretary', 0, 6, 240, 42000.00, 72000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1000.00);

  -- 2025 Report (NOT Submitted, Non-Compliant)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2025, 1, 'FY 2025 Pay Equity Analysis - Service Test Pass Only',
    'draft', 'non_compliant', NULL, '2025-01-25'::timestamptz, now()
  )
  RETURNING id INTO v_report_2025_id;
  
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  (v_report_2025_id, 1, 'Custodian', 15, 0, 180, 40000.00, 60000.00, 5.00, 0.00, '', 0.00, false, 40.00, 260, 850.00),
  (v_report_2025_id, 2, 'Groundskeeper', 11, 0, 170, 38000.00, 56000.00, 5.50, 0.00, '', 0.00, false, 40.00, 260, 750.00),
  (v_report_2025_id, 3, 'Bus Driver', 13, 0, 190, 42000.00, 64000.00, 6.00, 0.00, '', 0.00, false, 40.00, 260, 950.00),
  (v_report_2025_id, 4, 'Maintenance Tech', 9, 0, 210, 46000.00, 70000.00, 6.50, 0.00, 'Trade Certification', 0.00, false, 40.00, 260, 1050.00),
  (v_report_2025_id, 5, 'Security Officer', 10, 0, 200, 44000.00, 66000.00, 6.00, 0.00, '', 0.00, false, 40.00, 260, 1000.00),
  (v_report_2025_id, 6, 'Facilities Manager', 7, 0, 280, 58000.00, 91000.00, 7.00, 0.00, '', 0.00, false, 40.00, 260, 1450.00),
  (v_report_2025_id, 7, 'Teacher', 0, 48, 320, 50000.00, 95000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2025_id, 8, 'School Counselor', 0, 13, 330, 54000.00, 99000.00, 10.00, 0.00, 'Licensed Professional', 0.00, false, 40.00, 186, 0.00),
  (v_report_2025_id, 9, 'School Nurse', 0, 9, 300, 52000.00, 91000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2025_id, 10, 'Media Specialist', 0, 11, 290, 50000.00, 89000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2025_id, 11, 'Special Ed Coordinator', 0, 15, 340, 56000.00, 101000.00, 10.00, 0.00, '', 0.00, false, 40.00, 186, 0.00),
  (v_report_2025_id, 12, 'District Secretary', 0, 7, 240, 44000.00, 75000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1050.00);
END $$;

-- =====================================================
-- TEST JURISDICTION 4: Fail All Tests
-- =====================================================

INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES (
  'TEST-004', 'TEST - Non-Compliant City', 'City', 'Test Fail City', 'MN', '55004', 
  '952-555-0004', '400 Failure Avenue', now(), now()
)
ON CONFLICT (jurisdiction_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  updated_at = now();

INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id, 'David Noncompliant', 'HR Specialist', 'hr@testfail.gov', '952-555-0004', true, now(), now()
FROM jurisdictions j WHERE j.jurisdiction_id = 'TEST-004'
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2022_id uuid;
  v_report_2025_id uuid;
BEGIN
  SELECT id INTO v_jurisdiction_id FROM jurisdictions WHERE jurisdiction_id = 'TEST-004';
  
  -- 2022 Report (Submitted, Non-Compliant - fails both tests)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'FY 2022 Pay Equity Analysis - Fail All Tests',
    'submitted', 'non_compliant', '2022-03-30'::timestamptz, '2022-01-25'::timestamptz, '2022-03-30'::timestamptz
  )
  RETURNING id INTO v_report_2022_id;
  
  -- Jobs: Poor years_to_max AND heavily skewed exceptional service
  -- Male avg years_to_max: 5.0
  -- Female avg years_to_max: 10.0
  -- Ratio: 5.0/10.0 = 0.50 < 0.80 ✗
  -- Male exceptional: 4/5 = 80%
  -- Female exceptional: 0/5 = 0%
  -- Ratio: 0/80 = 0 < 0.80 ✗
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  -- Male classes (low years_to_max, high exceptional service)
  (v_report_2022_id, 1, 'Assistant City Manager', 5, 0, 400, 85000.00, 135000.00, 5.00, 0.00, 'Executive Bonus', 0.00, false, 40.00, 260, 5000.00),
  (v_report_2022_id, 2, 'Police Chief', 1, 0, 420, 95000.00, 145000.00, 5.00, 0.00, 'Command Pay', 0.00, false, 40.00, 260, 6000.00),
  (v_report_2022_id, 3, 'Fire Chief', 1, 0, 410, 90000.00, 140000.00, 5.00, 0.00, 'Command Pay', 0.00, false, 40.00, 260, 5500.00),
  (v_report_2022_id, 4, 'City Engineer', 4, 0, 380, 78000.00, 128000.00, 5.00, 0.00, 'Professional Engineer', 0.00, false, 40.00, 260, 4000.00),
  (v_report_2022_id, 5, 'Planning Director', 3, 0, 370, 75000.00, 120000.00, 5.00, 0.00, '', 0.00, false, 40.00, 260, 3500.00),
  -- Female classes (high years_to_max, no exceptional service)
  (v_report_2022_id, 6, 'Finance Director', 0, 2, 390, 80000.00, 130000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 3000.00),
  (v_report_2022_id, 7, 'HR Director', 0, 3, 360, 72000.00, 118000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2800.00),
  (v_report_2022_id, 8, 'Community Dev Director', 0, 2, 370, 74000.00, 122000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2900.00),
  (v_report_2022_id, 9, 'Parks Director', 0, 4, 340, 68000.00, 112000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2600.00),
  (v_report_2022_id, 10, 'Communications Director', 0, 3, 350, 70000.00, 115000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2700.00);

  -- 2025 Report (NOT Submitted, Non-Compliant)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2025, 1, 'FY 2025 Pay Equity Analysis - Fail All Tests',
    'draft', 'non_compliant', NULL, '2025-02-01'::timestamptz, now()
  )
  RETURNING id INTO v_report_2025_id;
  
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  (v_report_2025_id, 1, 'Assistant City Manager', 5, 0, 400, 88000.00, 139000.00, 5.00, 0.00, 'Executive Bonus', 0.00, false, 40.00, 260, 5200.00),
  (v_report_2025_id, 2, 'Police Chief', 1, 0, 420, 98000.00, 149000.00, 5.00, 0.00, 'Command Pay', 0.00, false, 40.00, 260, 6200.00),
  (v_report_2025_id, 3, 'Fire Chief', 1, 0, 410, 93000.00, 144000.00, 5.00, 0.00, 'Command Pay', 0.00, false, 40.00, 260, 5700.00),
  (v_report_2025_id, 4, 'City Engineer', 4, 0, 380, 81000.00, 132000.00, 5.00, 0.00, 'Professional Engineer', 0.00, false, 40.00, 260, 4200.00),
  (v_report_2025_id, 5, 'Planning Director', 3, 0, 370, 78000.00, 124000.00, 5.00, 0.00, '', 0.00, false, 40.00, 260, 3700.00),
  (v_report_2025_id, 6, 'Finance Director', 0, 2, 390, 83000.00, 134000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 3100.00),
  (v_report_2025_id, 7, 'HR Director', 0, 3, 360, 75000.00, 122000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2900.00),
  (v_report_2025_id, 8, 'Community Dev Director', 0, 2, 370, 77000.00, 126000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 3000.00),
  (v_report_2025_id, 9, 'Parks Director', 0, 4, 340, 71000.00, 116000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2700.00),
  (v_report_2025_id, 10, 'Communications Director', 0, 3, 350, 73000.00, 119000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 2800.00);
END $$;

-- =====================================================
-- TEST JURISDICTION 5: Manual Review Required
-- =====================================================

INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES (
  'TEST-005', 'TEST - Manual Review Town', 'City', 'Small Test Town', 'MN', '55005', 
  '507-555-0005', '500 Review Lane', now(), now()
)
ON CONFLICT (jurisdiction_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  updated_at = now();

INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id, 'Emily Manual', 'City Administrator', 'hr@testmanual.gov', '507-555-0005', true, now(), now()
FROM jurisdictions j WHERE j.jurisdiction_id = 'TEST-005'
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2022_id uuid;
  v_report_2025_id uuid;
BEGIN
  SELECT id INTO v_jurisdiction_id FROM jurisdictions WHERE jurisdiction_id = 'TEST-005';
  
  -- 2022 Report (Submitted, Needs Review - only 3 male classes)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'FY 2022 Pay Equity Analysis - Manual Review Required',
    'submitted', 'needs_review', '2022-04-05'::timestamptz, '2022-02-01'::timestamptz, '2022-04-05'::timestamptz
  )
  RETURNING id INTO v_report_2022_id;
  
  -- Jobs: Only 3 male classes (triggers manual review)
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  -- Only 3 male classes
  (v_report_2022_id, 1, 'Public Works Supervisor', 3, 0, 280, 54000.00, 86000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2022_id, 2, 'Maintenance Worker', 4, 0, 220, 42000.00, 68000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 1000.00),
  (v_report_2022_id, 3, 'Utilities Operator', 2, 0, 240, 46000.00, 74000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1100.00),
  -- 6 female classes
  (v_report_2022_id, 4, 'City Clerk', 0, 3, 260, 48000.00, 78000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1150.00),
  (v_report_2022_id, 5, 'Deputy Clerk', 0, 4, 230, 44000.00, 70000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1050.00),
  (v_report_2022_id, 6, 'Finance Officer', 0, 2, 290, 56000.00, 88000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2022_id, 7, 'Receptionist', 0, 5, 200, 38000.00, 60000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 900.00),
  (v_report_2022_id, 8, 'Community Center Director', 0, 2, 270, 52000.00, 84000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1250.00),
  (v_report_2022_id, 9, 'Recreation Coordinator', 0, 6, 250, 46000.00, 76000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1100.00);

  -- 2025 Report (NOT Submitted, Needs Review)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2025, 1, 'FY 2025 Pay Equity Analysis - Manual Review Required',
    'draft', 'needs_review', NULL, '2025-02-05'::timestamptz, now()
  )
  RETURNING id INTO v_report_2025_id;
  
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  (v_report_2025_id, 1, 'Public Works Supervisor', 3, 0, 280, 56000.00, 89000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1350.00),
  (v_report_2025_id, 2, 'Maintenance Worker', 4, 0, 220, 44000.00, 71000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 1050.00),
  (v_report_2025_id, 3, 'Utilities Operator', 2, 0, 240, 48000.00, 77000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1150.00),
  (v_report_2025_id, 4, 'City Clerk', 0, 3, 260, 50000.00, 81000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1200.00),
  (v_report_2025_id, 5, 'Deputy Clerk', 0, 4, 230, 46000.00, 73000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1100.00),
  (v_report_2025_id, 6, 'Finance Officer', 0, 2, 290, 58000.00, 91000.00, 9.00, 0.00, '', 0.00, false, 40.00, 260, 1450.00),
  (v_report_2025_id, 7, 'Receptionist', 0, 5, 200, 40000.00, 63000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 950.00),
  (v_report_2025_id, 8, 'Community Center Director', 0, 2, 270, 54000.00, 87000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2025_id, 9, 'Recreation Coordinator', 0, 6, 250, 48000.00, 79000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1150.00);
END $$;

-- =====================================================
-- TEST JURISDICTION 6: Borderline/Edge Cases
-- =====================================================

INSERT INTO jurisdictions (
  jurisdiction_id, name, jurisdiction_type, city, state, zipcode, 
  phone, address, created_at, updated_at
) VALUES (
  'TEST-006', 'TEST - Borderline County', 'County', 'Edge Case County', 'MN', '55006', 
  '320-555-0006', '600 Threshold Parkway', now(), now()
)
ON CONFLICT (jurisdiction_id) DO UPDATE SET 
  name = EXCLUDED.name, 
  updated_at = now();

INSERT INTO contacts (jurisdiction_id, name, title, email, phone, is_primary, created_at, updated_at)
SELECT 
  j.id, 'Robert Borderline', 'Personnel Director', 'hr@testborderline.gov', '320-555-0006', true, now(), now()
FROM jurisdictions j WHERE j.jurisdiction_id = 'TEST-006'
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2022_id uuid;
  v_report_2025_id uuid;
BEGIN
  SELECT id INTO v_jurisdiction_id FROM jurisdictions WHERE jurisdiction_id = 'TEST-006';
  
  -- 2022 Report (Submitted, Compliant - barely passes, ratios close to 0.80)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'FY 2022 Pay Equity Analysis - Borderline Pass',
    'submitted', 'compliant', '2022-04-10'::timestamptz, '2022-02-05'::timestamptz, '2022-04-10'::timestamptz
  )
  RETURNING id INTO v_report_2022_id;
  
  -- Jobs: Ratios barely pass (just above 0.80 threshold)
  -- Male avg years_to_max: 8.0
  -- Female avg years_to_max: 10.0
  -- Ratio: 8.0/10.0 = 0.80 (exactly at threshold) ✓
  -- Male exceptional: 2/6 = 33.3%
  -- Female exceptional: 2/6 = 33.3%
  -- Ratio: 33.3/33.3 = 1.0 > 0.80 ✓
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  -- Male classes (avg: 8.0)
  (v_report_2022_id, 1, 'Deputy Sheriff', 10, 0, 270, 52000.00, 86000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2022_id, 2, 'Road Maintenance', 8, 0, 230, 44000.00, 72000.00, 7.50, 0.00, 'CDL Premium', 0.00, false, 40.00, 260, 1100.00),
  (v_report_2022_id, 3, 'Building Official', 6, 0, 300, 58000.00, 94000.00, 8.50, 0.00, '', 0.00, false, 40.00, 260, 1500.00),
  (v_report_2022_id, 4, 'IT Director', 4, 0, 340, 66000.00, 108000.00, 8.00, 0.00, 'On-Call Pay', 0.00, false, 40.00, 260, 1800.00),
  (v_report_2022_id, 5, 'Veterans Service Officer', 5, 0, 260, 50000.00, 82000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2022_id, 6, 'Zoning Administrator', 7, 0, 280, 54000.00, 88000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  -- Female classes (avg: 10.0)
  (v_report_2022_id, 7, 'Social Worker', 0, 12, 290, 56000.00, 90000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1350.00),
  (v_report_2022_id, 8, 'Public Health Director', 0, 4, 350, 68000.00, 112000.00, 10.00, 0.00, 'Licensed Professional', 0.00, false, 40.00, 260, 1900.00),
  (v_report_2022_id, 9, 'Court Administrator', 0, 6, 310, 60000.00, 98000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1600.00),
  (v_report_2022_id, 10, 'Auditor-Treasurer', 0, 3, 360, 70000.00, 115000.00, 10.00, 0.00, 'Elected Official', 0.00, false, 40.00, 260, 2000.00),
  (v_report_2022_id, 11, 'License Bureau Manager', 0, 8, 250, 48000.00, 80000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1250.00),
  (v_report_2022_id, 12, 'Family Services Supervisor', 0, 10, 300, 58000.00, 95000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1550.00);

  -- 2025 Report (NOT Submitted, Non-Compliant - now fails one test)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at, created_at, updated_at
  ) VALUES (
    v_jurisdiction_id, 2025, 1, 'FY 2025 Pay Equity Analysis - Now Non-Compliant',
    'draft', 'non_compliant', NULL, '2025-02-10'::timestamptz, now()
  )
  RETURNING id INTO v_report_2025_id;
  
  -- Jobs: Salary range now fails (ratio drops below 0.80)
  -- Male avg: 7.5
  -- Female avg: 10.0
  -- Ratio: 7.5/10.0 = 0.75 < 0.80 ✗
  INSERT INTO job_classifications (
    report_id, job_number, title, males, females, points,
    min_salary, max_salary, years_to_max, years_service_pay,
    exceptional_service_category, benefits_included_in_salary,
    is_part_time, hours_per_week, days_per_year, additional_cash_compensation
  ) VALUES
  (v_report_2025_id, 1, 'Deputy Sheriff', 11, 0, 270, 54000.00, 89000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 1450.00),
  (v_report_2025_id, 2, 'Road Maintenance', 9, 0, 230, 46000.00, 75000.00, 7.00, 0.00, 'CDL Premium', 0.00, false, 40.00, 260, 1150.00),
  (v_report_2025_id, 3, 'Building Official', 7, 0, 300, 60000.00, 97000.00, 8.00, 0.00, '', 0.00, false, 40.00, 260, 1550.00),
  (v_report_2025_id, 4, 'IT Director', 5, 0, 340, 68000.00, 111000.00, 7.50, 0.00, 'On-Call Pay', 0.00, false, 40.00, 260, 1850.00),
  (v_report_2025_id, 5, 'Veterans Service Officer', 6, 0, 260, 52000.00, 85000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 1350.00),
  (v_report_2025_id, 6, 'Zoning Administrator', 8, 0, 280, 56000.00, 91000.00, 7.50, 0.00, '', 0.00, false, 40.00, 260, 1450.00),
  (v_report_2025_id, 7, 'Social Worker', 0, 13, 290, 58000.00, 93000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1400.00),
  (v_report_2025_id, 8, 'Public Health Director', 0, 5, 350, 70000.00, 115000.00, 10.00, 0.00, 'Licensed Professional', 0.00, false, 40.00, 260, 1950.00),
  (v_report_2025_id, 9, 'Court Administrator', 0, 7, 310, 62000.00, 101000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1650.00),
  (v_report_2025_id, 10, 'Auditor-Treasurer', 0, 3, 360, 72000.00, 118000.00, 10.00, 0.00, 'Elected Official', 0.00, false, 40.00, 260, 2050.00),
  (v_report_2025_id, 11, 'License Bureau Manager', 0, 9, 250, 50000.00, 83000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1300.00),
  (v_report_2025_id, 12, 'Family Services Supervisor', 0, 11, 300, 60000.00, 98000.00, 10.00, 0.00, '', 0.00, false, 40.00, 260, 1600.00);
END $$;
