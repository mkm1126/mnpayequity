/*
  # Test Data Export
  
  This migration contains all test data from the Pay Equity database.
  It includes:
  - 27 jurisdictions (cities, counties, school districts)
  - 70 reports with various compliance scenarios
  - 485 job classifications
  - 29 contacts
  
  ## Usage
  Run this migration on a new database that already has the schema set up.
  This will populate it with test data for development and testing.
  
  ## Important Notes
  - UUIDs are preserved to maintain relationships
  - Timestamps are included
  - This includes both real-world-like data and specific test scenarios
*/

-- Disable triggers temporarily for faster import
SET session_replication_role = 'replica';

-- Clear existing data (optional - comment out if you want to keep existing data)
TRUNCATE TABLE job_classifications CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE jurisdictions CASCADE;

