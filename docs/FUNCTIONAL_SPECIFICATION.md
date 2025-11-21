# Minnesota Pay Equity Compliance System
## Functional Specification Document

**Document Version**: 2.0  
**Last Updated**: November 21, 2025  
**Status**: Approved for Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [User Roles and Permissions](#3-user-roles-and-permissions)
4. [Core Features](#4-core-features)
5. [Business Logic](#5-business-logic)
6. [User Workflows](#6-user-workflows)
7. [Security and Compliance](#7-security-and-compliance)

---

## 1. Executive Summary

### 1.1 Purpose
This document defines the functional requirements for the Minnesota Pay Equity Compliance System, a web application enabling local government jurisdictions to track, analyze, and report pay equity compliance data to the State of Minnesota.

### 1.2 Scope
The system provides:
- Jurisdiction and contact management
- Pay equity report creation and submission
- Job classification data entry
- Automated compliance analysis using statistical methods
- Certificate generation for compliant jurisdictions
- Administrative oversight and approval workflows
- Email notifications and document management

### 1.3 Target Users
- **Local Government Users**: HR staff from Minnesota cities, counties, and school districts
- **State Administrators**: MMB staff overseeing compliance
- **System Administrators**: Technical staff managing the system

---

## 2. System Overview

### 2.1 Technology Stack
- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication)
- **Hosting**: Web-based application
- **File Generation**: PDF reports and Excel exports

### 2.2 Key Components
1. Authentication System
2. Jurisdiction Management
3. Report Management
4. Job Classification Entry
5. Compliance Analysis Engine
6. Approval Workflow
7. Document Generation
8. Admin Dashboard

---

## 3. User Roles and Permissions

### 3.1 Jurisdiction User
**Permissions**:
- View/edit own jurisdiction
- Create/edit/submit reports
- Enter/manage job data
- View compliance results
- Export reports
- Manage contacts

**Restrictions**:
- Cannot view other jurisdictions
- Cannot approve reports

### 3.2 State Administrator
**Permissions**:
- All jurisdiction user permissions
- View all jurisdictions
- Approve/reject reports
- Add case notes
- Generate compliance reports
- System-wide statistics

### 3.3 Access Control Matrix

| Feature | Jurisdiction User | State Admin |
|---------|------------------|-------------|
| View Own Jurisdiction | ✓ | ✓ |
| View All Jurisdictions | ✗ | ✓ |
| Create/Edit Reports | ✓ | ✓ |
| Approve Reports | ✗ | ✓ |
| Add Case Notes | ✗ | ✓ |
| Admin Dashboard | ✗ | ✓ |

---

## 4. Core Features

### 4.1 Authentication
- Email/password login
- Jurisdiction selection
- Session management (24-hour timeout)
- Password reset functionality
- Failed login tracking (5 attempts = lock)

### 4.2 Dashboard

**Jurisdiction User Dashboard**:
- Welcome message
- Quick stats (total reports, submitted, approved)
- Recent activity
- Quick actions (Create Report, View Reports, Manage Contacts)
- Notifications panel

**Admin Dashboard**:
- System-wide statistics
- Reports by status (chart)
- Recent submissions
- Pending approvals
- Alert panel

### 4.3 Jurisdiction Management

**Jurisdiction Data**:
- Name, Type, County, ID
- Address information
- Status (Active/Inactive)
- Settings (reporting year, notifications)

**Contact Management**:
- First/Last Name, Title, Email, Phone
- Primary contact designation
- Status (Active/Inactive)

### 4.4 Report Management

**Report Types**:
1. Annual Compliance Report
2. Implementation Report
3. Resubmission

**Report Data**:
- Report Year, Case Number (YYYY-NNNN format)
- Status (Draft → In Progress → Submitted → Approved/Needs Revision)
- Created/Modified/Submitted/Approved dates
- Metadata (created by, submitted by, approved by)

**Status Workflow**:
```
Draft → In Progress → Submitted → Under Review → Approved
                                                     ↓
                                              Needs Revision
```

### 4.5 Job Classification Data Entry

**Required Fields**:
- Job Class Title
- Job Value (points)
- Minimum Salary
- Maximum Salary
- Total Employees
- Male Employees
- Female Employees

**Calculated Fields**:
- Midpoint Salary: (Min + Max) / 2
- Male/Female Percentage
- Gender Classification (Male-Dominated, Female-Dominated, Balanced)

**Data Entry Methods**:
1. Single job entry form
2. Excel import
3. Copy from previous year

**Validation Rules**:
- Male + Female = Total employees
- Max Salary ≥ Min Salary
- Job Value ≥ 0
- All currency values > 0

### 4.6 Compliance Analysis

**Analysis Components**:
1. Gender classification
2. Linear regression (predicted pay)
3. Underpayment ratio test
4. Alternative analysis (< 4 male-dominated classes)

**Gender Classification Rules**:
- Male-Dominated: ≥ 80% male
- Female-Dominated: ≥ 70% female
- Balanced: All others

**Compliance Determination**:
- Pass: Underpayment Ratio ≥ 80%
- Fail: Underpayment Ratio < 80%

### 4.7 Submission Workflow

**Pre-Submission Checklist**:
- At least 1 job entered
- All fields complete
- No validation errors
- Compliance analysis run

**Submission Process**:
1. User clicks "Submit Report"
2. Final validation
3. Compliance analysis
4. Confirmation
5. Report locked (read-only)
6. Status → "Submitted"
7. Notifications sent
8. Auto-approval check (5-minute delay)

### 4.8 Auto-Approval

**Criteria**:
- All compliance tests passed
- No data anomalies
- ≥ 4 male-dominated classes
- Submitted by deadline
- No manual review flag

**If Auto-Approved**:
- Status → "Approved"
- Certificate generated
- Email sent

**If Manual Review Needed**:
- Status → "Under Review"
- Admin notified
- Added to approval queue

### 4.9 Certificate Generation

**Certificate Content**:
- MMB logo
- Certificate title
- Jurisdiction name, year, case number
- Approval date
- Compliance statement
- Digital signature
- Certificate ID
- QR code for verification

**Format**: PDF, letter size, non-editable

### 4.10 Notifications

**Email Triggers**:
1. Report Submitted
2. Report Approved
3. Report Needs Revision
4. Auto-Approval Completed
5. Account Created
6. Password Reset
7. Deadline Reminder (30 days before)
8. Deadline Passed

**In-App Notifications**:
- Displayed on dashboard
- Unread count badge
- Click to view and navigate
- 30-day retention

### 4.11 Export Formats

**Excel Export**:
- Report metadata
- Job classifications
- Compliance analysis
- Summary statistics

**PDF Export**:
- Cover page
- Executive summary
- Job table
- Compliance results
- Certificate (if approved)

---

## 5. Business Logic

### 5.1 Gender Classification

```
Male % = (Male / Total) × 100
Female % = (Female / Total) × 100

IF Male % ≥ 80 THEN "Male-Dominated"
ELSE IF Female % ≥ 70 THEN "Female-Dominated"
ELSE "Balanced"
```

### 5.2 Linear Regression

**Purpose**: Calculate predicted pay for female-dominated classes based on male-dominated classes

**Inputs**:
- Male-dominated classes only
- x = Job Value
- y = Midpoint Salary

**Formulas**:
```
Slope (b) = (n × Σ(xy) - Σx × Σy) / (n × Σ(x²) - (Σx)²)
Intercept (a) = (Σy - b × Σx) / n
Predicted Pay = a + b × Job Value
```

**R² Calculation**:
```
SS_res = Σ(Actual - Predicted)²
SS_tot = Σ(Actual - Mean)²
R² = 1 - (SS_res / SS_tot)
```

### 5.3 Underpayment Ratio Test

**Calculation**:
```
For each class:
  IF Actual Midpoint < Predicted Midpoint THEN
    Count employees as "below predicted"

Male % Below = (Male Employees Below / Total Male) × 100
Female % Below = (Female Employees Below / Total Female) × 100

IF Female % Below > 0 THEN
  Underpayment Ratio = (Male % Below / Female % Below) × 100
ELSE
  Underpayment Ratio = 100 (automatic pass)
```

**Pass Criteria**: Underpayment Ratio ≥ 80%

### 5.4 Overall Compliance

```
IF Underpayment Ratio ≥ 80% THEN
  Overall Compliance = PASS
ELSE
  Overall Compliance = FAIL
```

### 5.5 Alternative Analysis

**Trigger**: < 4 male-dominated classes

**Method**: Use all job classes for regression (flagged for manual review)

---

## 6. User Workflows

### 6.1 Annual Reporting Workflow

```
1. Notification Sent (30 days before deadline)
2. User Logs In
3. Create New Report
4. Enter Job Data (single/import/copy)
5. Run Compliance Analysis (preview)
6. Submit Report
7. Auto-Approval Check
8a. Auto-Approved → Certificate → Email
8b. Manual Review → Admin Reviews → Approve/Reject
```

### 6.2 Admin Review Workflow

```
1. Navigate to Pending Approvals
2. Select Report
3. View: Jurisdiction info, report data, historical data, case notes
4. Decision:
   - Approve → Certificate → Email → Status: Approved
   - Request Revision → Feedback → Email → Status: Needs Revision
```

### 6.3 Resubmission Workflow

```
1. Admin Requests Revision
2. User Receives Email
3. User Reopens Report
4. System Creates New Revision (preserves original)
5. User Makes Corrections
6. User Resubmits
7. Follow Standard Approval Workflow
```

---

## 7. Security and Compliance

### 7.1 Authentication
- Passwords hashed with bcrypt (10+ rounds)
- Session tokens expire after 24 hours
- Failed login tracking (5 attempts = 15-minute lock)

### 7.2 Authorization
- Row-Level Security (RLS) at database level
- Jurisdiction users see only their data
- Admin users see all data
- Role-based access control (RBAC)

### 7.3 Data Protection
- HTTPS/TLS 1.3 for all connections
- Database encryption at rest
- File storage encryption
- No PII beyond system requirements

### 7.4 Audit Logging
**Logged Events**:
- User login/logout
- Report creation/submission/approval
- Job data modifications
- Admin actions
- Failed authentication attempts

**Log Retention**: 7 years

### 7.5 Input Validation
- Server-side validation (required)
- Type checking
- Length limits
- Format validation
- Business rule validation
- SQL injection prevention
- XSS prevention

### 7.6 Rate Limiting
- 100 requests/minute per user (general)
- 10 requests/minute per IP (auth)
- 429 response when exceeded

---

## APPENDICES

### Appendix A: Business Rules Summary

**Gender Classification**:
- Male-dominated: ≥ 80% male
- Female-dominated: ≥ 70% female
- Balanced: < 80% male AND < 70% female

**Compliance Thresholds**:
- Underpayment Ratio: ≥ 80%

**Auto-Approval Criteria**:
- All compliance tests pass
- No manual review flag
- Submitted by deadline
- All required data complete

**Manual Review Triggers**:
- ≤ 3 male-dominated classes
- Significant data anomalies
- Previous non-compliance
- Late submission

### Appendix B: Calculation Formulas

**Linear Regression**:
```
Slope = (n × Σ(xy) - Σx × Σy) / (n × Σ(x²) - (Σx)²)
Intercept = (Σy - Slope × Σx) / n
Predicted Pay = Slope × Points + Intercept
```

**Underpayment Ratio**:
```
Male % Below = (Male Employees Below / Total Male) × 100
Female % Below = (Female Employees Below / Total Female) × 100
Underpayment Ratio = (Male % Below / Female % Below) × 100
```

### Appendix C: API Endpoint Reference

**Authentication**:
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Jurisdictions**:
- GET /api/jurisdictions
- GET /api/jurisdictions/{id}
- POST /api/jurisdictions
- PUT /api/jurisdictions/{id}

**Reports**:
- GET /api/jurisdictions/{id}/reports
- GET /api/reports/{id}
- POST /api/reports
- PUT /api/reports/{id}
- POST /api/reports/{id}/submit

**Jobs**:
- GET /api/reports/{id}/jobs
- POST /api/reports/{id}/jobs
- POST /api/reports/{id}/jobs/bulk
- POST /api/reports/{id}/jobs/import
- PUT /api/jobs/{id}
- DELETE /api/jobs/{id}

**Compliance**:
- GET /api/reports/{id}/compliance
- POST /api/reports/{id}/analyze

**Admin**:
- GET /api/admin/dashboard
- GET /api/admin/approvals
- POST /api/admin/approvals/{id}/approve
- POST /api/admin/approvals/{id}/reject
- GET /api/admin/notes
- POST /api/admin/notes

**Export**:
- GET /api/reports/{id}/export/excel
- GET /api/reports/{id}/export/pdf
- GET /api/reports/{id}/certificate

### Appendix D: Error Codes

**HTTP Status Codes**:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation failed)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Internal Server Error

---

## DOCUMENT REVISION HISTORY

| Version | Date       | Author                  | Changes                      |
|---------|------------|-------------------------|------------------------------|
| 1.0     | 2024-01-15 | System Analysis Team    | Initial draft                |
| 2.0     | 2025-11-21 | System Analysis Team    | Complete functional spec     |

---

**END OF FUNCTIONAL SPECIFICATION DOCUMENT**
