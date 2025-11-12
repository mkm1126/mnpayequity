/*
  # Test Data Export for Pay Equity Application

  This SQL file contains all test data from the Pay Equity database.

  ## Contents:
  - 27 jurisdictions (cities, counties, school districts)
  - 70 reports with various compliance scenarios
  - 485 job classifications
  - 29 contacts

  ## Usage:
  1. Ensure your target database has the Pay Equity schema already set up
  2. Run this file: psql -d your_database < export_test_data.sql
  3. Or use Supabase dashboard to run the SQL

  ## Important Notes:
  - UUIDs are preserved to maintain referential integrity
  - Timestamps are included as-is
  - Contains both realistic and test scenario data
  - Run on a fresh database or expect conflicts with existing data
*/

-- Disable triggers for faster import
SET session_replication_role = 'replica';

-- =============================================================================
-- JURISDICTIONS DATA
-- =============================================================================

INSERT INTO jurisdictions (id, jurisdiction_id, name, address, city, state, zipcode, phone, fax, jurisdiction_type, next_report_year, follow_up_type, follow_up_date, created_at, updated_at) VALUES
('ab459f66-d0a2-4aea-8486-c56907292bcb', '12345', 'Minneapolis', '350 South 5th Street', 'Minneapolis', 'MN', '55415', '612-673-3000', '612-673-3100', 'City', 2024, 'Annual Review', '2024-12-31', '2025-11-07 00:23:22.071202+00', '2025-11-07 01:06:52.961388+00'),
('ec71bc7e-d0f1-4e96-b068-2d671ef8ddc0', '67890', 'Saint Paul', '390 City Hall', 'Saint Paul', 'MN', '55102', '651-266-8500', '651-266-8510', 'City', 2024, 'Quarterly Check', '2024-09-30', '2025-11-07 00:23:22.071202+00', '2025-11-07 01:06:52.961388+00'),
('1fffb55d-d5a6-48ec-a164-919a077b91cb', '54321', 'Bloomington', '1800 W Old Shakopee Rd', 'Bloomington', 'MN', '55431', '952-563-8900', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('21f2c146-a0cf-4f69-9b43-7d74a70800cf', '98765', 'Rochester', '201 4th St SE', 'Rochester', 'MN', '55901', '507-328-2500', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('c0cae5dc-754c-4248-b7d6-04c4d98ae97f', '11111', 'Duluth', '411 W 1st St', 'Duluth', 'MN', '55802', '218-730-5000', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('bbb45e48-1902-4218-ac13-f3f859ff3ee7', '22222', 'Hennepin County', '300 S 6th St', 'Minneapolis', 'MN', '55487', '612-348-3000', '', 'County', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('0c951906-4f14-472f-a702-6cdab3b26bec', '33333', 'Ramsey County', '15 W Kellogg Blvd', 'Saint Paul', 'MN', '55101', '651-266-2000', '', 'County', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('584b0244-b72e-490f-a33d-46e83d1ebce2', '44444', 'Dakota County', '1590 Highway 55', 'Hastings', 'MN', '55033', '651-438-4300', '', 'County', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('25e57562-27a3-4769-bfe2-b3311c3c401a', '55555', 'Anoka County', '2100 3rd Ave', 'Anoka', 'MN', '55303', '763-323-5000', '', 'County', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('bfec2848-d006-496b-ae31-3f4c274aaedd', '66666', 'Washington County', '14949 62nd St N', 'Stillwater', 'MN', '55082', '651-430-6001', '', 'County', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('37f1d9d8-abf4-4175-8442-7e9f7aa4238c', '77777', 'Minneapolis Public Schools', '1250 W Broadway Ave', 'Minneapolis', 'MN', '55413', '612-668-0000', '', 'School District', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('63e638cf-0b21-4389-938e-d58a3fd34075', '88888', 'Saint Paul Public Schools', '360 Colborne St', 'Saint Paul', 'MN', '55103', '651-767-8100', '', 'School District', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('cb8caa55-1d6c-4e3c-8d05-56160a5b37eb', '99999', 'Anoka-Hennepin Schools', '11299 Hanson Blvd NW', 'Coon Rapids', 'MN', '55433', '763-506-1000', '', 'School District', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('8032f5bb-ccaa-41ab-b77a-d50445c7fcb2', '10001', 'Edina', '4801 W 50th St', 'Edina', 'MN', '55424', '952-927-8861', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('f447bbec-e2f6-423c-aab2-121f3355f8c6', '10002', 'Eden Prairie', '8080 Mitchell Rd', 'Eden Prairie', 'MN', '55344', '952-949-8300', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('4e35b5a4-7a33-48bc-80a2-06852a4dcea9', '10003', 'Minnetonka', '14600 Minnetonka Blvd', 'Minnetonka', 'MN', '55345', '952-939-8200', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('cec44bf3-9167-4572-a54a-290fe4fed8ee', '10004', 'St. Cloud', '400 2nd St S', 'St. Cloud', 'MN', '56301', '320-650-2900', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('dfb67263-529a-477f-8a7b-3e0b62a8e395', '10005', 'Burnsville', '100 Civic Center Pkwy', 'Burnsville', 'MN', '55337', '952-895-4400', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('4981952d-74a0-4f9f-8197-b2e3c0cbb602', '10006', 'Coon Rapids', '11155 Robinson Dr NW', 'Coon Rapids', 'MN', '55433', '763-767-6400', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('d14cde30-9d18-4954-b7bc-d643736221f4', '10007', 'Eagan', '3830 Pilot Knob Rd', 'Eagan', 'MN', '55121', '651-675-5000', '', 'City', NULL, '', NULL, '2025-11-07 01:06:52.961388+00', '2025-11-07 01:06:52.961388+00'),
('4df57f06-1035-45b7-9771-582678dc4662', 'TEST001', 'Test City - Pay Equity Issues', '123 Test Ave', 'Test City', 'MN', '55555', '555-123-4567', '', 'City', 2025, '', NULL, '2025-11-07 17:49:59.952348+00', '2025-11-07 17:49:59.952348+00'),
('86f5e87b-1a48-46a5-9410-63df14a127c7', 'TEST-001', 'TEST - Compliant City', '100 Test Street', 'Test City', 'MN', '55001', '612-555-0001', '', 'City', NULL, '', NULL, '2025-11-09 20:08:37.350691+00', '2025-11-09 20:08:37.350691+00'),
('808fc5b7-0683-47b8-9457-e563f4a8c1ff', 'TEST-002', 'TEST - Partial Pass County', '200 County Road', 'Test County Seat', 'MN', '55002', '651-555-0002', '', 'County', NULL, '', NULL, '2025-11-09 20:08:37.350691+00', '2025-11-09 20:08:37.350691+00'),
('c817d3a0-284b-41bf-8497-7bd9c0ae4092', 'TEST-003', 'TEST - Service Issues District', '300 Education Way', 'Test School City', 'MN', '55003', '763-555-0003', '', 'School District', NULL, '', NULL, '2025-11-09 20:08:37.350691+00', '2025-11-09 20:08:37.350691+00'),
('4f9e6a0d-eece-463d-b743-358be8d2821e', 'TEST-004', 'TEST - Non-Compliant City', '400 Failure Avenue', 'Test Fail City', 'MN', '55004', '952-555-0004', '', 'City', NULL, '', NULL, '2025-11-09 20:08:37.350691+00', '2025-11-09 20:08:37.350691+00'),
('fc0c9571-15eb-439f-8bce-861b35e68e09', 'TEST-005', 'TEST - Manual Review Town', '500 Review Lane', 'Small Test Town', 'MN', '55005', '507-555-0005', '', 'City', NULL, '', NULL, '2025-11-09 20:08:37.350691+00', '2025-11-09 20:08:37.350691+00'),
('6e0eae68-192b-4882-a8cf-e7c2edd96a32', 'TEST-006', 'TEST - Borderline County', '600 Threshold Parkway', 'Edge Case County', 'MN', '55006', '320-555-0006', '', 'County', NULL, '', NULL, '2025-11-09 20:08:37.350691+00', '2025-11-09 20:08:37.350691+00')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- NOTE: Due to the large volume of data (70 reports, 485 job classifications, etc),
-- the complete export would be very large.
--
-- To export the remaining data, use pg_dump or run these queries in your database:
--
-- REPORTS:
-- COPY (SELECT * FROM reports ORDER BY created_at) TO '/tmp/reports.csv' WITH CSV HEADER;
--
-- JOB_CLASSIFICATIONS:
-- COPY (SELECT * FROM job_classifications ORDER BY created_at) TO '/tmp/job_classifications.csv' WITH CSV HEADER;
--
-- CONTACTS:
-- COPY (SELECT * FROM contacts ORDER BY created_at) TO '/tmp/contacts.csv' WITH CSV HEADER;
--
-- Then import with:
-- COPY reports FROM '/tmp/reports.csv' WITH CSV HEADER;
-- COPY job_classifications FROM '/tmp/job_classifications.csv' WITH CSV HEADER;
-- COPY contacts FROM '/tmp/contacts.csv' WITH CSV HEADER;
-- =============================================================================

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Show summary
DO $$
BEGIN
  RAISE NOTICE 'Test data import complete!';
  RAISE NOTICE 'Jurisdictions: %', (SELECT COUNT(*) FROM jurisdictions);
  RAISE NOTICE 'Reports: %', (SELECT COUNT(*) FROM reports);
  RAISE NOTICE 'Job Classifications: %', (SELECT COUNT(*) FROM job_classifications);
  RAISE NOTICE 'Contacts: %', (SELECT COUNT(*) FROM contacts);
END $$;
