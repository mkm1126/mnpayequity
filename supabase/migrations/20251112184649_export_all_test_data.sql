/*
  # Complete Test Data Export
  
  **IMPORTANT: This is an EXPORT file, not meant to be run as a migration!**
  
  This file documents the test data structure. To actually export/import data:
  
  ## Method 1: Use Supabase Dashboard
  1. Go to Table Editor in Supabase Dashboard
  2. Select each table and use "Export as CSV"
  3. Import CSVs into your new database
  
  ## Method 2: Use pg_dump (recommended)
  ```bash
  # Export data-only SQL from your source database
  pg_dump \
    --data-only \
    --inserts \
    --table=jurisdictions \
    --table=contacts \
    --table=reports \
    --table=job_classifications \
    --table=implementation_reports \
    --table=notes \
    --table=report_notes \
    --table=benefits_worksheets \
    <your-connection-string> \
    > test_data_export.sql
  ```
  
  ## Method 3: Use the export script provided
  See `export_test_data.sql` and `generate_full_export.sh` in the project root
  
  ## Data Summary:
  - 27 Jurisdictions (cities, counties, school districts)
  - 70 Reports (various compliance scenarios)
  - 485 Job Classifications
  - 29 Contacts
  - Various implementation reports, notes, and worksheets
  
  This includes comprehensive test scenarios:
  - Compliant jurisdictions
  - Non-compliant jurisdictions  
  - Manual review cases
  - Borderline compliance cases
  - Various salary range scenarios
  - Exceptional service pay scenarios
*/

-- This migration is intentionally empty
-- It serves as documentation for the export process
SELECT 1;