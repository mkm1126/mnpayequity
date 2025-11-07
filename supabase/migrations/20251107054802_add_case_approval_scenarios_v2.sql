/*
  # Add Case Approval Scenarios for Dashboard Testing

  ## Overview
  Updates existing reports with varied approval statuses to provide
  comprehensive test scenarios for the Case Approval Dashboard.
  
  ## Scenarios Included
  - Pending review (submitted, awaiting approval)
  - Approved cases (various compliance statuses)
  - Rejected cases (with detailed notes)
  - Cases requiring manual review
  - Cases with compliance issues
*/

-- Scenario 1: Pending review - submitted and awaiting approval
UPDATE reports r
SET 
  approval_status = 'pending',
  case_status = 'submitted',
  submitted_at = now() - (random() * 30)::int * interval '1 day',
  requires_manual_review = CASE 
    WHEN compliance_status = 'non_compliant' THEN true
    WHEN compliance_status = 'needs_review' THEN true
    ELSE false
  END
WHERE report_year = 2025 
  AND random() < 0.4
  AND submitted_at IS NOT NULL;

-- Scenario 2: Approved cases
UPDATE reports r
SET 
  approval_status = 'approved',
  case_status = 'submitted',
  approved_by = 'Admin User',
  approved_at = now() - (random() * 15)::int * interval '1 day',
  approval_notes = CASE 
    WHEN compliance_status = 'compliant' THEN 'All requirements met. Report approved.'
    WHEN compliance_status = 'needs_review' THEN 'Reviewed and approved with minor notes for future reference.'
    ELSE 'Approved with implementation plan submitted.'
  END
WHERE report_year = 2025 
  AND random() < 0.3
  AND submitted_at IS NOT NULL
  AND approval_status = 'pending';

-- Scenario 3: Rejected cases with detailed feedback
UPDATE reports r
SET 
  approval_status = 'rejected',
  case_status = 'submitted',
  approved_by = 'Admin User',
  approved_at = now() - (random() * 20)::int * interval '1 day',
  approval_notes = CASE 
    WHEN random() < 0.3 THEN 'Incomplete data in job classifications. Please review and resubmit with complete salary information.'
    WHEN random() < 0.6 THEN 'Missing implementation plan for non-compliant positions. Required before approval.'
    ELSE 'Data discrepancies found between male and female employee counts. Please verify and correct.'
  END,
  requires_manual_review = true
WHERE report_year = 2025 
  AND random() < 0.15
  AND submitted_at IS NOT NULL
  AND approval_status = 'pending';

-- Ensure some 2025 reports are submitted and pending review
UPDATE reports
SET 
  case_status = 'submitted',
  approval_status = 'pending',
  submitted_at = COALESCE(submitted_at, now() - (random() * 25)::int * interval '1 day')
WHERE report_year = 2025
  AND submitted_at IS NOT NULL
  AND approval_status = 'pending'
  AND case_status != 'submitted';

-- Convert some draft reports to submitted pending
UPDATE reports
SET 
  case_status = 'submitted',
  approval_status = 'pending',
  submitted_at = now() - (random() * 20)::int * interval '1 day',
  requires_manual_review = compliance_status IN ('non_compliant', 'needs_review')
WHERE report_year = 2025
  AND case_status = 'draft'
  AND random() < 0.6;

-- Historical 2022 approved cases
UPDATE reports
SET 
  approval_status = 'approved',
  case_status = 'submitted',
  approved_by = 'Previous Admin',
  approved_at = now() - (random() * 365)::int * interval '1 day',
  approval_notes = 'Historical approval - FY 2022 reporting cycle completed.',
  submitted_at = now() - (random() * 400)::int * interval '1 day'
WHERE report_year = 2022
  AND random() < 0.7;

-- Critical cases requiring immediate review
UPDATE reports r
SET 
  approval_status = 'pending',
  case_status = 'submitted',
  requires_manual_review = true,
  significant_changes_explanation = 'Significant salary adjustments made in Q3. Total of 12 positions adjusted.',
  alternative_analysis_notes = 'Alternative analysis method used due to small sample size in some job classes.',
  submitted_at = now() - (2 + random() * 5)::int * interval '1 day'
WHERE report_year = 2025
  AND compliance_status = 'non_compliant'
  AND random() < 0.8
  AND approval_status = 'pending';

-- Add edge case: supplemental analysis cases
DO $$
DECLARE
  jur_record RECORD;
BEGIN
  FOR jur_record IN 
    SELECT id FROM jurisdictions 
    WHERE jurisdiction_id IN ('12345', '22222', '77777')
  LOOP
    INSERT INTO reports (
      jurisdiction_id, report_year, case_number, case_description,
      case_status, compliance_status, approval_status,
      submitted_at, requires_manual_review,
      significant_changes_explanation,
      created_at, updated_at
    ) VALUES (
      jur_record.id, 2025, 3,
      'Supplemental Analysis - Major Reorganization',
      'submitted', 'non_compliant', 'pending',
      now() - interval '3 days',
      true,
      'Major departmental reorganization completed in 2024. Multiple job classifications affected. Implementation plan to be submitted within 90 days.',
      now() - interval '10 days',
      now() - interval '3 days'
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Add notes to pending cases
INSERT INTO notes (report_id, content, created_by, created_at, updated_at)
SELECT 
  r.id,
  CASE 
    WHEN r.requires_manual_review THEN 'Flagged for manual review due to compliance issues. Awaiting admin decision.'
    WHEN r.compliance_status = 'non_compliant' THEN 'Non-compliant positions identified. Implementation plan required.'
    WHEN r.compliance_status = 'needs_review' THEN 'Additional review requested by compliance team.'
    ELSE 'Standard submission - awaiting routine approval.'
  END,
  'System Auto-Flag',
  now() - (random() * 10)::int * interval '1 day',
  now() - (random() * 10)::int * interval '1 day'
FROM reports r
WHERE r.report_year = 2025
  AND r.approval_status = 'pending'
  AND r.case_status = 'submitted'
  AND random() < 0.4
ON CONFLICT DO NOTHING;