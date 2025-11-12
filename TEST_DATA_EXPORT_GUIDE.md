# Test Data Export Guide

This guide explains how to export all test data from your Pay Equity application database and import it into a new database.

## Database Contents

Your current database contains:
- **27 Jurisdictions** (cities, counties, school districts)
- **70 Reports** (various compliance scenarios)
- **485 Job Classifications** (attached to reports)
- **29 Contacts** (primary contacts for jurisdictions)
- Additional data: implementation reports, notes, worksheets

## Export Methods

### Method 1: Using Supabase Dashboard (Easiest)

1. Log into your Supabase Dashboard
2. Go to **Table Editor**
3. For each table (jurisdictions, contacts, reports, job_classifications):
   - Click on the table
   - Click the **"⋮" menu** (three dots)
   - Select **"Export as CSV"**
   - Save the CSV file

4. To import into new database:
   - In your new Supabase project, go to Table Editor
   - Select the table
   - Click **"⋮" menu**
   - Select **"Import data from CSV"**
   - Upload the CSV file

### Method 2: Using pg_dump (Recommended for Complete Backup)

```bash
# 1. Get your Supabase connection string from Dashboard > Project Settings > Database

# 2. Export data from source database
pg_dump \
  "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres" \
  --data-only \
  --inserts \
  --no-owner \
  --no-privileges \
  --table=public.jurisdictions \
  --table=public.contacts \
  --table=public.reports \
  --table=public.job_classifications \
  --table=public.implementation_reports \
  --table=public.notes \
  --table=public.report_notes \
  --table=public.benefits_worksheets \
  > test_data_backup.sql

# 3. Import into target database
psql "postgresql://postgres:[NEW-PASSWORD]@[NEW-PROJECT].supabase.co:5432/postgres" \
  < test_data_backup.sql
```

### Method 3: Using the Provided SQL File

The file `export_test_data.sql` contains the jurisdictions data. To get the complete data:

1. Use the Supabase SQL Editor
2. Run these queries to generate CSV exports:

```sql
-- Export reports
COPY (
  SELECT * FROM reports ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export job_classifications
COPY (
  SELECT * FROM job_classifications ORDER BY created_at
) TO STDOUT WITH CSV HEADER;

-- Export contacts
COPY (
  SELECT * FROM contacts ORDER BY created_at
) TO STDOUT WITH CSV HEADER;
```

## Test Scenarios Included

The test data includes various compliance scenarios:

### Jurisdictions
- **TEST-001**: Compliant City - passes all tests
- **TEST-002**: Partial Pass County - passes some tests
- **TEST-003**: Service Issues District - fails exceptional service test
- **TEST-004**: Non-Compliant City - fails multiple tests
- **TEST-005**: Manual Review Town - has ≤3 male classes
- **TEST-006**: Borderline County - edge case scenarios

### Real-World Examples
- Minneapolis, Saint Paul, Rochester, Duluth
- Various counties (Hennepin, Ramsey, Dakota, Anoka, Washington)
- School districts (Minneapolis PS, Saint Paul PS, Anoka-Hennepin)

## Import Order (Important!)

When importing, follow this order to maintain referential integrity:

1. **jurisdictions** (no dependencies)
2. **contacts** (references jurisdictions)
3. **reports** (references jurisdictions)
4. **job_classifications** (references reports)
5. **implementation_reports** (references reports)
6. **notes** (references jurisdictions)
7. **report_notes** (references reports)
8. **benefits_worksheets** (references reports)

## Verification After Import

Run these queries to verify the import:

```sql
SELECT
  'jurisdictions' as table_name,
  COUNT(*) as record_count
FROM jurisdictions
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'job_classifications', COUNT(*) FROM job_classifications;
```

Expected results:
- jurisdictions: 27
- contacts: 29
- reports: 70
- job_classifications: 485

## Troubleshooting

### UUID Conflicts
If you get UUID conflicts during import:
```sql
-- Clear the tables first (be careful!)
TRUNCATE TABLE job_classifications CASCADE;
TRUNCATE TABLE implementation_reports CASCADE;
TRUNCATE TABLE benefits_worksheets CASCADE;
TRUNCATE TABLE report_notes CASCADE;
TRUNCATE TABLE notes CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE contacts CASCADE;
TRUNCATE TABLE jurisdictions CASCADE;
```

### Missing Columns
If you get "column does not exist" errors, ensure your target database has the latest schema migrations applied.

## Quick Start for New Database

If you're setting up a completely new database:

1. Apply all schema migrations first
2. Use Method 2 (pg_dump) for the cleanest import
3. Verify data counts match
4. Test login with test credentials (see TEST_CREDENTIALS.md)

## Files in This Export

- `export_test_data.sql` - Jurisdictions data (ready to import)
- `TEST_DATA_EXPORT_GUIDE.md` - This file
- `generate_full_export.sh` - Helper script with export commands
- `TEST_CREDENTIALS.md` - Test user accounts

## Need Help?

If you encounter issues:
1. Check that your target database schema matches the source
2. Ensure RLS policies are properly configured
3. Verify you're importing in the correct order
4. Check Supabase logs for detailed error messages
