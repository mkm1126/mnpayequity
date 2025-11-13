# Minnesota Pay Equity Compliance Management System
## Functional Specification Document

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose
The Minnesota Pay Equity Compliance Management System is a web-based application designed to help Minnesota local government jurisdictions comply with the Minnesota Local Government Pay Equity Act. The system streamlines the process of managing jurisdiction information, entering and analyzing job classification data, performing compliance testing, and generating required implementation reports for submission to the State of Minnesota.

### 1.2 Scope
This system provides end-to-end management of pay equity reporting from initial data gathering through final compliance certification. It includes:

- Jurisdiction and contact management
- Pay equity report creation and management (multiple cases per year)
- Job classification data entry with multiple input methods
- Automated compliance analysis using statistical tests
- Implementation report generation
- Administrative oversight and case approval workflow
- Audit trail and activity logging
- Email communication management
- Document generation (PDFs, Excel exports)

### 1.3 Key Benefits

**For Jurisdictions:**
- Simplified data entry with built-in validation
- Automated compliance calculations eliminating manual statistical analysis
- Step-by-step guidance through the reporting process
- Historical data tracking for trend analysis
- Multiple report cases per year with independent tracking

**For State Administrators:**
- Centralized review dashboard for all submissions
- Automated approval workflows with manual review options
- Comprehensive case notes and follow-up tracking
- Jurisdiction-level oversight and communication tools
- Real-time metrics and activity monitoring

**For System Overall:**
- Reduced errors through validation and guidance
- Improved compliance rates through clear requirements
- Audit trail for all changes and actions
- Secure role-based access control
- Integration-ready architecture with Supabase database

---

## 2. SYSTEM OVERVIEW

### 2.1 Architecture

**Technology Stack (Target: ASP.NET Core):**
- Backend: ASP.NET Core Web API
- Database: PostgreSQL (via Supabase or self-hosted)
- Authentication: ASP.NET Core Identity with JWT tokens
- Frontend Communication: RESTful API with JSON
- File Generation: PDF libraries for certificates, Excel export libraries

**Key Architectural Patterns:**
- Three-tier architecture (Presentation, Business Logic, Data Access)
- Repository pattern for data access
- Service layer for business logic
- Role-based authorization with claims
- Row-level security at database level

### 2.2 Core Components

**User Management Module:**
- Authentication and authorization
- User profile management
- Jurisdiction assignment
- Role-based access control (Admin vs. User)

**Jurisdiction Management Module:**
- Jurisdiction CRUD operations
- Contact management
- Approval status tracking
- Follow-up scheduling

**Report Management Module:**
- Report creation with year and case number
- Multi-case support (multiple reports per year)
- Status workflow (Private → Shared → Submitted)
- Report notes and documentation

**Job Classification Module:**
- Job data entry (manual, copy, import)
- Point-based job evaluation system
- Gender composition tracking
- Salary range and benefits data
- Part-time job handling

**Compliance Analysis Engine:**
- Statistical test calculations
- Salary range test
- Exceptional service pay test
- Underpayment ratio calculations
- T-test statistical analysis
- Predicted pay regression analysis

**Implementation Reporting Module:**
- Implementation form data collection
- Total payroll tracking
- Official approval documentation
- Certificate generation

**Administrative Module:**
- Admin dashboard with metrics
- Case approval workflow
- Case notes system with categories and priorities
- Follow-up calendar
- Email template management
- Jurisdiction maintenance
- Activity logging

**Communication Module:**
- Email template management
- Bulk email sending
- Email history tracking
- Recipient filtering by status

---

## 3. USER ROLES AND PERSONAS

### 3.1 Standard User (Jurisdiction Employee)

**Profile:**
- HR Manager, Compensation Analyst, or City Administrator
- Responsible for completing pay equity reports for their jurisdiction
- Limited access to only their assigned jurisdiction data

**Capabilities:**
- View and edit assigned jurisdiction information
- Create and manage pay equity reports
- Enter job classification data
- Run compliance analyses
- Generate implementation reports
- View compliance certificates
- Add notes to reports
- Export data for review

**Restrictions:**
- Cannot view other jurisdictions' data
- Cannot approve jurisdictions or reports
- Cannot access administrative functions
- Cannot manage user accounts

### 3.2 System Administrator

**Profile:**
- State of Minnesota Pay Equity Program staff
- Oversight and approval authority
- System-wide access

**Capabilities:**
- All Standard User capabilities across all jurisdictions
- Approve/reject jurisdiction registrations
- Approve/reject submitted reports
- Create and manage case notes with priorities
- Set follow-up dates and tasks
- Send communications to jurisdictions
- View comprehensive metrics dashboard
- Manage email templates
- Access audit logs
- Generate system-wide reports
- Manage user accounts (view, not create)

**Special Features:**
- Notification panel for urgent items
- Automated case approval based on compliance
- Manual review flag for complex cases
- Activity logging for accountability

---

## 4. FEATURE SPECIFICATIONS

### 4.1 Authentication and Authorization

**Login Process:**
1. User enters email and password
2. User selects jurisdiction from dropdown (if not admin)
3. System validates credentials against database
4. System verifies jurisdiction assignment matches user profile
5. Session token generated with 24-hour expiration
6. User redirected to appropriate dashboard (Admin or User)

**Password Management:**
- Minimum 8 characters required
- Password reset via email link
- Secure password hashing (bcrypt or similar)
- Password change functionality within application

**Session Management:**
- Automatic token refresh
- Logout functionality
- Session timeout after inactivity
- Remember device option (optional)

### 4.2 Jurisdiction Management

**Jurisdiction Record Fields:**
- Jurisdiction ID (unique identifier, text)
- Name (required)
- Address, City, State, Zip Code
- Phone, Fax
- Jurisdiction Type (City, County, School District, etc.)
- Next Report Year
- Follow-up Type (Annual Review, Quarterly Check, etc.)
- Follow-up Date
- Approval Status (Pending, Approved, Rejected)
- Approval Notes
- Approved By, Approved At timestamps

**Contact Management:**
Each jurisdiction can have multiple contacts with:
- Name (required)
- Title
- Email
- Phone
- Primary Contact flag (only one per jurisdiction)

**Operations:**
- Add new jurisdiction (Admin only requires approval)
- Edit jurisdiction details
- View jurisdiction history
- Delete jurisdiction (Admin only, cascades to related records)
- Export contact list to CSV
- Search jurisdictions by name or ID

**Approval Workflow:**
- New jurisdictions created in "Pending" status
- Admin reviews and approves/rejects
- Approval notes captured for tracking
- Timestamp and approver recorded

### 4.3 Report Management

**Report Creation:**
- User selects jurisdiction
- System generates unique case number for year
- Default status: "Private"
- Required fields: Report Year, Case Description

**Report Fields:**
- ID (UUID, auto-generated)
- Jurisdiction ID (foreign key)
- Report Year (4-digit year)
- Case Number (auto-incremented per jurisdiction per year)
- Case Description (free text)
- Case Status (Private, Shared, Submitted)
- Compliance Status (computed from tests)
- Submission Date
- Alternative Analysis Notes
- Significant Changes Explanation
- Requires Manual Review flag
- Approval Status (Draft, Pending, Approved, Rejected, Auto-Approved)
- Approved By, Approved At
- Submission Deadline
- Submitted On Time flag

**Report Status Workflow:**

1. **Private:** Working draft, visible only to jurisdiction
2. **Shared:** Shared with stakeholders but not submitted
3. **Submitted:** Formal submission to state for review
   - Triggers approval workflow
   - Auto-approved if passes all compliance tests
   - Manual review if flagged or fails tests

**Multi-Case Support:**
- Multiple reports per jurisdiction per year
- Each case independently tracked
- Unique case numbers prevent conflicts
- Separate compliance analysis per case

**Report Operations:**
- Create new report
- Edit report details
- Delete report (if not submitted)
- Change status (Private ↔ Shared)
- Submit report (one-way, requires confirmation)
- View report history
- Add notes to report
- Export report data

### 4.4 Job Classification Data Entry

**Job Entry Methods:**

1. **Manual Entry:**
   - One-by-one job entry form
   - Real-time validation
   - Auto-save functionality

2. **Copy from Previous Report:**
   - Select source report (same jurisdiction)
   - Copy all jobs at once
   - Adjust data as needed after copy

3. **Import from Excel:**
   - Template-based import
   - Column mapping interface
   - Validation before import
   - Error reporting for invalid data

**Job Classification Fields:**
- Job Number (auto-incremented within report)
- Job Title (required, text)
- Males (count of male employees)
- Females (count of female employees)
- Points (job evaluation points, required)
- Minimum Salary (currency)
- Maximum Salary (currency, required)
- Years to Maximum Salary
- Years of Service Pay
- Exceptional Service Category (A, B, or blank)
- Benefits Included in Salary (currency)
- Part-Time flag
- Hours per Week (if part-time)
- Days per Year (if part-time)
- Additional Cash Compensation

**Gender Classification Rules:**
- Male-dominated: ≥80% male employees
- Female-dominated: ≥70% female employees
- Balanced: Less than 80% male AND less than 70% female
- System automatically classifies based on employee counts

**Validation Rules:**
- At least 1 male or female employee required
- Points must be greater than 0
- Maximum salary must be greater than minimum salary
- If part-time, hours and days required
- Years to max cannot be negative
- All currency fields must be non-negative

**Job Operations:**
- Add new job
- Edit existing job
- Delete job
- Bulk delete selected jobs
- Export jobs to Excel
- View job history (audit trail)

### 4.5 Compliance Analysis Engine

**Analysis Trigger:**
- Automatically runs when jobs are loaded/changed
- Can be manually triggered from compliance page
- Results cached until jobs change

**Statistical Framework:**

**Test 1: Salary Range Test**
- **Purpose:** Ensure female-dominated jobs have comparable salary ranges
- **Calculation:**
  - Male average years to maximum salary / Female average years to maximum salary
  - Threshold: Ratio must be ≥ 0.80 (80%)
- **Pass Condition:** Ratio meets or exceeds 80%
- **Not Applicable If:** No salary range data provided or insufficient jobs

**Test 2: Exceptional Service Pay Test**
- **Purpose:** Ensure female jobs have equal access to exceptional service pay
- **Calculation:**
  - Percentage of male jobs with exceptional service pay
  - Percentage of female jobs with exceptional service pay
  - Ratio: Female % / Male %
- **Pass Condition:**
  - Ratio ≥ 0.80 (80%) if more than 20% of male jobs have it
  - Auto-pass if less than 20% of male jobs have it
  - Auto-pass if no jobs have it
- **Not Applicable If:** No jobs have exceptional service pay

**Test 3: Underpayment Ratio Test (Statistical)**
- **Purpose:** Compare underpayment rates between gender categories
- **Calculation:**
  - Calculate predicted pay for each job using linear regression
  - Regression formula: Predicted Salary = (Slope × Points) + Intercept
  - Count jobs below predicted pay for male and female categories
  - Male underpayment percentage = (Male jobs below / Total male jobs) × 100
  - Female underpayment percentage = (Female jobs below / Total female jobs) × 100
  - Ratio = (Male % / Female %) × 100
- **Pass Condition:** Ratio ≥ 80%

**Test 4: T-Test Statistical Analysis**
- **Purpose:** Determine if pay difference between genders is statistically significant
- **Calculation:**
  - Calculate differences from predicted pay for all jobs
  - Compute mean difference for male jobs
  - Compute mean difference for female jobs
  - Calculate variance for each group
  - Compute pooled standard error
  - T-statistic = (Male mean diff - Female mean diff) / Pooled SE
  - Degrees of freedom = Total jobs - 2
  - Compare to critical t-value from table (α = 0.05, two-tailed)
- **Pass Condition:** |T-statistic| ≤ Critical value

**Overall Compliance Determination:**
- **In Compliance:** Salary Range Test PASS AND Exceptional Service Pay Test PASS
- **Out of Compliance:** Either test fails
- **Manual Review Required:** Three or fewer male-dominated classes

**Predicted Pay Report:**
- Shows each job with predicted salary
- Calculates difference from actual maximum salary
- Color-codes jobs above/below predicted
- Provides regression line visualization data

**Compliance Result Output:**
```
{
  isCompliant: boolean,
  requiresManualReview: boolean,
  generalInfo: {
    maleClasses, femaleClasses, balancedClasses,
    maleEmployees, femaleEmployees, balancedEmployees,
    avgMaxPayMale, avgMaxPayFemale, avgMaxPayBalanced
  },
  statisticalTest: { ... },
  salaryRangeTest: { passed, applicable, ratio, ... },
  exceptionalServiceTest: { passed, applicable, ratio, ... },
  message: "Compliance status summary"
}
```

### 4.6 Implementation Report

**Purpose:**
Document how the jurisdiction implements and maintains pay equity.

**Form Fields:**
1. **Job Evaluation System:**
   - Type: Text (name of system)
   - Description: Text area (how system works)

2. **Health Benefits Evaluation:**
   - Evaluated: Yes/No
   - Description: Text area (methodology if evaluated)

3. **Official Notice:**
   - Notice Location: Text (where notice is posted)
   - Approved By Body: Text (e.g., "City Council")

4. **Chief Elected Official:**
   - Name: Text
   - Title: Text
   - Approval Confirmed: Checkbox

5. **Total Payroll:**
   - Amount: Currency (total jurisdiction payroll)

**Validation:**
- All required fields must be completed before submission
- Total payroll must be positive number

**Operations:**
- Save as draft
- Update existing implementation data
- Export to PDF
- Include in full report package

### 4.7 Pre-Submission Checklist

**Automated Checks:**
1. Job evaluation system documented
2. At least one job entered
3. Health benefits evaluation addressed
4. Compliance analysis completed
5. Implementation form complete
6. Governing body approval confirmed
7. Total payroll entered
8. Official notice location documented
9. All data validations passed

**Submission Process:**
1. User clicks "Submit Report"
2. System runs pre-submission checklist
3. If any items incomplete, display warnings
4. User confirms submission
5. Status changes to "Submitted"
6. Submission timestamp recorded
7. Admin notification triggered (if implemented)
8. Automatic approval if passes all tests
9. Manual review queue if flagged

### 4.8 Administrative Dashboard

**Key Metrics Displayed:**

**Approval Metrics:**
- Pending review count
- Approved cases count
- Rejected cases count
- Manual review required count
- Average approval time (hours)
- Cases by age (< 24h, 1-3 days, 3-7 days, > 7 days)

**Note Metrics:**
- Total case notes
- Urgent notes count
- Overdue follow-ups count
- Due today count
- Due this week count

**Jurisdiction Metrics:**
- Total jurisdictions
- Jurisdictions with active reports
- In compliance count
- Out of compliance count
- Jurisdictions needing attention (with urgent notes)

**Activity Metrics:**
- Submissions in last 7 days
- Submissions in last 30 days
- New users in last 7 days
- Active users in last 24 hours

**Quick Actions:**
- Review pending cases
- Create case note
- User management
- Jurisdiction maintenance

**Recent Activity Feed:**
- Last 10 admin actions
- Shows action description, admin email, timestamp
- Links to relevant entities

**Urgent Notes Panel:**
- Last 5 urgent notes
- Click to view full note
- Visual urgency indicators

### 4.9 Case Approval Workflow

**Approval Dashboard Features:**
- Filter: All, Pending, Approved, Rejected
- Search by jurisdiction name or case number
- Sort by submission date, compliance status
- Batch actions (future enhancement)

**Case Review Interface:**
Shows:
- Jurisdiction information
- Report details (year, case, description)
- Compliance test results with visual indicators
- Job data summary
- Implementation report summary
- Submission date and deadline
- Previous approval history

**Approval Actions:**

1. **Auto-Approve:**
   - Automatically applied when:
     - All compliance tests pass
     - No manual review flag
     - Submitted by deadline
   - Creates compliance certificate
   - Sets approval status to "auto_approved"
   - Timestamp recorded

2. **Manual Approve:**
   - Admin clicks "Approve" button
   - Can add approval notes
   - Creates compliance certificate
   - Sets approval status to "approved"
   - Timestamp and approver recorded
   - Email notification sent (if configured)

3. **Reject:**
   - Admin clicks "Reject" button
   - Must provide rejection reason
   - Can add detailed notes
   - Status set to "rejected"
   - No certificate generated
   - Email notification sent (if configured)
   - Report returns to jurisdiction for corrections

4. **Request More Information:**
   - Admin flags for follow-up
   - Adds note with specific requests
   - Report remains in pending status
   - Follow-up date set
   - Email notification sent

**Certificate Generation:**
- Auto-generated PDF upon approval
- Includes:
  - Jurisdiction name and ID
  - Report year and case number
  - Approval date
  - Compliance status
  - State seal/logo (if available)
  - Digital signature (if configured)
- Stored in database as base64 or file reference
- Available for download by jurisdiction and admin

### 4.10 Admin Case Notes System

**Note Types:**
- Jurisdiction Note: Applies to entire jurisdiction
- Case Note: Applies to specific report

**Note Fields:**
- Title (required, text, 200 chars)
- Content (required, rich text)
- Category: General, Compliance, Follow-up, Issue, Data Quality, Communication, Approval, Other
- Priority: Low, Medium, High, Urgent
- Tags: Array of custom tags for searching
- Pinned: Boolean flag for important notes
- Due Date: Optional date for follow-up tasks
- Completed At: Timestamp when task completed
- Completed By: User who completed task
- Created By: User who created note
- Attachment Metadata: JSON for file attachments (future)

**Note Operations:**
- Create new note
- Edit existing note
- Delete note
- Pin/unpin note
- Mark complete
- Filter by type, category, priority, tags
- Search by title/content
- Sort by date, priority, title

**Note Notifications:**
- Admin dashboard shows urgent note count
- Overdue follow-ups highlighted
- Due today tasks prominently displayed
- Notification panel shows all actionable items

**Follow-Up Calendar:**
- Calendar view of all notes with due dates
- Color-coded by priority
- Click date to see notes due
- Click note to view/edit
- Mark complete from calendar
- Filter by completion status

### 4.11 Email Management

**Email Templates:**
- Pre-defined templates for common communications
- Variables: {jurisdiction_name}, {report_year}, {due_date}, etc.
- Categories: Announcement, Fail to Report, Reminder, etc.
- Subject and body text
- Active/inactive status

**Email Sending:**
- Select template or create custom
- Select recipients:
  - All jurisdictions
  - Filter by status (submitted, not submitted)
  - Filter by compliance status
  - Filter by approval status
  - Individual selection
- Preview before sending
- Send immediately or schedule (future)

**Email History:**
- Log all sent emails
- Track recipient, subject, body, timestamp
- Sender recorded
- Delivery status (future: sent, failed, pending)
- Link to jurisdiction/report if applicable

### 4.12 Data Export and Reporting

**Excel Exports:**

1. **Job Data Entry List:**
   - All jobs for a report
   - Includes all job fields
   - Formatted for printing
   - Template-based layout

2. **Compliance Report:**
   - Summary of compliance tests
   - Test results and calculations
   - Pass/fail indicators
   - Recommendations

3. **Predicted Pay Report:**
   - Job-by-job predicted pay
   - Actual vs. predicted comparison
   - Differences and percentages
   - Regression statistics

4. **Implementation Report:**
   - All implementation form data
   - Formatted for official submission
   - Includes signatures section

5. **Full Report Package:**
   - Combined export of all above
   - Multiple worksheets
   - Summary page
   - Ready for archival

**PDF Exports:**

1. **Compliance Certificate:**
   - Official certificate of compliance
   - Professional formatting
   - Jurisdiction details
   - Approval information
   - Date and signatures

2. **Implementation Report:**
   - Form-based layout
   - All required fields
   - Signature blocks
   - Ready for submission

**CSV Exports:**
- Jurisdiction list with contacts
- Job classifications raw data
- Audit logs
- Admin activity logs

---

## 5. USER WORKFLOWS

### 5.1 Standard User: Complete Annual Report

**Workflow Steps:**

1. **Login:**
   - Navigate to login page
   - Enter email and password
   - Select jurisdiction from dropdown
   - Click "Sign In"
   - Redirect to Dashboard

2. **Create New Report:**
   - Dashboard shows report reminder if no current year report
   - Click "Manage Pay Equity Reports"
   - Click "Add New Report" button
   - Enter report year (e.g., 2024)
   - Enter case description (e.g., "Annual Compliance Report")
   - Click "Create Report"
   - System assigns case number (e.g., Case 1)

3. **Enter Job Data:**
   - Select newly created report from list
   - Choose entry method:
     - Option A: Manual Entry
       - Click "Add Job" for each position
       - Fill in all required fields
       - Save each job
     - Option B: Copy from Previous Year
       - Click "Copy Jobs"
       - Select previous year's report
       - Confirm copy
       - Edit jobs as needed
     - Option C: Import from Excel
       - Download template
       - Fill template with job data
       - Upload completed file
       - Review import summary
       - Confirm import

4. **Review Compliance:**
   - Click "View Compliance Results"
   - Review test results:
     - Salary Range Test
     - Exceptional Service Pay Test
     - Statistical analysis
   - If out of compliance:
     - Review specific failing tests
     - Use "What-If Calculator" to model adjustments
     - Adjust job data as needed
     - Re-run compliance analysis

5. **Complete Implementation Form:**
   - Click "Implementation Report"
   - Fill in all required fields:
     - Job evaluation system description
     - Health benefits evaluation
     - Official notice location
     - Governing body approval
     - Chief elected official info
     - Total payroll
   - Save implementation data

6. **Pre-Submission Review:**
   - Click "Pre-Submission Checklist"
   - Review all checklist items
   - Ensure all items are green/checked
   - Address any warnings or errors

7. **Submit Report:**
   - Click "Submit Report" button
   - Review submission confirmation dialog
   - Confirm understanding that submission is final
   - Click "Confirm Submission"
   - Status changes to "Submitted"
   - Receive confirmation message

8. **Post-Submission:**
   - If auto-approved:
     - Status shows "Auto-Approved"
     - Download compliance certificate
   - If pending review:
     - Status shows "Pending Review"
     - Wait for admin approval
     - Check back for updates
   - If rejected:
     - Review rejection notes
     - Make necessary corrections
     - Cannot resubmit (would create new case)

### 5.2 Administrator: Review and Approve Submission

**Workflow Steps:**

1. **Login:**
   - Navigate to login page
   - Enter admin email and password
   - Click "Sign In"
   - Redirect to Admin Dashboard

2. **Review Dashboard Metrics:**
   - Check pending review count
   - Note any overdue cases (> 7 days)
   - Review urgent notes
   - Check follow-ups due today

3. **Access Approval Queue:**
   - Click "Review Pending Cases" from dashboard
   - OR click "Approval Dashboard" from header
   - See list of all submitted reports

4. **Filter and Select Case:**
   - Filter by "Pending" status
   - Sort by submission date (oldest first)
   - Click on specific case to review

5. **Review Case Details:**
   - **Jurisdiction Information:**
     - Name, type, contact info
     - Previous submission history
     - Any existing case notes

   - **Report Information:**
     - Year and case number
     - Description
     - Submission date
     - Deadline status (on-time or late)

   - **Compliance Results:**
     - Overall status (in/out of compliance)
     - Salary range test result
     - Exceptional service pay test result
     - Statistical test results
     - Number of jobs and gender breakdown

   - **Job Data:**
     - Summary statistics
     - Gender distribution
     - Point range
     - Salary ranges
     - Quick scan for anomalies

   - **Implementation Report:**
     - Review all form responses
     - Check for completeness
     - Verify official approval
     - Confirm total payroll

6. **Make Decision:**

   **Option A: Approve**
   - Click "Approve" button
   - Add approval notes (optional, recommended for complex cases)
   - Confirm approval
   - System generates compliance certificate
   - Status updates to "Approved"
   - Certificate becomes available for download
   - Admin activity logged

   **Option B: Reject**
   - Click "Reject" button
   - Select rejection reason from dropdown
   - Add detailed explanation (required)
   - Provide specific guidance for corrections
   - Confirm rejection
   - Status updates to "Rejected"
   - No certificate generated
   - Jurisdiction receives notification (if email enabled)
   - Admin activity logged

   **Option C: Request Information**
   - Click "Add Case Note" button
   - Select note type: "Follow-up"
   - Set priority: Medium or High
   - Describe information needed
   - Set due date for follow-up
   - Save note
   - Leave case in "Pending" status
   - Send email to jurisdiction (if enabled)

7. **Add Case Note (Optional but Recommended):**
   - Click "Case Notes" tab
   - Click "Add Note"
   - Fill in details:
     - Title: Brief description
     - Content: Full notes
     - Category: Select appropriate
     - Priority: Set based on severity
     - Tags: Add for searching
     - Due Date: If follow-up needed
   - Save note
   - Note appears in admin dashboard if urgent/due

8. **Post-Approval Tasks:**
   - Review next case in queue
   - Update follow-up calendar if needed
   - Generate reports for state reporting (if required)
   - Monitor metrics for trends

### 5.3 User: What-If Scenario Analysis

**Workflow Steps:**

1. **Access What-If Calculator:**
   - Open report with compliance issues
   - Click "What-If Calculator" button
   - System loads current job data

2. **Review Current Status:**
   - See baseline compliance results
   - Identify specific failing tests
   - Note current salary ranges and gaps

3. **Test Scenario:**
   - Select job(s) to modify
   - Adjust salary values
   - Change gender composition
   - Modify points (if appropriate)
   - Click "Calculate Impact"

4. **Analyze Results:**
   - Compare before/after compliance status
   - See how changes affect each test
   - Review cost implications
   - Note jobs that need adjustment

5. **Apply Changes (Optional):**
   - If satisfied with scenario
   - Click "Apply to Report"
   - Confirm changes
   - Jobs updated in actual report
   - OR take notes and make changes manually

6. **Repeat as Needed:**
   - Try multiple scenarios
   - Find optimal solution
   - Balance compliance with budget
   - Document rationale for changes

---

## 6. DATABASE SCHEMA

### 6.1 Core Tables

**jurisdictions**
```
id: UUID (PK)
jurisdiction_id: TEXT (UNIQUE, NOT NULL) - External/display ID
name: TEXT (NOT NULL)
address: TEXT
city: TEXT
state: TEXT (DEFAULT 'MN')
zipcode: TEXT
phone: TEXT
fax: TEXT
jurisdiction_type: TEXT - City, County, School District, etc.
next_report_year: INTEGER
follow_up_type: TEXT
follow_up_date: DATE
approval_status: TEXT (DEFAULT 'pending') - pending, approved, rejected
approval_notes: TEXT
approved_by: TEXT - Email of admin who approved
approved_at: TIMESTAMP WITH TIME ZONE
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_jurisdictions_jurisdiction_id ON jurisdiction_id
- idx_jurisdictions_approval_status ON approval_status
```

**contacts**
```
id: UUID (PK)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE)
name: TEXT (NOT NULL)
title: TEXT
is_primary: BOOLEAN (DEFAULT FALSE)
email: TEXT
phone: TEXT
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_contacts_jurisdiction_id ON jurisdiction_id
```

**reports**
```
id: UUID (PK)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE)
report_year: INTEGER (NOT NULL)
case_number: INTEGER (NOT NULL, DEFAULT 1)
case_description: TEXT (NOT NULL)
case_status: TEXT (DEFAULT 'Private') - Private, Shared, Submitted
compliance_status: TEXT - In Compliance, Out of Compliance, blank
alternative_analysis_notes: TEXT
significant_changes_explanation: TEXT
requires_manual_review: BOOLEAN (DEFAULT FALSE)
approval_status: TEXT (DEFAULT 'pending') - draft, pending, approved, rejected, auto_approved
approval_notes: TEXT
approved_by: TEXT
approved_at: TIMESTAMP WITH TIME ZONE
submitted_at: TIMESTAMP WITH TIME ZONE
submission_deadline: DATE
submitted_on_time: BOOLEAN
test_results: JSONB - Store full compliance test results
test_applicability: JSONB - Store which tests are applicable
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

UNIQUE CONSTRAINT: (jurisdiction_id, report_year, case_number)

INDEXES:
- idx_reports_jurisdiction_id ON jurisdiction_id
- idx_reports_report_year ON report_year
- idx_reports_approval_status ON approval_status
```

**job_classifications**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE)
job_number: INTEGER (NOT NULL)
title: TEXT (NOT NULL)
males: INTEGER (DEFAULT 0)
females: INTEGER (DEFAULT 0)
points: INTEGER (DEFAULT 0)
min_salary: NUMERIC(10,2) (DEFAULT 0)
max_salary: NUMERIC(10,2) (DEFAULT 0)
years_to_max: NUMERIC(4,2) (DEFAULT 0)
years_service_pay: NUMERIC(4,2) (DEFAULT 0)
exceptional_service_category: TEXT - A, B, or blank
benefits_included_in_salary: NUMERIC(10,2) (DEFAULT 0)
is_part_time: BOOLEAN (DEFAULT FALSE)
hours_per_week: NUMERIC(5,2)
days_per_year: INTEGER
additional_cash_compensation: NUMERIC(10,2) (DEFAULT 0)
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

UNIQUE CONSTRAINT: (report_id, job_number)

INDEXES:
- idx_job_classifications_report_id ON report_id
```

**implementation_reports**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE, UNIQUE)
evaluation_system: TEXT
evaluation_description: TEXT
health_benefits_evaluated: TEXT - Yes, No
health_benefits_description: TEXT
notice_location: TEXT
approved_by_body: TEXT - City Council, Board of Commissioners, etc.
chief_elected_official: TEXT
official_title: TEXT
approval_confirmed: BOOLEAN (DEFAULT FALSE)
total_payroll: NUMERIC(15,2)
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_implementation_reports_report_id ON report_id
```

### 6.2 User Management Tables

**user_profiles**
```
id: UUID (PK)
user_id: UUID (UNIQUE, NOT NULL) - References auth.users (Supabase) or AspNetUsers (ASP.NET)
email: TEXT (NOT NULL)
jurisdiction_id: TEXT - References jurisdictions.jurisdiction_id
is_admin: BOOLEAN (DEFAULT FALSE)
role: TEXT (DEFAULT 'User') - User, Admin
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_user_profiles_user_id ON user_id
- idx_user_profiles_email ON email
- idx_user_profiles_jurisdiction_id ON jurisdiction_id
```

### 6.3 Supporting Tables

**submission_checklists**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE)
job_evaluation_complete: BOOLEAN (DEFAULT FALSE)
jobs_data_entered: BOOLEAN (DEFAULT FALSE)
benefits_evaluated: BOOLEAN (DEFAULT FALSE)
compliance_reviewed: BOOLEAN (DEFAULT FALSE)
implementation_form_complete: BOOLEAN (DEFAULT FALSE)
governing_body_approved: BOOLEAN (DEFAULT FALSE)
total_payroll_entered: BOOLEAN (DEFAULT FALSE)
official_notice_posted: BOOLEAN (DEFAULT FALSE)
all_validations_passed: BOOLEAN (DEFAULT FALSE)
completed_at: TIMESTAMP WITH TIME ZONE
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_submission_checklists_report_id ON report_id
```

**benefits_worksheets**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE)
lowest_points: INTEGER (NOT NULL, DEFAULT 0)
highest_points: INTEGER (NOT NULL, DEFAULT 0)
point_range: INTEGER (NOT NULL, DEFAULT 0)
comparable_value_range: INTEGER (NOT NULL, DEFAULT 0)
trigger_detected: BOOLEAN (DEFAULT FALSE)
trigger_explanation: TEXT
benefits_data: JSONB - Store detailed benefits calculations
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_benefits_worksheets_report_id ON report_id
```

**audit_logs**
```
id: UUID (PK)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE)
report_id: UUID (FK → reports.id, CASCADE DELETE, NULLABLE)
action_type: TEXT (NOT NULL) - CREATE, UPDATE, DELETE, SUBMIT, APPROVE, REJECT
table_name: TEXT (NOT NULL)
record_id: UUID
old_values: JSONB
new_values: JSONB
user_email: TEXT
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_audit_logs_jurisdiction_id ON jurisdiction_id
- idx_audit_logs_report_id ON report_id
- idx_audit_logs_created_at ON created_at DESC
```

**notes**
```
id: UUID (PK)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE, NULLABLE)
report_id: UUID (FK → reports.id, CASCADE DELETE, NULLABLE)
content: TEXT (NOT NULL)
created_by: TEXT
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_notes_jurisdiction_id ON jurisdiction_id
- idx_notes_report_id ON report_id
```

**report_notes**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE)
content: TEXT (NOT NULL)
created_by: TEXT (NOT NULL)
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_report_notes_report_id ON report_id
```

**email_templates**
```
id: UUID (PK)
name: TEXT (NOT NULL)
type: TEXT (NOT NULL) - announcement, fail_to_report, reminder, etc.
subject: TEXT (NOT NULL)
body: TEXT (NOT NULL)
is_active: BOOLEAN (DEFAULT TRUE)
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
```

**email_history**
```
id: UUID (PK)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE, NULLABLE)
report_id: UUID (FK → reports.id, CASCADE DELETE, NULLABLE)
template_id: UUID (FK → email_templates.id, SET NULL, NULLABLE)
recipient_email: TEXT (NOT NULL)
subject: TEXT (NOT NULL)
body: TEXT (NOT NULL)
sent_by: TEXT
sent_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
delivery_status: TEXT (DEFAULT 'sent') - sent, failed, pending
error_message: TEXT

INDEXES:
- idx_email_history_jurisdiction_id ON jurisdiction_id
- idx_email_history_report_id ON report_id
```

### 6.4 Administrative Tables

**admin_case_notes**
```
id: UUID (PK)
note_type: TEXT (NOT NULL) - jurisdiction, case
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE)
report_id: UUID (FK → reports.id, CASCADE DELETE, NULLABLE)
title: TEXT (NOT NULL)
content: TEXT (NOT NULL)
category: TEXT (NOT NULL) - general, compliance, follow-up, issue, data-quality, communication, approval, other
tags: TEXT[] - Array of tags
priority: TEXT (NOT NULL) - low, medium, high, urgent
is_pinned: BOOLEAN (DEFAULT FALSE)
due_date: DATE
completed_at: TIMESTAMP WITH TIME ZONE
completed_by: TEXT
created_by: TEXT
created_by_email: TEXT (NOT NULL)
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
attachment_metadata: JSONB - Future use for attachments

INDEXES:
- idx_admin_case_notes_jurisdiction_id ON jurisdiction_id
- idx_admin_case_notes_report_id ON report_id
- idx_admin_case_notes_priority ON priority
- idx_admin_case_notes_due_date ON due_date
- idx_admin_case_notes_completed_at ON completed_at
```

**admin_activity_log**
```
id: UUID (PK)
admin_user_id: UUID (NOT NULL)
admin_email: TEXT (NOT NULL)
action_type: TEXT (NOT NULL) - APPROVE_CASE, REJECT_CASE, CREATE_NOTE, etc.
action_description: TEXT (NOT NULL)
entity_type: TEXT - jurisdiction, report, note, user, etc.
entity_id: UUID
metadata: JSONB - Additional action details
ip_address: TEXT
user_agent: TEXT
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_admin_activity_log_admin_user_id ON admin_user_id
- idx_admin_activity_log_created_at ON created_at DESC
- idx_admin_activity_log_action_type ON action_type
```

**compliance_certificates**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE)
report_year: INTEGER (NOT NULL)
certificate_data: TEXT - Base64 PDF or file path
file_name: TEXT
generated_by: TEXT
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())
updated_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_compliance_certificates_report_id ON report_id
- idx_compliance_certificates_jurisdiction_id ON jurisdiction_id
```

**approval_history**
```
id: UUID (PK)
report_id: UUID (FK → reports.id, CASCADE DELETE)
jurisdiction_id: UUID (FK → jurisdictions.id, CASCADE DELETE)
action_type: TEXT (NOT NULL) - SUBMIT, APPROVE, REJECT, REQUEST_INFO
previous_status: TEXT
new_status: TEXT (NOT NULL)
approved_by: TEXT
reason: TEXT
notes: TEXT
created_at: TIMESTAMP WITH TIME ZONE (DEFAULT NOW())

INDEXES:
- idx_approval_history_report_id ON report_id
- idx_approval_history_jurisdiction_id ON jurisdiction_id
- idx_approval_history_created_at ON created_at DESC
```

### 6.5 Key Relationships

```
jurisdictions (1) → (N) contacts
jurisdictions (1) → (N) reports
jurisdictions (1) → (N) notes
jurisdictions (1) → (N) admin_case_notes
jurisdictions (1) → (N) email_history
jurisdictions (1) → (N) audit_logs

reports (1) → (N) job_classifications
reports (1) → (1) implementation_reports
reports (1) → (1) submission_checklists
reports (1) → (1) benefits_worksheets
reports (1) → (N) report_notes
reports (1) → (N) notes
reports (1) → (N) admin_case_notes
reports (1) → (N) compliance_certificates
reports (1) → (N) approval_history
reports (1) → (N) audit_logs

user_profiles (N) → (1) jurisdictions (via jurisdiction_id)

email_templates (1) → (N) email_history
```

---

## 7. SECURITY AND ACCESS CONTROL

### 7.1 Authentication

**ASP.NET Core Identity Configuration:**

**User Registration:**
- Self-registration not allowed
- Admin creates user accounts manually (or via separate admin panel)
- Initial password sent via email
- User must change password on first login

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be common password

**Session Management:**
- JWT tokens with 24-hour expiration
- Refresh token mechanism for seamless experience
- Secure cookie storage (HttpOnly, Secure, SameSite)
- Token revocation on logout
- Automatic logout after 2 hours of inactivity

**Multi-Factor Authentication (Future):**
- Email-based verification codes
- Authenticator app support
- Recovery codes for account recovery

### 7.2 Authorization

**Role-Based Access Control:**

**Roles:**
1. User (Standard Jurisdiction User)
2. Admin (State Administrator)

**Claims:**
- UserId
- Email
- Role
- JurisdictionId (for Users)
- IsAdmin (boolean)

**Authorization Policies:**

```csharp
// Policy: RequireUser
- Authenticated user with User or Admin role

// Policy: RequireAdmin
- Authenticated user with Admin role

// Policy: RequireJurisdictionAccess
- User role: jurisdiction_id claim matches resource
- Admin role: Always allowed

// Policy: RequireReportOwnership
- User role: report.jurisdiction_id matches user's jurisdiction
- Admin role: Always allowed

// Policy: RequireSubmittedReport
- Report status must be "Submitted"
- User must have ReportOwnership
```

**Endpoint Security Examples:**

```
GET /api/jurisdictions/{id}
- Policy: RequireUser + RequireJurisdictionAccess

POST /api/reports
- Policy: RequireUser + RequireJurisdictionAccess
- Validate jurisdiction_id matches user

PUT /api/reports/{id}
- Policy: RequireUser + RequireReportOwnership
- Cannot edit if status = "Submitted"

POST /api/reports/{id}/submit
- Policy: RequireUser + RequireReportOwnership
- Validate pre-submission checklist

POST /api/admin/approvals/{id}/approve
- Policy: RequireAdmin

GET /api/admin/dashboard
- Policy: RequireAdmin

POST /api/admin/notes
- Policy: RequireAdmin
```

### 7.3 Row-Level Security (Database)

**PostgreSQL RLS Policies:**

**jurisdictions table:**
- Admins: Full access (SELECT, INSERT, UPDATE, DELETE)
- Users: SELECT only their assigned jurisdiction
- Anonymous: SELECT only (for login dropdown)

**reports table:**
- Admins: Full access
- Users: SELECT, INSERT, UPDATE, DELETE where jurisdiction_id matches user
- Cannot update if case_status = 'Submitted'

**job_classifications table:**
- Admins: Full access
- Users: Full access where report.jurisdiction_id matches user

**admin_case_notes table:**
- Admins: Full access
- Users: No access

**user_profiles table:**
- Admins: SELECT, UPDATE all profiles
- Users: SELECT, UPDATE own profile only
- INSERT only via service role (registration process)

**Implementation in ASP.NET:**
- Set session variable with user_id and jurisdiction_id
- RLS policies reference these session variables
- Connection string includes user context

### 7.4 Data Validation and Sanitization

**Input Validation:**
- All API inputs validated with Data Annotations or FluentValidation
- Maximum string lengths enforced
- Numeric ranges validated
- Email format validated
- Date ranges validated

**SQL Injection Prevention:**
- Parameterized queries only (Entity Framework)
- No dynamic SQL construction
- ORM handles escaping

**XSS Prevention:**
- Input sanitization for text fields
- HTML encoding on output
- Content Security Policy headers
- No JavaScript in user content

**CSRF Prevention:**
- Anti-forgery tokens for state-changing operations
- SameSite cookie attribute
- Validate origin headers

### 7.5 Audit Trail

**Audit Logging Strategy:**

**Events to Log:**
- User login/logout
- Report creation, update, deletion
- Job data changes (batch operations logged as single entry)
- Report status changes (Private → Shared → Submitted)
- Approval actions (approve, reject)
- Admin case note creation/editing
- Email sending
- Jurisdiction approval/rejection
- Implementation report submission

**Audit Log Entry:**
```
{
  timestamp: DateTime,
  user_email: String,
  action_type: String,
  table_name: String,
  record_id: UUID,
  old_values: JSON,
  new_values: JSON,
  ip_address: String,
  user_agent: String
}
```

**Retention:**
- Audit logs retained indefinitely
- Indexed by date for performance
- Exportable for compliance/legal needs

### 7.6 Data Encryption

**At Rest:**
- Database encryption (PostgreSQL native encryption or TDE)
- Backup encryption
- Certificate storage encrypted

**In Transit:**
- HTTPS/TLS 1.2+ only
- Strong cipher suites
- Certificate pinning (optional)

**Sensitive Data:**
- Passwords hashed with bcrypt (cost factor 12+)
- No plaintext passwords ever stored
- Email addresses encrypted (optional)

### 7.7 Compliance and Privacy

**Data Privacy:**
- Minimal data collection (need-to-know)
- No personal employee data (only counts)
- User data limited to email and jurisdiction
- Admin cannot see user passwords

**Data Retention:**
- Jurisdiction data: Retained indefinitely
- Reports: Retained per state requirements (typically 7+ years)
- Audit logs: Retained indefinitely
- User accounts: Deactivate not delete

**Right to Access:**
- Users can download their jurisdiction data
- Admins can generate data exports

**Breach Response:**
- Automated alerting on suspicious activity
- Incident response plan documented
- Notification process for affected users

---

## 8. USER INTERFACE SPECIFICATIONS

### 8.1 Design Principles

**Visual Design:**
- Color Scheme: Minnesota state colors
  - Primary: #003865 (Dark Blue)
  - Secondary: #004d7a (Medium Blue)
  - Accent: #E8B000 (Gold) - for highlights/warnings
  - Success: #10B981 (Green)
  - Error: #EF4444 (Red)
  - Warning: #F59E0B (Amber)
- Typography: Clean, readable sans-serif (e.g., Inter, System UI)
- Spacing: Consistent 8px grid system
- Shadows: Subtle for depth, not heavy

**Layout:**
- Responsive design (mobile-first approach)
- Breakpoints: 640px (mobile), 768px (tablet), 1024px (desktop)
- Maximum content width: 1280px
- Sidebar navigation (collapsible on mobile)
- Sticky header with navigation

**Accessibility:**
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators visible
- Alt text for all images
- ARIA labels for complex components

### 8.2 Common UI Components

**Navigation:**
- **Header:**
  - Logo/title (left)
  - Main navigation links (center)
  - User menu (right) - email, profile, logout
  - Admin-specific links (if admin)
  - Help/tutorial button

- **Breadcrumbs:**
  - Show current location in hierarchy
  - Clickable for navigation back
  - Example: Home > Dashboard > Reports > Report 2024-1

**Forms:**
- Labels above inputs
- Required fields marked with asterisk
- Validation messages below fields
- Inline validation on blur
- Submit button disabled until valid
- Clear error states with helpful messages
- Success confirmation after save

**Tables:**
- Sortable columns (click header)
- Pagination (25, 50, 100 items per page)
- Search/filter bar above table
- Action buttons in last column
- Hover state on rows
- Responsive (stack on mobile)

**Modals:**
- Overlay with centered dialog
- Close button (X) top-right
- Optional backdrop click to close
- Focus trap within modal
- Escape key to close
- Confirm/cancel actions at bottom

**Buttons:**
- Primary: Dark blue background, white text
- Secondary: White background, dark blue border
- Danger: Red background, white text
- Disabled: Gray with reduced opacity
- Loading state: Spinner icon
- Icon + text for clarity

**Alerts/Notifications:**
- Success: Green background, check icon
- Error: Red background, X icon
- Warning: Amber background, alert icon
- Info: Blue background, info icon
- Dismissible (X button)
- Auto-dismiss after 5 seconds (except errors)

**Cards:**
- White background
- Subtle border or shadow
- Padding: 24px
- Rounded corners (8px)
- Hover effect if clickable

### 8.3 Page Layouts

**Login Page:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [LOGO] Minnesota Pay Equity Reporting     │
│                                             │
│     ┌──────────────────────────┐           │
│     │  Email                   │           │
│     │  [____________________]  │           │
│     │                          │           │
│     │  Password                │           │
│     │  [____________________]  │           │
│     │                          │           │
│     │  Jurisdiction (if User)  │           │
│     │  [____________________]  │           │
│     │                          │           │
│     │  [ Sign In ]             │           │
│     │                          │           │
│     │  Forgot password?        │           │
│     └──────────────────────────┘           │
│                                             │
└─────────────────────────────────────────────┘
```

**Dashboard (User):**
```
┌──────────────────────────────────────────────────────────────┐
│ [LOGO] MN Pay Equity     Dashboard | Reports | Help  [User▼] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome to Pay Equity Reporting                            │
│  Anoka County                                               │
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                      │
│  │Total │ │Sub-  │ │Draft │ │In    │                      │
│  │Cases │ │mitted│ │Cases │ │Comp. │                      │
│  │  5   │ │  3   │ │  2   │ │  3   │                      │
│  └──────┘ └──────┘ └──────┘ └──────┘                      │
│                                                              │
│  [!] Report Reminder: No report for 2024 yet               │
│                                                              │
│  Quick Actions:                                             │
│  ┌───────────────────────────────────────────────┐         │
│  │ [→] Manage Pay Equity Reports                 │         │
│  └───────────────────────────────────────────────┘         │
│  ┌───────────────────────────────────────────────┐         │
│  │ [→] Data Gathering Checklist                  │         │
│  └───────────────────────────────────────────────┘         │
│                                                              │
│  Recent Reports:                                            │
│  ┌────────────────────────────────────────┐                │
│  │ 2024 - Case 1 │ Annual Report │ [Private] │            │
│  │ 2023 - Case 1 │ Annual Report │ [Submitted]│            │
│  └────────────────────────────────────────┘                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Report Management:**
```
┌──────────────────────────────────────────────────────────────┐
│ [←] Back to Dashboard                                        │
│                                                              │
│  Pay Equity Reports - Anoka County                          │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │ [ + Add New Report ]  [ 🔍 Search ] │                  │
│  └──────────────────────────────────────┘                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Report Year │ Case │ Description │ Status │ Actions│    │
│  ├────────────────────────────────────────────────────┤    │
│  │ 2024        │  1   │ Annual      │ Private│ [Edit] │    │
│  │ 2023        │  1   │ Annual      │ Submit │ [View] │    │
│  │ 2023        │  2   │ Correct.    │ Submit │ [View] │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Selected Report: 2024 - Case 1                             │
│  ┌────┬────────┬────────────┬──────────────┬────────┐      │
│  │Jobs│Complian│Predicted   │Implementation│Notes   │      │
│  └────┴────────┴────────────┴──────────────┴────────┘      │
│                                                              │
│  [Current view based on selected tab]                       │
│                                                              │
│  ┌─────────────────────────────────────────────┐            │
│  │ [ Submit Report ] [ Export ] [ Delete ]     │            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Job Data Entry:**
```
┌──────────────────────────────────────────────────────────────┐
│ Job Classifications - 2024 Case 1                            │
│                                                              │
│ ┌────────────────────────────────────────────────────┐      │
│ │ [ + Add Job ] [ Copy Jobs ] [ Import Excel ]       │      │
│ └────────────────────────────────────────────────────┘      │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ # │ Title │ M │ F │ Points│ Max Sal │ Actions       │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ 1 │ Admin │ 2 │ 8 │  450  │ $65,000 │ [Edit][Delete]│  │
│ │ 2 │ Clerk │ 1 │12 │  320  │ $48,000 │ [Edit][Delete]│  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [✓] 25 jobs entered                                         │
│ [✓] Gender data complete                                    │
│ [!] 3 jobs missing salary data                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Compliance Results:**
```
┌──────────────────────────────────────────────────────────────┐
│ Compliance Analysis - 2024 Case 1                            │
│                                                              │
│ Overall Status: [✓] IN COMPLIANCE                           │
│                                                              │
│ ┌────────────────────────────────────────────────┐          │
│ │ General Information                            │          │
│ │  Male Classes: 12                              │          │
│ │  Female Classes: 18                            │          │
│ │  Balanced Classes: 5                           │          │
│ │  Total Employees: 156                          │          │
│ └────────────────────────────────────────────────┘          │
│                                                              │
│ ┌────────────────────────────────────────────────┐          │
│ │ Test 1: Salary Range Test                      │          │
│ │ Status: [✓] PASS                               │          │
│ │ Ratio: 0.89 (Threshold: 0.80)                  │          │
│ │ Male Avg: 8.5 years │ Female Avg: 9.5 years   │          │
│ └────────────────────────────────────────────────┘          │
│                                                              │
│ ┌────────────────────────────────────────────────┐          │
│ │ Test 2: Exceptional Service Pay Test           │          │
│ │ Status: [✓] PASS                               │          │
│ │ Ratio: 0.92 (Threshold: 0.80)                  │          │
│ │ Male: 25% │ Female: 23%                        │          │
│ └────────────────────────────────────────────────┘          │
│                                                              │
│ ┌────────────────────────────────────────────────┐          │
│ │ Statistical Tests (Informational)              │          │
│ │ Underpayment Ratio: 85% (Threshold: 80%)       │          │
│ │ T-Test: 1.45 (Critical: 1.96)                  │          │
│ └────────────────────────────────────────────────┘          │
│                                                              │
│ [ Export Results ] [ View Predicted Pay ]                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Admin Dashboard:**
```
┌──────────────────────────────────────────────────────────────┐
│ Admin Dashboard                    [🔔 3] [Refresh]  [User▼] │
│                                                              │
│ Welcome back, admin@state.mn.us                              │
│                                                              │
│ [!] Action Required:                                        │
│     • 2 urgent case notes requiring immediate attention     │
│     • 1 overdue follow-up                                   │
│                                                              │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                        │
│ │Pending│ │Approv│ │Urgent │ │Follow│                        │
│ │Review │ │Cases │ │Notes  │ │-ups  │                        │
│ │  12   │ │  48  │ │   2   │ │   7  │                        │
│ └──────┘ └──────┘ └──────┘ └──────┘                        │
│                                                              │
│ Case Approval Overview:         Jurisdiction Overview:      │
│ ┌────┬────┬────┬────┐          ┌──────────────────┐        │
│ │<24h│1-3d│3-7d│>7d │          │ Total: 87        │        │
│ │ 5  │ 4  │ 2  │ 1  │          │ In Comp: 52      │        │
│ └────┴────┴────┴────┘          │ Out Comp: 8      │        │
│                                 │ Need Attn: 3     ��        │
│                                 └──────────────────┘        │
│ Quick Actions:                                              │
│ ┌─────────────────────────────────────────┐                │
│ │ [→] Review Pending Cases                │                │
│ │ [→] Create Case Note                    │                │
│ │ [→] User Management                     │                │
│ │ [→] Jurisdiction Maintenance            │                │
│ └─────────────────────────────────────────┘                │
│                                                              │
│ Recent Activity:                                            │
│ ┌──────────────────────────────────────────────────┐       │
│ │ Approved Case #2024-42 for Anoka County          │       │
│ │ admin@state.mn.us • 2 hours ago                   │       │
│ │ Created urgent note for Hennepin County           │       │
│ │ admin2@state.mn.us • 4 hours ago                  │       │
│ └──────────────────────────────────────────────────┘       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Approval Dashboard:**
```
┌──────────────────────────────────────────────────────────────┐
│ Case Approval Dashboard                                      │
│                                                              │
│ ┌──────────────────────────────────────────┐                │
│ │ Filter: [Pending ▼] [🔍 Search]         │                │
│ └──────────────────────────────────────────┘                │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Jurisdiction│Year│Case│Submitted │Status │Actions    │    │
│ ├──────────────────────────────────────────────────────┤    │
│ │ Anoka Co.   │2024│ 1  │Mar 15    │Pending│[Review]   │    │
│ │ Hennepin Co.│2024│ 1  │Mar 10    │Manual │[Review]   │    │
│ │ Ramsey Co.  │2024│ 2  │Mar 8     │Pending│[Review]   │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ Showing 12 pending cases                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Case Review Modal:**
```
┌──────────────────────────────────────────────────────────────┐
│ Review Case: Anoka County - 2024 Case 1               [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Jurisdiction: Anoka County                                  │
│ Submitted: March 15, 2024 (On time)                         │
│ Description: Annual Compliance Report                        │
│                                                              │
│ Compliance Status: [✓] IN COMPLIANCE                        │
│ ┌────────────────────────────────────────┐                  │
│ │ ✓ Salary Range Test: PASS              │                  │
│ │ ✓ Exceptional Service: PASS            │                  │
│ │ ℹ Statistical Tests: Informational     │                  │
│ └────────────────────────────────────────┘                  │
│                                                              │
│ Job Data Summary:                                           │
│  • Total Jobs: 35                                           │
│  • Male-dominated: 15 classes                               │
│  • Female-dominated: 18 classes                             │
│  • Balanced: 2 classes                                      │
│                                                              │
│ Implementation Report: ✓ Complete                           │
│  • Job Evaluation: Hay Point System                         │
│  • Benefits Evaluated: Yes                                  │
│  • Official Approval: City Council, March 1, 2024           │
│  • Total Payroll: $12,450,000                               │
│                                                              │
│ [View Full Report] [View Jobs] [View Notes]                │
│                                                              │
│ Admin Action:                                               │
│ ┌──────────────────────────────────────────────┐            │
│ │ Approval Notes (Optional):                   │            │
│ │ [________________________________]            │            │
│ └──────────────────────────────────────────────┘            │
│                                                              │
│ [ Approve ]  [ Reject ]  [ Request Info ]  [ Cancel ]       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.4 Responsive Design

**Mobile Considerations:**
- Single column layout on small screens
- Hamburger menu for navigation
- Touch-friendly buttons (minimum 44x44px)
- Tables convert to cards on mobile
- Forms stack vertically
- Modals become full-screen
- Hide less critical information
- Swipe gestures for navigation (optional)

**Tablet Considerations:**
- Two-column layouts where appropriate
- Sidebar can be persistent or collapsible
- Tables remain tabular with horizontal scroll
- Larger touch targets

**Desktop Optimization:**
- Multi-column layouts for efficiency
- Persistent sidebar navigation
- Hover states for interactivity
- Keyboard shortcuts
- Drag-and-drop functionality (optional)

### 8.5 Loading and Error States

**Loading Indicators:**
- Page Load: Full-page spinner with message
- Component Load: Skeleton screens
- Button Actions: Spinner in button, disabled state
- Table Data: Row-level skeletons

**Error States:**
- Network Error: Retry button with message
- 404 Not Found: Friendly page with navigation
- 403 Forbidden: Clear message about permissions
- 500 Server Error: Generic message with support contact
- Form Validation: Inline error messages with guidance

**Empty States:**
- No Data: Friendly message with action button
- No Search Results: Clear message with tips
- No Reports: Onboarding message guiding user

---

## 9. TESTING REQUIREMENTS

### 9.1 Unit Testing

**Backend (ASP.NET Core):**

**Test Coverage Goals: 80%+**

**Service Layer Tests:**
- ComplianceAnalysisService
  - Test each compliance test algorithm
  - Test edge cases (0 jobs, all male, all female)
  - Test statistical calculations accuracy
  - Test predicted pay regression
  - Test t-test calculations

- ReportService
  - Test report creation
  - Test status transitions
  - Test validation rules
  - Test approval logic

- JobClassificationService
  - Test CRUD operations
  - Test validation
  - Test gender classification logic
  - Test import functionality

- EmailService
  - Test template rendering
  - Test recipient filtering
  - Test email queue management

**Repository Layer Tests:**
- Test data access patterns
- Test filtering and sorting
- Test pagination
- Mock database context

**API Controller Tests:**
- Test authorization attributes
- Test model binding
- Test action results
- Test error handling

**Validation Tests:**
- Test all FluentValidation validators
- Test custom validation logic
- Test error messages

**Utility Tests:**
- Test PDF generation
- Test Excel generation
- Test CSV parsing
- Test data transformation

**Testing Frameworks:**
- xUnit or NUnit for test framework
- Moq for mocking
- FluentAssertions for readable assertions
- AutoFixture for test data generation

### 9.2 Integration Testing

**API Integration Tests:**

**Authentication & Authorization:**
- Test user login with valid credentials
- Test user login with invalid credentials
- Test jurisdiction filtering
- Test admin access to all data
- Test user restricted access
- Test token refresh mechanism

**Jurisdiction Management:**
- Test create jurisdiction
- Test update jurisdiction
- Test delete jurisdiction (cascade)
- Test jurisdiction approval workflow

**Report Management:**
- Test create report
- Test update report
- Test delete report
- Test report submission
- Test multi-case creation
- Test status transitions

**Job Classification:**
- Test bulk job creation
- Test job copy from previous report
- Test Excel import
- Test job validation

**Compliance Analysis:**
- Test full compliance calculation pipeline
- Test with real-world data samples
- Test edge cases
- Test performance with large datasets

**Approval Workflow:**
- Test auto-approval logic
- Test manual approval
- Test rejection
- Test certificate generation

**Email System:**
- Test email template rendering
- Test bulk sending
- Test history logging

**Database Integration:**
- Test transactions and rollbacks
- Test concurrent access
- Test RLS policies
- Test data integrity constraints

**Testing Tools:**
- Integration test server (TestServer)
- In-memory database or test database
- HTTP client for API calls
- Database seeding for test data

### 9.3 User Acceptance Testing (UAT)

**UAT Plan:**

**Phase 1: Smoke Testing**
- Verify deployment successful
- Test basic login/logout
- Test main navigation
- Verify database connectivity

**Phase 2: Functional Testing**

**User Role: Standard User**
- Complete full report workflow
- Create new report
- Enter jobs manually
- Run compliance analysis
- Complete implementation form
- Submit report
- Verify can download certificate (if approved)

**User Role: Admin**
- Review pending submissions
- Approve a compliant case
- Reject a non-compliant case
- Create case notes
- Send bulk email
- Generate reports

**Phase 3: Scenario Testing**

**Scenario 1: Simple Compliant Case**
- Small jurisdiction (< 50 jobs)
- Clearly in compliance
- Should auto-approve immediately

**Scenario 2: Complex Non-Compliant Case**
- Large jurisdiction (200+ jobs)
- Fails one or more tests
- Requires manual review
- Admin provides feedback

**Scenario 3: Alternative Analysis**
- Jurisdiction with 3 or fewer male classes
- System flags for manual review
- Admin reviews and approves based on documentation

**Scenario 4: Multi-Case Report**
- Jurisdiction creates Case 1 (annual report)
- Later creates Case 2 (correction)
- Both tracked independently
- No conflicts in system

**Scenario 5: Data Import**
- User imports jobs from Excel
- Validates data quality
- Identifies and fixes errors
- Successfully submits

**Phase 4: Usability Testing**
- Task completion rates
- Time to complete tasks
- User satisfaction surveys
- Confusion points identification
- Accessibility testing with assistive technologies

**Phase 5: Performance Testing**
- Test with concurrent users (25, 50, 100)
- Test large dataset operations (500+ jobs)
- Test report generation speed
- Test database query performance
- Test export file generation

**UAT Success Criteria:**
- 100% of critical path scenarios pass
- 95%+ of functional tests pass
- User satisfaction score 4+/5
- No severity 1 bugs
- Task completion rate > 90%

**UAT Participants:**
- 3-5 jurisdiction users
- 2-3 admin users
- 1-2 new users (minimal training)

**UAT Duration:** 2-3 weeks with daily regression

### 9.4 Performance Testing

**Load Testing:**
- Concurrent Users: 100 simultaneous
- Transactions per Second: Target 50 TPS
- Database Queries: < 200ms average
- API Response Times: < 500ms average (95th percentile)

**Stress Testing:**
- Push system to failure point
- Identify breaking points
- Test recovery mechanisms
- Test error handling under load

**Scalability Testing:**
- Test with growing data volume
- 1,000+ jurisdictions
- 10,000+ reports
- 500,000+ jobs
- Verify performance remains acceptable

**Endurance Testing:**
- Run system for 24-48 hours
- Monitor for memory leaks
- Monitor database connections
- Monitor CPU/memory usage

**Performance Tools:**
- Apache JMeter or k6
- Application Insights or New Relic
- Database profiling tools
- Network monitoring tools

### 9.5 Security Testing

**Penetration Testing:**
- SQL injection attempts
- XSS attack attempts
- CSRF attack attempts
- Authentication bypass attempts
- Authorization bypass attempts
- Session hijacking attempts

**Vulnerability Scanning:**
- Automated scanning (OWASP ZAP, Burp Suite)
- Dependency vulnerability checking
- SSL/TLS configuration review
- HTTP header security review

**Security Audit:**
- Code review for security issues
- Configuration review
- Access control review
- Data encryption review

**Compliance Testing:**
- OWASP Top 10 verification
- NIST guidelines compliance
- State security requirements

---

## 10. DEPLOYMENT AND OPERATIONS

### 10.1 Deployment Architecture

**Production Environment:**

**Web Application Tier:**
- ASP.NET Core Web API
- Hosted on: Azure App Service, AWS Elastic Beanstalk, or IIS on Windows Server
- Configuration:
  - 2+ instances for high availability
  - Load balancer (Azure Load Balancer, AWS ALB, or IIS ARR)
  - Auto-scaling based on CPU/memory
- Platform:
  - .NET 8.0 runtime
  - Windows Server 2022 or Linux (Ubuntu 22.04)

**Database Tier:**
- PostgreSQL 15+
- Hosted on: Supabase, Azure Database for PostgreSQL, AWS RDS, or self-hosted
- Configuration:
  - Primary + Read Replica for performance
  - Automated backups (daily)
  - Point-in-time recovery enabled
  - Connection pooling (pgBouncer)
- Storage:
  - 100GB initial, auto-grow enabled
  - SSD storage for performance

**Storage:**
- Azure Blob Storage, AWS S3, or file system for:
  - PDF certificates
  - Excel exports
  - Email attachments (future)

**Monitoring & Logging:**
- Application Insights (Azure) or CloudWatch (AWS)
- Structured logging (Serilog)
- Centralized log aggregation
- Real-time alerting

**Security:**
- TLS/SSL certificate (Let's Encrypt or commercial)
- Web Application Firewall (Azure WAF, AWS WAF)
- DDoS protection
- Regular security updates

### 10.2 Deployment Process

**Build Pipeline (CI):**
1. Code commit to Git repository (GitHub, Azure DevOps, GitLab)
2. Automated build triggered
3. Run unit tests
4. Run static code analysis (SonarQube)
5. Build Docker image or publish artifacts
6. Push to artifact repository

**Release Pipeline (CD):**

**Staging Environment:**
1. Deploy to staging environment
2. Run integration tests
3. Run smoke tests
4. Manual verification by QA team
5. Approval gate

**Production Environment:**
1. Blue-green deployment or rolling update
2. Deploy to production
3. Health check verification
4. Smoke tests
5. Monitor for errors
6. Rollback if issues detected

**Deployment Tools:**
- Azure DevOps Pipelines
- GitHub Actions
- Jenkins
- Docker + Kubernetes (optional)

**Deployment Checklist:**
- [ ] Database migrations applied
- [ ] Configuration updated
- [ ] Secrets rotated
- [ ] SSL certificate valid
- [ ] Backups verified
- [ ] Monitoring enabled
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### 10.3 Configuration Management

**Application Settings:**

**Environment-Specific:**
- Connection strings
- API keys
- Email SMTP settings
- Storage account keys
- Logging levels

**Configuration Sources:**
- appsettings.json (base)
- appsettings.{Environment}.json (overrides)
- Environment variables (secrets)
- Azure Key Vault or AWS Secrets Manager (production)

**Sample Configuration:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.example.com;Database=payequity;..."
  },
  "Authentication": {
    "JwtSecret": "***",
    "TokenExpirationHours": 24
  },
  "Email": {
    "SmtpHost": "smtp.example.com",
    "SmtpPort": 587,
    "FromAddress": "noreply@payequity.mn.gov"
  },
  "Features": {
    "EnableEmailNotifications": true,
    "EnableAutoApproval": true
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning"
    }
  }
}
```

**Configuration Best Practices:**
- Never commit secrets to source control
- Use separate configurations per environment
- Validate configuration on startup
- Log configuration errors clearly
- Rotate secrets regularly

### 10.4 Backup and Recovery

**Backup Strategy:**

**Database Backups:**
- **Frequency:**
  - Full backup: Daily at 2:00 AM
  - Differential backup: Every 6 hours
  - Transaction log backup: Every 15 minutes
- **Retention:**
  - Daily backups: 30 days
  - Weekly backups: 12 weeks
  - Monthly backups: 12 months
  - Annual backups: 7 years (compliance)
- **Storage:**
  - Primary: Same region
  - Secondary: Different region (geo-redundant)
  - Offline: Tape or cold storage (annual)

**Application Backups:**
- Configuration files: Daily
- Deployed code: Per deployment
- Certificates: Weekly

**File Storage Backups:**
- PDFs and exports: Daily incremental
- 30-day retention

**Backup Testing:**
- Monthly restore test to verify backup integrity
- Quarterly disaster recovery drill
- Document restore procedures

**Recovery Procedures:**

**Database Restore:**
1. Identify restore point needed
2. Stop application to prevent writes
3. Restore database from backup
4. Verify data integrity
5. Restart application
6. Validate system functionality

**Application Restore:**
1. Identify last known good deployment
2. Roll back to previous version
3. Verify configuration
4. Test critical paths

**Disaster Recovery:**
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 15 minutes
- Geo-redundant deployment (optional)
- Documented DR runbook

### 10.5 Monitoring and Alerting

**Application Monitoring:**

**Key Metrics:**
- Request rate (requests/minute)
- Response time (average, 95th percentile)
- Error rate (4xx, 5xx)
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Database connections (active, waiting)

**Business Metrics:**
- New reports created
- Reports submitted
- Reports approved/rejected
- User logins
- Failed login attempts
- Compliance rate

**Monitoring Tools:**
- Application Performance Monitoring (APM): Application Insights, New Relic, Datadog
- Infrastructure Monitoring: Azure Monitor, CloudWatch, Prometheus
- Uptime Monitoring: Pingdom, StatusCake

**Alerting Rules:**

**Critical (Immediate Page):**
- Application down (5+ minutes)
- Database down
- Error rate > 5%
- Response time > 5 seconds (95th percentile)
- Disk space < 10%

**Warning (Email/Slack):**
- Error rate > 2%
- Response time > 2 seconds
- CPU > 80% (sustained)
- Memory > 85%
- Failed login attempts > 10 per minute

**Informational (Dashboard):**
- New user registrations
- Reports submitted
- Compliance trends

**Alerting Channels:**
- PagerDuty or similar for critical
- Email for warnings
- Slack/Teams for informational
- Dashboard for real-time visibility

**Logging:**

**Log Levels:**
- Error: Exceptions, failures
- Warning: Deprecations, validation failures
- Information: Key business events, user actions
- Debug: Detailed diagnostics (dev/staging only)

**Log Structure:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "Information",
  "message": "Report submitted",
  "userId": "user-123",
  "jurisdictionId": "12345",
  "reportId": "report-456",
  "properties": {
    "reportYear": 2024,
    "caseNumber": 1
  }
}
```

**Log Retention:**
- 90 days in hot storage (searchable)
- 1 year in cold storage (archived)
- 7 years offline (compliance)

**Log Analysis:**
- Centralized logging (ELK stack, Splunk, Azure Log Analytics)
- Correlation IDs for request tracing
- Sensitive data redaction

### 10.6 Maintenance and Support

**Maintenance Windows:**
- Scheduled: Sunday 1:00 AM - 5:00 AM (minimal user impact)
- Frequency: Monthly or as needed
- Notification: 1 week advance notice

**Maintenance Activities:**
- Database maintenance (VACUUM, REINDEX)
- Certificate renewal
- Security patching
- Dependency updates
- Performance tuning

**Support Tiers:**

**Tier 1: User Support**
- Email: support@payequity.mn.gov
- Response time: 24 hours (business days)
- Handles: Account issues, how-to questions, data questions

**Tier 2: Technical Support**
- Escalated from Tier 1
- Response time: 4 hours (business hours)
- Handles: Bugs, system errors, data issues

**Tier 3: Development Team**
- Escalated from Tier 2
- Response time: Immediate for critical, 24 hours for others
- Handles: Code fixes, architecture issues, major bugs

**Support Process:**
1. User submits ticket (email, portal)
2. Tier 1 triages and resolves or escalates
3. Tier 2 investigates and resolves or escalates
4. Tier 3 (dev team) fixes and deploys
5. User notified of resolution
6. Ticket closed

**Knowledge Base:**
- User guide (comprehensive)
- FAQ (common questions)
- Video tutorials (key workflows)
- API documentation (for developers)
- Troubleshooting guides

### 10.7 Compliance and Audit

**Audit Requirements:**
- All user actions logged
- Admin actions especially detailed
- Log retention per state requirements
- Audit reports generated quarterly

**Compliance Checks:**
- Annual security audit
- Quarterly vulnerability scan
- Monthly backup restore test
- Weekly security update review

**Documentation:**
- System architecture diagram
- Data flow diagram
- Security policies
- Disaster recovery plan
- User access procedures
- Change management process

**Certifications (if required):**
- SOC 2 Type II
- NIST 800-53 compliance
- State-specific security standards

---

## APPENDICES

### Appendix A: Business Rules Summary

**Gender Classification:**
- Male-dominated: ≥ 80% male
- Female-dominated: ≥ 70% female
- Balanced: < 80% male AND < 70% female

**Compliance Thresholds:**
- Salary Range Test: Ratio ≥ 0.80
- Exceptional Service Test: Ratio ≥ 0.80 (if applicable)
- Underpayment Ratio: ≥ 80%

**Auto-Approval Criteria:**
- All compliance tests pass
- No manual review flag
- Submitted by deadline
- All required data complete

**Manual Review Triggers:**
- Three or fewer male classes
- Significant data anomalies
- Previous non-compliance
- Late submission

### Appendix B: Calculation Formulas

**Linear Regression (Predicted Pay):**
```
Slope = (n * Σ(x*y) - Σx * Σy) / (n * Σ(x²) - (Σx)²)
Intercept = (Σy - Slope * Σx) / n
Predicted Pay = Slope * Points + Intercept
```

**T-Test:**
```
T = (Mean1 - Mean2) / Pooled SE
Pooled SE = SQRT((Var1 / n1) + (Var2 / n2))
DF = n1 + n2 - 2
```

**Ratios:**
```
Salary Range Ratio = Male Avg Years / Female Avg Years
Exceptional Service Ratio = Female % / Male %
Underpayment Ratio = (Male % Below / Female % Below) * 100
```

### Appendix C: Data Dictionary

See Section 6 (Database Schema) for complete field definitions.

### Appendix D: API Endpoint Reference

**Authentication:**
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Jurisdictions:**
- GET /api/jurisdictions
- GET /api/jurisdictions/{id}
- POST /api/jurisdictions
- PUT /api/jurisdictions/{id}
- DELETE /api/jurisdictions/{id}

**Contacts:**
- GET /api/jurisdictions/{id}/contacts
- POST /api/jurisdictions/{id}/contacts
- PUT /api/contacts/{id}
- DELETE /api/contacts/{id}

**Reports:**
- GET /api/jurisdictions/{id}/reports
- GET /api/reports/{id}
- POST /api/reports
- PUT /api/reports/{id}
- DELETE /api/reports/{id}
- POST /api/reports/{id}/submit
- POST /api/reports/{id}/share

**Jobs:**
- GET /api/reports/{id}/jobs
- POST /api/reports/{id}/jobs
- POST /api/reports/{id}/jobs/bulk
- POST /api/reports/{id}/jobs/copy
- POST /api/reports/{id}/jobs/import
- PUT /api/jobs/{id}
- DELETE /api/jobs/{id}

**Compliance:**
- GET /api/reports/{id}/compliance
- POST /api/reports/{id}/analyze

**Implementation:**
- GET /api/reports/{id}/implementation
- POST /api/reports/{id}/implementation
- PUT /api/reports/{id}/implementation

**Admin:**
- GET /api/admin/dashboard
- GET /api/admin/approvals
- GET /api/admin/approvals/{id}
- POST /api/admin/approvals/{id}/approve
- POST /api/admin/approvals/{id}/reject
- GET /api/admin/notes
- POST /api/admin/notes
- PUT /api/admin/notes/{id}
- DELETE /api/admin/notes/{id}

**Export:**
- GET /api/reports/{id}/export/excel
- GET /api/reports/{id}/export/pdf
- GET /api/reports/{id}/certificate

### Appendix E: Error Codes

**Standard HTTP Status Codes:**
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation failed)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (duplicate, constraint violation)
- 500: Internal Server Error

**Custom Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred",
    "details": [
      {
        "field": "max_salary",
        "message": "Maximum salary must be greater than minimum salary"
      }
    ]
  }
}
```

---

## DOCUMENT REVISION HISTORY

| Version | Date       | Author                  | Changes                      |
|---------|------------|-------------------------|------------------------------|
| 1.0     | 2024-01-15 | System Analysis Team    | Initial draft                |
| 1.1     | 2024-01-20 | Development Team Review | Technical details added      |
| 1.2     | 2024-01-25 | Stakeholder Review      | Business logic clarifications|
| 2.0     | 2024-02-01 | Final Review            | Approved for development     |

---

**END OF FUNCTIONAL SPECIFICATION DOCUMENT**
