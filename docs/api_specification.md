# Minnesota Pay Equity Compliance System
## RESTful API Specification

**Version:** 1.0  
**Date:** November 2024  
**Base URL:** `https://api.payequity.mn.gov/api/v1`  
**Authentication:** JWT Bearer Token

---

## TABLE OF CONTENTS

1. [Authentication Endpoints](#authentication-endpoints)
2. [Jurisdiction Endpoints](#jurisdiction-endpoints)
3. [Contact Endpoints](#contact-endpoints)
4. [Report Endpoints](#report-endpoints)
5. [Job Classification Endpoints](#job-classification-endpoints)
6. [Compliance Endpoints](#compliance-endpoints)
7. [Implementation Endpoints](#implementation-endpoints)
8. [Admin Endpoints](#admin-endpoints)
9. [Export Endpoints](#export-endpoints)
10. [Common Models](#common-models)

---

## 1. AUTHENTICATION ENDPOINTS

### POST /api/v1/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@jurisdiction.gov",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "jurisdictionId": "12345",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "userId": "guid",
    "email": "user@jurisdiction.gov",
    "message": "Registration successful. Please check your email to verify your account."
  }
}
```

### POST /api/v1/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@jurisdiction.gov",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "guid",
      "email": "user@jurisdiction.gov",
      "firstName": "John",
      "lastName": "Doe",
      "role": "JurisdictionUser",
      "jurisdictionId": "12345"
    }
  }
}
```

### POST /api/v1/auth/refresh-token
Refresh expired JWT token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

### POST /api/v1/auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@jurisdiction.gov"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent if account exists."
}
```

### POST /api/v1/auth/reset-password
Reset password using token from email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successful."
}
```

---

## 2. JURISDICTION ENDPOINTS

### GET /api/v1/jurisdictions
List jurisdictions (admin only).

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 20, max: 100)
- `search` (string): Search by name or ID
- `type` (string): Filter by jurisdiction type
- `isActive` (bool): Filter by active status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "jurisdictionId": "12345",
      "name": "City of Minneapolis",
      "type": "Municipal",
      "address": "350 South 5th Street",
      "city": "Minneapolis",
      "state": "MN",
      "zipCode": "55415",
      "phone": "(612) 673-3000",
      "isActive": true,
      "nextReportYear": 2027,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 43,
    "totalItems": 850,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### GET /api/v1/jurisdictions/{id}
Get jurisdiction details.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "jurisdictionId": "12345",
    "name": "City of Minneapolis",
    "type": "Municipal",
    "address": "350 South 5th Street",
    "city": "Minneapolis",
    "state": "MN",
    "zipCode": "55415",
    "phone": "(612) 673-3000",
    "fax": "(612) 673-3250",
    "nextReportYear": 2027,
    "followUpType": "annual_check",
    "followUpDate": "2025-01-31",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-06-20T14:22:00Z"
  }
}
```

### POST /api/v1/jurisdictions
Create new jurisdiction (admin only).

**Request:**
```json
{
  "jurisdictionId": "12346",
  "name": "City of St. Paul",
  "type": "Municipal",
  "address": "390 City Hall",
  "city": "Saint Paul",
  "state": "MN",
  "zipCode": "55102",
  "phone": "(651) 266-8989"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "jurisdictionId": "12346",
    "name": "City of St. Paul",
    ...
  }
}
```

### PUT /api/v1/jurisdictions/{id}
Update jurisdiction.

**Request:**
```json
{
  "name": "City of Saint Paul",
  "phone": "(651) 266-8000",
  "address": "390 City Hall"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "jurisdictionId": "12346",
    "name": "City of Saint Paul",
    ...
  }
}
```

### DELETE /api/v1/jurisdictions/{id}
Delete jurisdiction (soft delete, admin only).

**Response:** `204 No Content`

---

## 3. CONTACT ENDPOINTS

### GET /api/v1/jurisdictions/{jurisdictionId}/contacts
List contacts for a jurisdiction.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "jurisdictionId": "guid",
      "name": "Jane Smith",
      "title": "HR Director",
      "email": "jane.smith@jurisdiction.gov",
      "phone": "(612) 673-3100",
      "isPrimary": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/v1/contacts/{id}
Get contact details.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "jurisdictionId": "guid",
    "name": "Jane Smith",
    "title": "HR Director",
    "email": "jane.smith@jurisdiction.gov",
    "phone": "(612) 673-3100",
    "isPrimary": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-06-20T14:22:00Z"
  }
}
```

### POST /api/v1/jurisdictions/{jurisdictionId}/contacts
Create new contact.

**Request:**
```json
{
  "name": "John Doe",
  "title": "Finance Manager",
  "email": "john.doe@jurisdiction.gov",
  "phone": "(612) 673-3200",
  "isPrimary": false
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "name": "John Doe",
    ...
  }
}
```

### PUT /api/v1/contacts/{id}
Update contact.

**Request:**
```json
{
  "title": "Senior Finance Manager",
  "phone": "(612) 673-3201"
}
```

**Response:** `200 OK`

### DELETE /api/v1/contacts/{id}
Delete contact.

**Response:** `204 No Content`

---

## 4. REPORT ENDPOINTS

### GET /api/v1/reports
List reports (filtered by user's jurisdiction unless admin).

**Query Parameters:**
- `page` (int): Page number
- `pageSize` (int): Items per page
- `reportYear` (int): Filter by year
- `caseStatus` (string): Filter by status
- `approvalStatus` (string): Filter by approval status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "jurisdictionId": "guid",
      "jurisdictionName": "City of Minneapolis",
      "reportYear": 2024,
      "caseNumber": 1,
      "caseDescription": "Annual Pay Equity Report",
      "caseStatus": "Submitted",
      "complianceStatus": "In Compliance",
      "approvalStatus": "auto_approved",
      "submittedAt": "2024-01-28T15:30:00Z",
      "approvedAt": "2024-01-28T15:35:00Z",
      "revisionCount": 0,
      "isResubmission": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### GET /api/v1/reports/{id}
Get report details.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "jurisdictionId": "guid",
    "reportYear": 2024,
    "caseNumber": 1,
    "caseDescription": "Annual Pay Equity Report",
    "caseStatus": "Submitted",
    "complianceStatus": "In Compliance",
    "approvalStatus": "auto_approved",
    "submittedAt": "2024-01-28T15:30:00Z",
    "approvedAt": "2024-01-28T15:35:00Z",
    "approvedBy": "Auto-Approval System",
    "submittedOnTime": true,
    "submissionDeadline": "2024-01-31",
    "revisionCount": 0,
    "isResubmission": false,
    "workflowStatus": "finalized",
    "testResults": {
      "underpaymentRatioPassed": true,
      "salaryRangeTestPassed": true,
      "exceptionalServiceTestPassed": true
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-28T15:35:00Z"
  }
}
```

### POST /api/v1/reports
Create new report.

**Request:**
```json
{
  "reportYear": 2027,
  "caseDescription": "Triennial Pay Equity Report 2027"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "reportYear": 2027,
    "caseNumber": 1,
    "caseDescription": "Triennial Pay Equity Report 2027",
    "caseStatus": "Private",
    "approvalStatus": "draft",
    ...
  }
}
```

### PUT /api/v1/reports/{id}
Update report.

**Request:**
```json
{
  "caseDescription": "Updated Description",
  "alternativeAnalysisNotes": "Additional notes..."
}
```

**Response:** `200 OK`

### DELETE /api/v1/reports/{id}
Delete report (only if draft).

**Response:** `204 No Content`

### POST /api/v1/reports/{id}/submit
Submit report for review.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "guid",
    "submittedAt": "2024-01-28T15:30:00Z",
    "message": "Report submitted successfully. Processing auto-approval..."
  }
}
```

### POST /api/v1/reports/{id}/reopen
Reopen submitted report for editing.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "guid",
    "caseStatus": "Private",
    "message": "Report reopened for editing. You can now make changes and resubmit."
  }
}
```

### POST /api/v1/reports/{id}/share
Toggle share status (Private ↔ Shared).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reportId": "guid",
    "caseStatus": "Shared",
    "message": "Report is now shared with coordinators."
  }
}
```

### GET /api/v1/reports/{id}/history
Get submission history for report.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "reportId": "guid",
      "actionType": "submitted",
      "previousStatus": "Private",
      "newStatus": "Submitted",
      "performedBy": "user@jurisdiction.gov",
      "createdAt": "2024-01-28T15:30:00Z"
    },
    {
      "id": "guid",
      "reportId": "guid",
      "actionType": "reopened",
      "previousStatus": "Submitted",
      "newStatus": "Private",
      "revisionNotes": "Need to update salary data",
      "performedBy": "user@jurisdiction.gov",
      "createdAt": "2024-01-29T10:00:00Z"
    }
  ]
}
```

---

## 5. JOB CLASSIFICATION ENDPOINTS

### GET /api/v1/reports/{reportId}/jobs
List job classifications for a report.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "reportId": "guid",
      "jobNumber": 1,
      "title": "Administrative Assistant",
      "males": 2,
      "females": 8,
      "points": 150,
      "minSalary": 35000,
      "maxSalary": 45000,
      "yearsToMax": 5,
      "yearsServicePay": 1000,
      "exceptionalServiceCategory": "A",
      "isPartTime": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GET /api/v1/jobs/{id}
Get job classification details.

**Response:** `200 OK`

### POST /api/v1/reports/{reportId}/jobs
Create new job classification.

**Request:**
```json
{
  "jobNumber": 5,
  "title": "IT Specialist",
  "males": 7,
  "females": 3,
  "points": 200,
  "minSalary": 55000,
  "maxSalary": 75000,
  "yearsToMax": 6,
  "isPartTime": false
}
```

**Response:** `201 Created`

### POST /api/v1/reports/{reportId}/jobs/bulk
Bulk create job classifications.

**Request:**
```json
{
  "jobs": [
    {
      "jobNumber": 1,
      "title": "Job Title 1",
      ...
    },
    {
      "jobNumber": 2,
      "title": "Job Title 2",
      ...
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "jobs": [...]
  }
}
```

### POST /api/v1/reports/{reportId}/jobs/copy
Copy jobs from another report.

**Request:**
```json
{
  "sourceReportId": "source-guid",
  "jobIds": ["job-guid-1", "job-guid-2"]  // optional, if empty copies all
}
```

**Response:** `201 Created`

### POST /api/v1/reports/{reportId}/jobs/import
Import jobs from Excel file.

**Request:** `multipart/form-data`
- `file`: Excel file

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "imported": 25,
    "failed": 2,
    "errors": [
      {
        "row": 10,
        "error": "Invalid salary range"
      }
    ]
  }
}
```

### PUT /api/v1/jobs/{id}
Update job classification.

**Request:**
```json
{
  "title": "Updated Title",
  "maxSalary": 80000
}
```

**Response:** `200 OK`

### DELETE /api/v1/jobs/{id}
Delete job classification.

**Response:** `204 No Content`

---

## 6. COMPLIANCE ENDPOINTS

### GET /api/v1/reports/{id}/compliance
Get compliance analysis results.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "isCompliant": true,
    "requiresManualReview": false,
    "message": "Your jurisdiction is in compliance with pay equity requirements.",
    "generalInfo": {
      "maleClasses": 15,
      "femaleClasses": 18,
      "balancedClasses": 12,
      "totalClasses": 45,
      "maleEmployees": 120,
      "femaleEmployees": 135,
      "avgMaxPayMale": 65000,
      "avgMaxPayFemale": 63500
    },
    "statisticalTest": {
      "underpaymentRatio": 85.5,
      "underpaymentRatioPassed": true,
      "malePercentBelowPredicted": 26.7,
      "femalePercentBelowPredicted": 31.2,
      "tTestValue": 1.95,
      "tTestPassed": true,
      "avgDiffMale": -2500,
      "avgDiffFemale": -3200
    },
    "salaryRangeTest": {
      "passed": true,
      "applicable": true,
      "maleAverage": 5.2,
      "femaleAverage": 6.0,
      "ratio": 0.867,
      "threshold": 0.80
    },
    "exceptionalServiceTest": {
      "passed": true,
      "applicable": true,
      "malePercentage": 26.7,
      "femalePercentage": 22.2,
      "ratio": 0.832,
      "threshold": 0.80
    }
  }
}
```

### POST /api/v1/reports/{id}/analyze
Run compliance analysis.

**Response:** `200 OK` (same as GET)

---

## 7. IMPLEMENTATION ENDPOINTS

### GET /api/v1/reports/{id}/implementation
Get implementation form.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "guid",
    "reportId": "guid",
    "evaluationSystem": "Point Factor System",
    "evaluationDescription": "We use a comprehensive point factor system...",
    "healthBenefitsEvaluated": "Yes",
    "healthBenefitsDescription": "Health insurance costs are calculated...",
    "noticeLocation": "City Hall bulletin board and employee portal",
    "approvedByBody": "City Council",
    "chiefElectedOfficial": "John Smith",
    "officialTitle": "Mayor",
    "approvalConfirmed": true,
    "totalPayroll": 5250000,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-28T14:00:00Z"
  }
}
```

### POST /api/v1/reports/{id}/implementation
Create implementation form.

**Request:**
```json
{
  "evaluationSystem": "Point Factor System",
  "evaluationDescription": "Description...",
  "healthBenefitsEvaluated": "Yes",
  "healthBenefitsDescription": "Description...",
  "noticeLocation": "Location...",
  "approvedByBody": "City Council",
  "chiefElectedOfficial": "John Smith",
  "officialTitle": "Mayor",
  "approvalConfirmed": true,
  "totalPayroll": 5250000
}
```

**Response:** `201 Created`

### PUT /api/v1/reports/{id}/implementation
Update implementation form.

**Request:** (same as POST)

**Response:** `200 OK`

---

## 8. ADMIN ENDPOINTS

### GET /api/v1/admin/dashboard/metrics
Get admin dashboard metrics.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "approvals": {
      "pending": 12,
      "approved": 45,
      "rejected": 3,
      "manualReview": 8,
      "avgApprovalTime": 24.5
    },
    "jurisdictions": {
      "total": 850,
      "withActiveReports": 320,
      "inCompliance": 298,
      "outOfCompliance": 15
    },
    "submissions": {
      "last7Days": 15,
      "last30Days": 67,
      "totalThisYear": 245
    }
  }
}
```

### GET /api/v1/admin/approvals
List reports pending approval.

**Query Parameters:**
- `page`, `pageSize`, `status`, `jurisdictionType`

**Response:** `200 OK` (list of reports)

### POST /api/v1/admin/approvals/{id}/approve
Approve a report.

**Request:**
```json
{
  "notes": "Report approved - all requirements met."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Report approved successfully. Certificate generated and sent."
}
```

### POST /api/v1/admin/approvals/{id}/reject
Reject a report.

**Request:**
```json
{
  "reason": "Missing required documentation",
  "notes": "Please provide clarification on..."
}
```

**Response:** `200 OK`

### GET /api/v1/admin/notes
List admin case notes.

**Query Parameters:**
- `page`, `pageSize`, `priority`, `category`, `jurisdictionId`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "noteType": "case",
      "jurisdictionId": "guid",
      "reportId": "guid",
      "title": "Data Quality Issue",
      "content": "Need to follow up on salary ranges...",
      "category": "data-quality",
      "priority": "high",
      "isPinned": false,
      "dueDate": "2024-02-15",
      "createdBy": "admin@mn.gov",
      "createdAt": "2024-01-30T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /api/v1/admin/notes
Create case note.

**Request:**
```json
{
  "noteType": "jurisdiction",
  "jurisdictionId": "guid",
  "title": "Follow-up Required",
  "content": "Need to schedule review...",
  "category": "follow-up",
  "priority": "medium",
  "dueDate": "2024-03-01"
}
```

**Response:** `201 Created`

### PUT /api/v1/admin/notes/{id}
Update case note.

**Response:** `200 OK`

### DELETE /api/v1/admin/notes/{id}
Delete case note.

**Response:** `204 No Content`

### GET /api/v1/admin/submission-analytics
Get submission analytics.

**Query Parameters:**
- `startDate`, `endDate`, `jurisdictionType`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 245,
    "resubmissions": 23,
    "averageRevisions": 0.9,
    "byMonth": [
      {
        "month": "2024-01",
        "submissions": 125,
        "resubmissions": 12
      }
    ],
    "byJurisdictionType": {
      "Municipal": 120,
      "County": 45,
      "School District": 65,
      "Special District": 15
    }
  }
}
```

---

## 9. EXPORT ENDPOINTS

### GET /api/v1/reports/{id}/export/excel
Export report to Excel.

**Response:** `200 OK`
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="Report_2024_Case1.xlsx"`

### GET /api/v1/reports/{id}/export/pdf
Export report to PDF.

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="ComplianceReport_2024_Case1.pdf"`

### GET /api/v1/reports/{id}/certificate
Download compliance certificate.

**Response:** `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="Certificate_Minneapolis_2024.pdf"`

---

## 10. COMMON MODELS

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred",
    "details": [
      {
        "field": "maxSalary",
        "message": "Max salary must be greater than min salary"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-01-30T10:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

### Pagination
```json
{
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful deletion
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate or constraint violation
- `500 Internal Server Error`: Server error

---

**END OF API SPECIFICATION**
