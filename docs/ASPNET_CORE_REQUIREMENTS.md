# Minnesota Pay Equity Compliance System
## Comprehensive Requirements for ASP.NET Core Implementation

**Document Version:** 1.0
**Date:** November 20, 2025
**Purpose:** Complete technical requirements for rebuilding the Pay Equity Compliance System in ASP.NET Core 8.0 with SQL Server

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Requirements](#architecture-requirements)
4. [Database Requirements](#database-requirements)
5. [API Requirements](#api-requirements)
6. [Business Logic Requirements](#business-logic-requirements)
7. [Security Requirements](#security-requirements)
8. [Integration Requirements](#integration-requirements)
9. [Testing Requirements](#testing-requirements)
10. [Deployment Requirements](#deployment-requirements)

---

## Executive Summary

### Project Background

The Minnesota Pay Equity Compliance System is currently built with:
- **Frontend**: React with TypeScript
- **Backend**: Supabase (PostgreSQL + Auto-generated REST API)
- **Infrastructure**: Hosted on Supabase cloud

### Migration Goals

Rebuild the system using:
- **Backend**: ASP.NET Core 8.0 Web API
- **Database**: SQL Server 2019+
- **Architecture**: Clean Architecture (Onion Architecture)
- **Authentication**: JWT-based authentication with Identity Framework
- **Deployment**: Azure App Service or on-premise IIS

### Core Requirements

**Must Have (P0)**:
- 100% functional parity with existing system
- Zero data loss during migration
- Maintain all business rules and compliance calculations
- Support 850+ jurisdictions and 1,200+ users
- Auto-approval system with certificate generation

**Should Have (P1)**:
- Improved performance over current system
- Enhanced reporting capabilities
- Better error handling and logging
- Comprehensive audit trails

**Nice to Have (P2)**:
- Real-time notifications
- Advanced analytics dashboard
- Mobile-responsive admin portal

---

## System Overview

### Current System Analysis

#### Key Features

1. **Jurisdiction Management**
   - 850+ Minnesota local government jurisdictions
   - Contact management
   - Reporting cycle tracking

2. **Pay Equity Reporting**
   - Job classification data entry
   - Compliance analysis (linear regression, statistical tests)
   - Implementation form submission
   - Post-submission workflow (reopen, revise, resubmit)

3. **Compliance Analysis**
   - Linear regression for predicted pay
   - Underpayment ratio calculation (80% threshold)
   - Salary range test
   - Exceptional service pay test
   - Automatic compliance determination

4. **Auto-Approval System**
   - Submission deadline verification (January 31st)
   - Automatic compliance evaluation
   - Certificate generation for compliant reports
   - Manual review flagging for edge cases

5. **Administrative Functions**
   - Report approval dashboard
   - Case notes and tracking
   - Email communications
   - Certificate management

#### Current Database Schema (20+ Tables)

- `jurisdictions` - Local government entities
- `contacts` - Contact persons for jurisdictions
- `reports` - Pay equity reports (one per jurisdiction per cycle)
- `job_classifications` - Job data with salary and point values
- `implementation_reports` - Implementation details
- `submission_history` - Audit trail of submissions
- `report_revisions` - Change tracking for resubmissions
- `approval_history` - Approval workflow tracking
- `compliance_certificates` - Generated certificates
- `admin_case_notes` - Administrative notes
- `email_log` - Email communication tracking
- `audit_log` - System-wide audit trail
- `benefits_worksheet` - Benefits comparison data
- `user_profiles` - User accounts and permissions

#### User Roles

1. **Jurisdiction User**
   - Access only their jurisdiction's data
   - Create and submit reports
   - Manage job classifications
   - Reopen and revise submitted reports

2. **Admin (MMB Pay Equity Staff)**
   - Access all jurisdictions
   - Approve/reject reports
   - Manage case notes
   - Send email communications
   - Generate system reports

---

## Architecture Requirements

### Clean Architecture Pattern

Organize the solution into layers with strict dependency rules:

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│                   (API Controllers)                      │
│                                                          │
│  GET /api/reports                POST /api/reports      │
│  GET /api/jurisdictions          PUT /api/jobs/{id}     │
└────────────────┬─────────────────────────────────────────┘
                 │ Depends on
                 ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│              (Services & Use Cases)                      │
│                                                          │
│  ReportService         ComplianceAnalysisService        │
│  AutoApprovalService   CertificateGeneratorService      │
└────────────────┬─────────────────────────────────────────┘
                 │ Depends on
                 ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│              (Entities & Interfaces)                     │
│                                                          │
│  Report Entity         IReportRepository                │
│  Jurisdiction Entity   IComplianceAnalyzer              │
└────────────────┬─────────────────────────────────────────┘
                 │ Implemented by
                 ▼
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│          (Data Access & External Services)               │
│                                                          │
│  EF Core Repositories    Email Service                  │
│  SQL Server Context      PDF Generator                  │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
PayEquityCompliance.sln
│
├── src/
│   │
│   ├── PayEquity.Domain/
│   │   ├── Entities/
│   │   │   ├── Jurisdiction.cs
│   │   │   ├── Report.cs
│   │   │   ├── JobClassification.cs
│   │   │   └── ...
│   │   ├── Enums/
│   │   │   ├── CaseStatus.cs
│   │   │   ├── ApprovalStatus.cs
│   │   │   └── ...
│   │   ├── Interfaces/
│   │   │   ├── IRepository.cs
│   │   │   ├── IReportRepository.cs
│   │   │   └── ...
│   │   └── ValueObjects/
│   │       ├── Address.cs
│   │       └── ...
│   │
│   ├── PayEquity.Application/
│   │   ├── DTOs/
│   │   │   ├── ReportDto.cs
│   │   │   ├── JobClassificationDto.cs
│   │   │   └── ...
│   │   ├── Services/
│   │   │   ├── ReportService.cs
│   │   │   ├── ComplianceAnalysisService.cs
│   │   │   ├── AutoApprovalService.cs
│   │   │   └── ...
│   │   ├── Interfaces/
│   │   │   ├── IReportService.cs
│   │   │   ├── IComplianceAnalysisService.cs
│   │   │   └── ...
│   │   ├── Validators/
│   │   │   ├── ReportValidator.cs
│   │   │   └── ...
│   │   └── Mappings/
│   │       └── AutoMapperProfile.cs
│   │
│   ├── PayEquity.Infrastructure/
│   │   ├── Data/
│   │   │   ├── PayEquityDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── ReportConfiguration.cs
│   │   │   │   └── ...
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   │   ├── Repository.cs
│   │   │   ├── ReportRepository.cs
│   │   │   └── ...
│   │   └── Services/
│   │       ├── EmailService.cs
│   │       ├── PdfGeneratorService.cs
│   │       └── ...
│   │
│   └── PayEquity.API/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── ReportsController.cs
│       │   ├── JobsController.cs
│       │   ├── JurisdictionsController.cs
│       │   └── ...
│       ├── Middleware/
│       │   ├── ErrorHandlingMiddleware.cs
│       │   └── AuditLoggingMiddleware.cs
│       ├── Filters/
│       │   └── ValidationFilter.cs
│       ├── Configuration/
│       │   ├── DependencyInjection.cs
│       │   └── SwaggerConfiguration.cs
│       ├── Program.cs
│       └── appsettings.json
│
└── tests/
    ├── PayEquity.UnitTests/
    ├── PayEquity.IntegrationTests/
    └── PayEquity.LoadTests/
```

### Technology Stack

**Backend Framework**:
- ASP.NET Core 8.0 Web API
- C# 12.0

**Data Access**:
- Entity Framework Core 8.0
- SQL Server 2019+
- Dapper (for complex queries if needed)

**Authentication & Authorization**:
- ASP.NET Core Identity
- JWT Bearer Authentication
- Role-based authorization

**Libraries & Packages**:
- AutoMapper - Object mapping
- FluentValidation - Input validation
- Serilog - Structured logging
- Hangfire - Background job processing
- iTextSharp or QuestPDF - PDF generation
- EPPlus or NPOI - Excel handling
- Swashbuckle - API documentation (Swagger)
- xUnit - Unit testing
- Moq - Mocking framework

---

## Database Requirements

### SQL Server Schema

#### Core Tables

**1. Jurisdictions**

```sql
CREATE TABLE [dbo].[Jurisdictions] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [JurisdictionId] NVARCHAR(50) NOT NULL UNIQUE,
    [Name] NVARCHAR(200) NOT NULL,
    [Address] NVARCHAR(255) NOT NULL,
    [City] NVARCHAR(100) NOT NULL,
    [State] NVARCHAR(2) NOT NULL DEFAULT 'MN',
    [Zipcode] NVARCHAR(10) NOT NULL,
    [Phone] NVARCHAR(20) NOT NULL,
    [Fax] NVARCHAR(20) NULL,
    [JurisdictionType] NVARCHAR(50) NOT NULL,
    [NextReportYear] INT NULL,
    [FollowUpType] NVARCHAR(50) NULL,
    [FollowUpDate] DATE NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [CK_Jurisdictions_State] CHECK ([State] = 'MN'),
    CONSTRAINT [CK_Jurisdictions_Type] CHECK ([JurisdictionType] IN (
        'City', 'County', 'School District', 'Special District'
    ))
);

CREATE INDEX [IX_Jurisdictions_JurisdictionId] ON [dbo].[Jurisdictions]([JurisdictionId]);
CREATE INDEX [IX_Jurisdictions_Name] ON [dbo].[Jurisdictions]([Name]);
CREATE INDEX [IX_Jurisdictions_NextReportYear] ON [dbo].[Jurisdictions]([NextReportYear])
    WHERE [NextReportYear] IS NOT NULL;
```

**2. Reports**

```sql
CREATE TABLE [dbo].[Reports] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
    [ReportYear] INT NOT NULL,
    [CaseNumber] INT NOT NULL,
    [CaseDescription] NVARCHAR(MAX) NULL,
    [CaseStatus] NVARCHAR(50) NOT NULL DEFAULT 'Private',
    [ComplianceStatus] NVARCHAR(50) NULL,
    [SubmittedAt] DATETIMEOFFSET NULL,
    [AlternativeAnalysisNotes] NVARCHAR(MAX) NULL,
    [SignificantChangesExplanation] NVARCHAR(MAX) NULL,
    [RequiresManualReview] BIT NOT NULL DEFAULT 0,
    [ApprovalStatus] NVARCHAR(50) NOT NULL DEFAULT 'draft',
    [ApprovedBy] NVARCHAR(255) NULL,
    [ApprovedAt] DATETIMEOFFSET NULL,
    [RejectionReason] NVARCHAR(MAX) NULL,
    [CertificateGeneratedAt] DATETIMEOFFSET NULL,
    [AutoApproved] BIT NOT NULL DEFAULT 0,
    [SubmittedOnTime] BIT NULL,
    [SubmissionDeadline] DATETIMEOFFSET NULL,
    [TestResults] NVARCHAR(MAX) NULL, -- JSON
    [TestApplicability] NVARCHAR(MAX) NULL, -- JSON
    [RevisionCount] INT NOT NULL DEFAULT 0,
    [PreviousSubmissionDate] DATETIMEOFFSET NULL,
    [RevisionNotes] NVARCHAR(MAX) NULL,
    [IsResubmission] BIT NOT NULL DEFAULT 0,
    [WorkflowStatus] NVARCHAR(50) NOT NULL DEFAULT 'draft',
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_Reports_Jurisdictions]
        FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id]),
    CONSTRAINT [CK_Reports_CaseStatus] CHECK ([CaseStatus] IN (
        'Private', 'Shared', 'Submitted', 'In Compliance', 'Out of Compliance'
    )),
    CONSTRAINT [CK_Reports_ApprovalStatus] CHECK ([ApprovalStatus] IN (
        'draft', 'pending', 'approved', 'rejected', 'auto_approved'
    )),
    CONSTRAINT [CK_Reports_WorkflowStatus] CHECK ([WorkflowStatus] IN (
        'draft', 'submitted', 'under_revision', 'resubmitted', 'finalized'
    )),
    CONSTRAINT [UQ_Reports_JurisdictionYear]
        UNIQUE ([JurisdictionId], [ReportYear], [CaseNumber])
);

CREATE INDEX [IX_Reports_JurisdictionId_ReportYear]
    ON [dbo].[Reports]([JurisdictionId], [ReportYear]);
CREATE INDEX [IX_Reports_CaseStatus]
    ON [dbo].[Reports]([CaseStatus])
    INCLUDE ([JurisdictionId], [ReportYear], [CaseNumber]);
CREATE INDEX [IX_Reports_ApprovalStatus]
    ON [dbo].[Reports]([ApprovalStatus])
    WHERE [ApprovalStatus] IN ('pending', 'draft');
```

**3. Job Classifications**

```sql
CREATE TABLE [dbo].[JobClassifications] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReportId] UNIQUEIDENTIFIER NOT NULL,
    [JobNumber] INT NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Males] INT NOT NULL DEFAULT 0,
    [Females] INT NOT NULL DEFAULT 0,
    [Points] INT NOT NULL,
    [MinSalary] DECIMAL(18, 2) NOT NULL,
    [MaxSalary] DECIMAL(18, 2) NOT NULL,
    [YearsToMax] DECIMAL(5, 2) NOT NULL DEFAULT 0,
    [YearsServicePay] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    [ExceptionalServiceCategory] NVARCHAR(50) NULL,
    [BenefitsIncludedInSalary] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    [IsPartTime] BIT NOT NULL DEFAULT 0,
    [HoursPerWeek] DECIMAL(5, 2) NULL,
    [DaysPerYear] INT NULL,
    [AdditionalCashCompensation] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_JobClassifications_Reports]
        FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]) ON DELETE CASCADE,
    CONSTRAINT [CK_JobClassifications_Salary]
        CHECK ([MinSalary] <= [MaxSalary]),
    CONSTRAINT [CK_JobClassifications_Points]
        CHECK ([Points] >= 0),
    CONSTRAINT [CK_JobClassifications_Gender]
        CHECK ([Males] >= 0 AND [Females] >= 0),
    CONSTRAINT [UQ_JobClassifications_ReportJob]
        UNIQUE ([ReportId], [JobNumber])
);

CREATE INDEX [IX_JobClassifications_ReportId]
    ON [dbo].[JobClassifications]([ReportId])
    INCLUDE ([JobNumber], [Title], [Points], [MinSalary], [MaxSalary]);
```

**4. Implementation Reports**

```sql
CREATE TABLE [dbo].[ImplementationReports] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReportId] UNIQUEIDENTIFIER NOT NULL UNIQUE,
    [EvaluationSystem] NVARCHAR(MAX) NOT NULL,
    [EvaluationDescription] NVARCHAR(MAX) NOT NULL,
    [HealthBenefitsEvaluated] NVARCHAR(50) NOT NULL,
    [HealthBenefitsDescription] NVARCHAR(MAX) NULL,
    [NoticeLocation] NVARCHAR(MAX) NOT NULL,
    [ApprovedByBody] NVARCHAR(255) NOT NULL,
    [ChiefElectedOfficial] NVARCHAR(255) NOT NULL,
    [OfficialTitle] NVARCHAR(255) NOT NULL,
    [ApprovalConfirmed] BIT NOT NULL DEFAULT 0,
    [TotalPayroll] DECIMAL(18, 2) NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_ImplementationReports_Reports]
        FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]) ON DELETE CASCADE,
    CONSTRAINT [CK_ImplementationReports_HealthBenefits]
        CHECK ([HealthBenefitsEvaluated] IN ('Yes', 'No', 'N/A'))
);
```

**5. Submission History**

```sql
CREATE TABLE [dbo].[SubmissionHistory] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReportId] UNIQUEIDENTIFIER NOT NULL,
    [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
    [ActionType] NVARCHAR(50) NOT NULL,
    [PreviousStatus] NVARCHAR(50) NULL,
    [NewStatus] NVARCHAR(50) NOT NULL,
    [RevisionNotes] NVARCHAR(MAX) NULL,
    [DataSnapshot] NVARCHAR(MAX) NULL, -- JSON
    [PerformedBy] UNIQUEIDENTIFIER NULL,
    [PerformedByEmail] NVARCHAR(255) NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_SubmissionHistory_Reports]
        FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_SubmissionHistory_Jurisdictions]
        FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id]),
    CONSTRAINT [CK_SubmissionHistory_ActionType]
        CHECK ([ActionType] IN ('submitted', 'reopened', 'resubmitted'))
);

CREATE INDEX [IX_SubmissionHistory_ReportId_CreatedAt]
    ON [dbo].[SubmissionHistory]([ReportId], [CreatedAt] DESC);
```

**6. Report Revisions**

```sql
CREATE TABLE [dbo].[ReportRevisions] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReportId] UNIQUEIDENTIFIER NOT NULL,
    [RevisionNumber] INT NOT NULL,
    [RevisionNotes] NVARCHAR(MAX) NOT NULL,
    [ChangesSummary] NVARCHAR(MAX) NOT NULL, -- JSON
    [JobsModifiedCount] INT NOT NULL DEFAULT 0,
    [JobsAddedCount] INT NOT NULL DEFAULT 0,
    [JobsRemovedCount] INT NOT NULL DEFAULT 0,
    [ImplementationModified] BIT NOT NULL DEFAULT 0,
    [CreatedBy] UNIQUEIDENTIFIER NULL,
    [CreatedByEmail] NVARCHAR(255) NOT NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_ReportRevisions_Reports]
        FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_ReportRevisions_ReportRevision]
        UNIQUE ([ReportId], [RevisionNumber])
);
```

**7. Approval History**

```sql
CREATE TABLE [dbo].[ApprovalHistory] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReportId] UNIQUEIDENTIFIER NOT NULL,
    [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
    [ActionType] NVARCHAR(100) NOT NULL,
    [PreviousStatus] NVARCHAR(50) NULL,
    [NewStatus] NVARCHAR(50) NOT NULL,
    [ApprovedBy] NVARCHAR(255) NULL,
    [Reason] NVARCHAR(MAX) NULL,
    [Notes] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_ApprovalHistory_Reports]
        FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ApprovalHistory_Jurisdictions]
        FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id])
);

CREATE INDEX [IX_ApprovalHistory_ReportId_CreatedAt]
    ON [dbo].[ApprovalHistory]([ReportId], [CreatedAt] DESC);
```

**8. Compliance Certificates**

```sql
CREATE TABLE [dbo].[ComplianceCertificates] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [ReportId] UNIQUEIDENTIFIER NOT NULL,
    [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
    [ReportYear] INT NOT NULL,
    [CertificateData] NVARCHAR(MAX) NOT NULL, -- Base64 PDF
    [FileName] NVARCHAR(255) NOT NULL,
    [GeneratedBy] NVARCHAR(255) NULL,
    [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
    [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT [FK_ComplianceCertificates_Reports]
        FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ComplianceCertificates_Jurisdictions]
        FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id])
);

CREATE INDEX [IX_ComplianceCertificates_ReportId]
    ON [dbo].[ComplianceCertificates]([ReportId]);
```

### Additional Tables

Due to space constraints, refer to the migration plan document for complete DDL for:
- Contacts
- BenefitsWorksheet
- EmailTemplates
- EmailLog
- AdminCaseNotes
- UserProfiles
- AuditLog
- SystemConfig

### Database Constraints & Business Rules

1. **Data Integrity**
   - All foreign keys must enforce referential integrity
   - Cascade deletes where appropriate (e.g., jobs delete when report deleted)
   - Check constraints for valid enum values

2. **Performance**
   - Index all foreign keys
   - Index commonly queried fields (status, dates)
   - Include columns in indexes for covering queries
   - Partition large tables (audit_log, email_log) if needed

3. **Auditing**
   - All tables must have CreatedAt and UpdatedAt timestamps
   - Trigger or application-level audit logging for data changes
   - Retention policy: Keep audit logs for 7 years

---

## API Requirements

### RESTful API Design

**Base URL**: `https://api.payequity.mn.gov/api/v1/`

### Authentication Endpoints

**POST /auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response (200 OK):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4...",
  "expiresIn": 28800,
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "role": "JurisdictionUser",
    "jurisdictionId": "guid",
    "jurisdictionName": "Anoka County"
  }
}
```

**POST /auth/refresh**
```json
Request:
{
  "refreshToken": "a1b2c3d4..."
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "e5f6g7h8...",
  "expiresIn": 28800
}
```

**POST /auth/change-password**
```json
Request (Authenticated):
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}

Response (200 OK):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Jurisdiction Endpoints

**GET /jurisdictions**
```
Query Parameters:
- search (string): Search by name or jurisdiction ID
- type (string): Filter by jurisdiction type
- page (int): Page number (default: 1)
- pageSize (int): Items per page (default: 50, max: 100)

Response (200 OK):
{
  "data": [
    {
      "id": "guid",
      "jurisdictionId": "001-001",
      "name": "Anoka County",
      "address": "2100 3rd Avenue",
      "city": "Anoka",
      "state": "MN",
      "zipcode": "55303",
      "phone": "(763) 324-1234",
      "jurisdictionType": "County",
      "nextReportYear": 2026
    }
  ],
  "totalCount": 850,
  "page": 1,
  "pageSize": 50,
  "totalPages": 17
}
```

**GET /jurisdictions/{id}**
```
Response (200 OK):
{
  "id": "guid",
  "jurisdictionId": "001-001",
  "name": "Anoka County",
  "address": "2100 3rd Avenue",
  "city": "Anoka",
  "state": "MN",
  "zipcode": "55303",
  "phone": "(763) 324-1234",
  "fax": "(763) 324-5678",
  "jurisdictionType": "County",
  "nextReportYear": 2026,
  "followUpType": null,
  "followUpDate": null,
  "contacts": [
    {
      "id": "guid",
      "name": "Jane Doe",
      "title": "HR Director",
      "isPrimary": true,
      "email": "jane.doe@anokacounty.us",
      "phone": "(763) 324-1111"
    }
  ],
  "createdAt": "2020-01-15T10:30:00Z",
  "updatedAt": "2025-01-10T14:22:00Z"
}
```

**POST /jurisdictions** (Admin only)
```json
Request:
{
  "jurisdictionId": "001-100",
  "name": "New City",
  "address": "123 Main St",
  "city": "New City",
  "state": "MN",
  "zipcode": "55000",
  "phone": "(612) 555-0000",
  "jurisdictionType": "City"
}

Response (201 Created):
{
  "id": "guid",
  "jurisdictionId": "001-100",
  "name": "New City",
  ...
}
```

### Report Endpoints

**GET /reports**
```
Query Parameters:
- jurisdictionId (guid): Filter by jurisdiction
- reportYear (int): Filter by year
- caseStatus (string): Filter by status
- approvalStatus (string): Filter by approval status
- page (int)
- pageSize (int)

Authorization: Jurisdiction users see only their reports, admins see all

Response (200 OK):
{
  "data": [
    {
      "id": "guid",
      "jurisdictionId": "guid",
      "jurisdictionName": "Anoka County",
      "reportYear": 2025,
      "caseNumber": 1,
      "caseDescription": "2025 Pay Equity Report",
      "caseStatus": "Submitted",
      "complianceStatus": "In Compliance",
      "approvalStatus": "auto_approved",
      "submittedAt": "2025-01-15T16:30:00Z",
      "approvedAt": "2025-01-15T16:35:00Z",
      "jobCount": 45,
      "revisionCount": 0
    }
  ],
  "totalCount": 3,
  "page": 1,
  "pageSize": 50
}
```

**GET /reports/{id}**
```
Response (200 OK):
{
  "id": "guid",
  "jurisdictionId": "guid",
  "reportYear": 2025,
  "caseNumber": 1,
  "caseDescription": "2025 Pay Equity Report",
  "caseStatus": "Submitted",
  "complianceStatus": "In Compliance",
  "submittedAt": "2025-01-15T16:30:00Z",
  "approvalStatus": "auto_approved",
  "approvedBy": "Auto-Approval System",
  "approvedAt": "2025-01-15T16:35:00Z",
  "testResults": {
    "underpaymentRatioPassed": true,
    "salaryRangeTestPassed": true,
    "exceptionalServiceTestPassed": true
  },
  "revisionCount": 0,
  "workflowStatus": "finalized",
  "createdAt": "2024-12-01T09:00:00Z",
  "updatedAt": "2025-01-15T16:35:00Z"
}
```

**POST /reports**
```json
Request:
{
  "jurisdictionId": "guid",
  "reportYear": 2025,
  "caseDescription": "2025 Pay Equity Report"
}

Response (201 Created):
{
  "id": "guid",
  "jurisdictionId": "guid",
  "reportYear": 2025,
  "caseNumber": 1,
  "caseStatus": "Private",
  "approvalStatus": "draft",
  ...
}
```

**PUT /reports/{id}**
```json
Request:
{
  "caseDescription": "Updated description",
  "alternativeAnalysisNotes": "Alternative analysis details..."
}

Response (200 OK):
{
  "id": "guid",
  "caseDescription": "Updated description",
  ...
}
```

**POST /reports/{id}/submit**
```json
Request:
{
  "revisionNotes": "Initial submission",
  "checklistData": {
    "jobEvaluationComplete": true,
    "jobsDataEntered": true,
    "benefitsEvaluated": true,
    "complianceReviewed": true,
    "implementationFormComplete": true,
    "governingBodyApproved": true,
    "totalPayrollEntered": true,
    "officialNoticePosted": true
  }
}

Response (200 OK):
{
  "success": true,
  "message": "Report submitted successfully",
  "reportId": "guid",
  "caseStatus": "Submitted",
  "approvalStatus": "auto_approved",
  "complianceStatus": "In Compliance",
  "certificateGenerated": true
}
```

**POST /reports/{id}/reopen**
```json
Request: (empty body)

Response (200 OK):
{
  "success": true,
  "message": "Report reopened for editing",
  "reportId": "guid",
  "caseStatus": "Private",
  "approvalStatus": "draft"
}
```

### Job Classification Endpoints

**GET /jobs**
```
Query Parameters:
- reportId (guid): Required - filter by report

Response (200 OK):
{
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
      "maxSalary": 48000,
      "yearsToMax": 10,
      "isPartTime": false
    },
    ...
  ],
  "totalCount": 45
}
```

**POST /jobs**
```json
Request:
{
  "reportId": "guid",
  "jobNumber": 50,
  "title": "IT Manager",
  "males": 3,
  "females": 1,
  "points": 400,
  "minSalary": 75000,
  "maxSalary": 95000,
  "yearsToMax": 8,
  "yearsServicePay": 2500,
  "exceptionalServiceCategory": "None",
  "isPartTime": false
}

Response (201 Created):
{
  "id": "guid",
  "reportId": "guid",
  "jobNumber": 50,
  "title": "IT Manager",
  ...
}
```

**PUT /jobs/{id}**
```json
Request:
{
  "title": "IT Manager (Updated)",
  "males": 4,
  "females": 2,
  "maxSalary": 97000
}

Response (200 OK):
{
  "id": "guid",
  "title": "IT Manager (Updated)",
  ...
}
```

**DELETE /jobs/{id}**
```
Response (204 No Content)
```

**POST /jobs/import**
```
Content-Type: multipart/form-data
Body:
- reportId: guid
- file: Excel file (.xlsx)

Response (200 OK):
{
  "success": true,
  "message": "45 jobs imported successfully",
  "importedCount": 45,
  "errors": []
}
```

### Compliance Analysis Endpoints

**POST /compliance/analyze/{reportId}**
```
Response (200 OK):
{
  "reportId": "guid",
  "isCompliant": true,
  "requiresManualReview": false,
  "statisticalTest": {
    "underpaymentRatioPassed": true,
    "underpaymentRatio": 94.5,
    "totalUnderpayment": 12500,
    "totalPredictedPay": 2250000
  },
  "salaryRangeTest": {
    "applicable": true,
    "passed": true,
    "ratio": 0.92,
    "details": "3 of 12 classes tested"
  },
  "exceptionalServiceTest": {
    "applicable": false,
    "reason": "No exceptional service pay found"
  },
  "linearRegression": {
    "slope": 225.5,
    "intercept": 12000,
    "rSquared": 0.85
  }
}
```

### Certificate Endpoints

**GET /certificates/{reportId}**
```
Response (200 OK):
Content-Type: application/pdf
Body: PDF binary data

Or if not generated:
Response (404 Not Found):
{
  "error": "Certificate not found for this report"
}
```

**POST /certificates/generate/{reportId}** (Admin only)
```
Response (200 OK):
{
  "success": true,
  "certificateId": "guid",
  "fileName": "Anoka_County_Certificate_2025.pdf"
}
```

### Admin Endpoints

**GET /admin/pending-reports**
```
Query Parameters:
- page (int)
- pageSize (int)

Response (200 OK):
{
  "data": [
    {
      "reportId": "guid",
      "jurisdictionName": "Anoka County",
      "reportYear": 2025,
      "caseNumber": 1,
      "submittedAt": "2025-01-15T16:30:00Z",
      "complianceStatus": "Out of Compliance",
      "requiresManualReview": false,
      "testResults": { ... }
    }
  ],
  "totalCount": 15
}
```

**POST /admin/approve/{reportId}**
```json
Request:
{
  "approved": true,
  "notes": "Manual approval - alternative analysis accepted"
}

Response (200 OK):
{
  "success": true,
  "message": "Report approved",
  "reportId": "guid",
  "certificateGenerated": true
}
```

**POST /admin/reject/{reportId}**
```json
Request:
{
  "reason": "Incomplete data - missing job classifications"
}

Response (200 OK):
{
  "success": true,
  "message": "Report rejected",
  "reportId": "guid"
}
```

### Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "maxSalary",
        "message": "Maximum salary must be greater than minimum salary"
      }
    ]
  },
  "traceId": "00-abc123...",
  "timestamp": "2025-01-15T16:30:00Z"
}
```

**HTTP Status Codes**:
- 200 OK - Success
- 201 Created - Resource created
- 204 No Content - Success with no body
- 400 Bad Request - Validation error
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 409 Conflict - Resource conflict
- 500 Internal Server Error - Server error

---

## Business Logic Requirements

### Compliance Analysis Algorithm

This is the most critical business logic in the system. It must be implemented exactly as the current TypeScript version.

#### Linear Regression Calculation

```csharp
public class ComplianceAnalysisService : IComplianceAnalysisService
{
    public async Task<ComplianceResult> AnalyzeComplianceAsync(Guid reportId)
    {
        var jobs = await _context.JobClassifications
            .Where(j => j.ReportId == reportId)
            .OrderBy(j => j.Points)
            .ToListAsync();

        if (jobs.Count == 0)
            throw new InvalidOperationException("No job classifications found");

        // Step 1: Perform linear regression on male-dominated jobs
        var regression = PerformLinearRegression(jobs);

        // Step 2: Calculate predicted pay for all female-dominated jobs
        var jobsWithPredicted = CalculatePredictedPay(jobs, regression);

        // Step 3: Perform statistical tests
        var statisticalTest = PerformStatisticalTest(jobsWithPredicted);
        var salaryRangeTest = PerformSalaryRangeTest(jobs);
        var exceptionalServiceTest = PerformExceptionalServiceTest(jobs);

        // Step 4: Determine overall compliance
        bool isCompliant = statisticalTest.UnderpaymentRatioPassed &&
                          (salaryRangeTest.Passed || !salaryRangeTest.Applicable) &&
                          (exceptionalServiceTest.Passed || !exceptionalServiceTest.Applicable);

        return new ComplianceResult
        {
            IsCompliant = isCompliant,
            StatisticalTest = statisticalTest,
            SalaryRangeTest = salaryRangeTest,
            ExceptionalServiceTest = exceptionalServiceTest,
            RequiresManualReview = CheckManualReviewRequired(jobs, statisticalTest),
            LinearRegression = regression
        };
    }

    private LinearRegressionResult PerformLinearRegression(
        List<JobClassification> jobs)
    {
        // Filter: Only include jobs with males > 0
        var maleJobs = jobs.Where(j => j.Males > 0).ToList();

        // Manual review required if 3 or fewer male-dominated classes
        if (maleJobs.Count <= 3)
        {
            return new LinearRegressionResult
            {
                RequiresManualReview = true,
                Reason = "Three or fewer male-dominated classes"
            };
        }

        // Calculate linear regression: Y = mX + b
        // where Y = MaxSalary, X = Points
        int n = maleJobs.Count;
        double sumX = maleJobs.Sum(j => (double)j.Points);
        double sumY = maleJobs.Sum(j => (double)j.MaxSalary);
        double sumXY = maleJobs.Sum(j => j.Points * (double)j.MaxSalary);
        double sumX2 = maleJobs.Sum(j => Math.Pow(j.Points, 2));

        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - Math.Pow(sumX, 2));
        double intercept = (sumY - slope * sumX) / n;

        // Calculate R-squared for goodness of fit
        double meanY = sumY / n;
        double ssTotal = maleJobs.Sum(j => Math.Pow((double)j.MaxSalary - meanY, 2));
        double ssResidual = maleJobs.Sum(j =>
        {
            double predicted = slope * j.Points + intercept;
            return Math.Pow((double)j.MaxSalary - predicted, 2);
        });
        double rSquared = 1 - (ssResidual / ssTotal);

        return new LinearRegressionResult
        {
            Slope = slope,
            Intercept = intercept,
            RSquared = rSquared,
            MaleJobsCount = maleJobs.Count,
            RequiresManualReview = false
        };
    }

    private List<JobWithPredictedPay> CalculatePredictedPay(
        List<JobClassification> jobs,
        LinearRegressionResult regression)
    {
        return jobs.Select(job => new JobWithPredictedPay
        {
            Job = job,
            PredictedPay = regression.Slope * job.Points + regression.Intercept
        }).ToList();
    }

    private StatisticalTestResult PerformStatisticalTest(
        List<JobWithPredictedPay> jobs)
    {
        // Filter: Only female-dominated jobs (females > 0)
        var femaleJobs = jobs.Where(j => j.Job.Females > 0).ToList();

        if (femaleJobs.Count == 0)
        {
            return new StatisticalTestResult
            {
                UnderpaymentRatioPassed = true,
                UnderpaymentRatio = 100,
                Reason = "No female-dominated classes"
            };
        }

        double totalUnderpayment = 0;
        double totalPredictedPay = 0;

        foreach (var job in femaleJobs)
        {
            double actualPay = (double)job.Job.MaxSalary;
            double predictedPay = job.PredictedPay;

            // Only count underpayment if actual < predicted
            if (actualPay < predictedPay)
            {
                double underpayment = predictedPay - actualPay;
                totalUnderpayment += underpayment * job.Job.Females;
            }

            totalPredictedPay += predictedPay * job.Job.Females;
        }

        // Calculate underpayment ratio
        // Ratio = (Total Predicted - Total Underpayment) / Total Predicted * 100
        double underpaymentRatio = totalPredictedPay > 0
            ? ((totalPredictedPay - totalUnderpayment) / totalPredictedPay) * 100
            : 100;

        // Pass if ratio >= 80%
        bool passed = underpaymentRatio >= 80;

        return new StatisticalTestResult
        {
            UnderpaymentRatioPassed = passed,
            UnderpaymentRatio = Math.Round(underpaymentRatio, 2),
            TotalUnderpayment = Math.Round(totalUnderpayment, 2),
            TotalPredictedPay = Math.Round(totalPredictedPay, 2),
            FemaleJobsCount = femaleJobs.Count
        };
    }

    private SalaryRangeTestResult PerformSalaryRangeTest(
        List<JobClassification> jobs)
    {
        // Test is only applicable if:
        // 1. Job classes have at least 3 or 4 or more comparison points
        // 2. Jobs with same or similar point values exist

        // Group jobs by point ranges (±5 points)
        var pointGroups = new Dictionary<int, List<JobClassification>>();

        foreach (var job in jobs)
        {
            int pointBucket = (job.Points / 5) * 5; // Round to nearest 5
            if (!pointGroups.ContainsKey(pointBucket))
                pointGroups[pointBucket] = new List<JobClassification>();
            pointGroups[pointBucket].Add(job);
        }

        // Find groups with both male and female jobs
        var testableGroups = pointGroups
            .Where(g => g.Value.Any(j => j.Males > 0) && g.Value.Any(j => j.Females > 0))
            .ToList();

        if (testableGroups.Count < 3)
        {
            return new SalaryRangeTestResult
            {
                Applicable = false,
                Reason = "Fewer than 3 comparable job groups found"
            };
        }

        // Calculate salary range ratios for each group
        double totalRatio = 0;
        int groupCount = 0;

        foreach (var group in testableGroups)
        {
            var maleJobs = group.Value.Where(j => j.Males > 0);
            var femaleJobs = group.Value.Where(j => j.Females > 0);

            double avgMaleMax = maleJobs.Average(j => (double)j.MaxSalary);
            double avgFemaleMax = femaleJobs.Average(j => (double)j.MaxSalary);

            if (avgMaleMax > 0)
            {
                totalRatio += avgFemaleMax / avgMaleMax;
                groupCount++;
            }
        }

        double averageRatio = groupCount > 0 ? totalRatio / groupCount : 1.0;
        bool passed = averageRatio >= 0.80;

        return new SalaryRangeTestResult
        {
            Applicable = true,
            Passed = passed,
            Ratio = Math.Round(averageRatio, 4),
            GroupsCompared = groupCount
        };
    }

    private ExceptionalServiceTestResult PerformExceptionalServiceTest(
        List<JobClassification> jobs)
    {
        // Test only applicable if jobs have exceptional service pay
        var jobsWithExceptional = jobs
            .Where(j => j.YearsServicePay > 0)
            .ToList();

        if (jobsWithExceptional.Count == 0)
        {
            return new ExceptionalServiceTestResult
            {
                Applicable = false,
                Reason = "No jobs with exceptional service pay"
            };
        }

        var maleJobs = jobsWithExceptional.Where(j => j.Males > 0).ToList();
        var femaleJobs = jobsWithExceptional.Where(j => j.Females > 0).ToList();

        if (maleJobs.Count == 0 || femaleJobs.Count == 0)
        {
            return new ExceptionalServiceTestResult
            {
                Applicable = false,
                Reason = "Insufficient male or female jobs with exceptional service pay"
            };
        }

        double avgMaleExceptional = maleJobs.Average(j => (double)j.YearsServicePay);
        double avgFemaleExceptional = femaleJobs.Average(j => (double)j.YearsServicePay);

        double ratio = avgMaleExceptional > 0
            ? avgFemaleExceptional / avgMaleExceptional
            : 1.0;

        bool passed = ratio >= 0.80;

        return new ExceptionalServiceTestResult
        {
            Applicable = true,
            Passed = passed,
            Ratio = Math.Round(ratio, 4),
            MaleJobsCount = maleJobs.Count,
            FemaleJobsCount = femaleJobs.Count,
            AverageMalePay = Math.Round(avgMaleExceptional, 2),
            AverageFemalePay = Math.Round(avgFemaleExceptional, 2)
        };
    }

    private bool CheckManualReviewRequired(
        List<JobClassification> jobs,
        StatisticalTestResult statisticalTest)
    {
        // Manual review required if:
        // 1. Three or fewer male-dominated classes
        var maleJobs = jobs.Where(j => j.Males > 0).ToList();
        if (maleJobs.Count <= 3)
            return true;

        // 2. Alternative analysis notes provided
        // (handled elsewhere in the application)

        return false;
    }
}
```

### Auto-Approval Service

```csharp
public class AutoApprovalService : IAutoApprovalService
{
    private readonly PayEquityDbContext _context;
    private readonly IComplianceAnalysisService _complianceService;
    private readonly ICertificateGeneratorService _certificateService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AutoApprovalService> _logger;

    public async Task<bool> ProcessAutoApprovalAsync(Guid reportId)
    {
        try
        {
            var report = await _context.Reports
                .Include(r => r.Jurisdiction)
                .FirstOrDefaultAsync(r => r.Id == reportId);

            if (report == null)
            {
                _logger.LogError("Report {ReportId} not found", reportId);
                return false;
            }

            // Step 1: Check submission deadline
            bool submittedOnTime = CheckSubmissionDeadline(report);

            if (!submittedOnTime)
            {
                await RequireManualReview(report,
                    "Submitted after January 31st deadline (due every three years)");
                return false;
            }

            // Step 2: Analyze compliance
            var complianceResult = await _complianceService
                .AnalyzeComplianceAsync(reportId);

            if (complianceResult.RequiresManualReview)
            {
                await RequireManualReview(report,
                    "Three or fewer male classes - Alternative Analysis required");
                return false;
            }

            // Step 3: Process based on compliance status
            if (complianceResult.IsCompliant)
            {
                // Generate certificate
                var certificateData = await _certificateService
                    .GenerateCertificateAsync(report);

                // Update report status
                report.ApprovalStatus = ApprovalStatus.AutoApproved;
                report.CaseStatus = CaseStatus.InCompliance;
                report.ComplianceStatus = "In Compliance";
                report.ApprovedAt = DateTime.UtcNow;
                report.ApprovedBy = "Auto-Approval System";
                report.CertificateGeneratedAt = DateTime.UtcNow;
                report.AutoApproved = true;
                report.SubmittedOnTime = true;
                report.SubmissionDeadline = GetSubmissionDeadline(report.ReportYear);

                // Store test results as JSON
                report.TestResults = JsonSerializer.Serialize(new
                {
                    submittedOnTime = true,
                    underpaymentRatioPassed = complianceResult.StatisticalTest.UnderpaymentRatioPassed,
                    salaryRangeTestPassed = complianceResult.SalaryRangeTest?.Passed ?? false,
                    exceptionalServiceTestPassed = complianceResult.ExceptionalServiceTest?.Passed ?? false,
                    timestamp = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                // Log approval history
                await _context.ApprovalHistory.AddAsync(new ApprovalHistory
                {
                    ReportId = reportId,
                    JurisdictionId = report.JurisdictionId,
                    ActionType = "auto_approved",
                    PreviousStatus = "draft",
                    NewStatus = "auto_approved",
                    ApprovedBy = "Auto-Approval System",
                    Reason = BuildApprovalReason(complianceResult, true),
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                // Send approval notification
                await _emailService.SendApprovalNotificationAsync(report, certificateData);

                _logger.LogInformation(
                    "Report {ReportId} auto-approved for {JurisdictionName}",
                    reportId, report.Jurisdiction.Name);

                return true;
            }
            else
            {
                // Report is not compliant, requires manual review
                report.ApprovalStatus = ApprovalStatus.Pending;
                report.CaseStatus = CaseStatus.OutOfCompliance;
                report.ComplianceStatus = "Out of Compliance";
                report.SubmittedOnTime = true;
                report.SubmissionDeadline = GetSubmissionDeadline(report.ReportYear);

                // Store test results
                report.TestResults = JsonSerializer.Serialize(new
                {
                    submittedOnTime = true,
                    underpaymentRatioPassed = complianceResult.StatisticalTest.UnderpaymentRatioPassed,
                    salaryRangeTestPassed = complianceResult.SalaryRangeTest?.Passed ?? false,
                    exceptionalServiceTestPassed = complianceResult.ExceptionalServiceTest?.Passed ?? false,
                    timestamp = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                // Log approval history
                await _context.ApprovalHistory.AddAsync(new ApprovalHistory
                {
                    ReportId = reportId,
                    JurisdictionId = report.JurisdictionId,
                    ActionType = "failed_tests",
                    PreviousStatus = "draft",
                    NewStatus = "pending",
                    Reason = BuildApprovalReason(complianceResult, false),
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();

                // Notify staff for manual review
                await _emailService.SendStaffNotificationAsync(report,
                    "Failed compliance tests - manual review needed");

                _logger.LogInformation(
                    "Report {ReportId} requires manual review - compliance tests failed",
                    reportId);

                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing auto-approval for report {ReportId}", reportId);
            return false;
        }
    }

    private bool CheckSubmissionDeadline(Report report)
    {
        if (report.SubmittedAt == null)
            return false;

        var deadline = GetSubmissionDeadline(report.ReportYear);
        return report.SubmittedAt.Value <= deadline;
    }

    private DateTimeOffset GetSubmissionDeadline(int reportYear)
    {
        // Deadline is January 31st of the report year
        return new DateTimeOffset(reportYear, 1, 31, 23, 59, 59, TimeSpan.Zero);
    }

    private async Task RequireManualReview(Report report, string reason)
    {
        report.ApprovalStatus = ApprovalStatus.Pending;
        report.RequiresManualReview = true;
        await _context.SaveChangesAsync();

        await _context.ApprovalHistory.AddAsync(new ApprovalHistory
        {
            ReportId = report.Id,
            JurisdictionId = report.JurisdictionId,
            ActionType = "manual_review_required",
            PreviousStatus = "draft",
            NewStatus = "pending",
            Reason = reason,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        await _emailService.SendStaffNotificationAsync(report, reason);
    }

    private string BuildApprovalReason(ComplianceResult result, bool passed)
    {
        var parts = new List<string>();

        if (passed)
        {
            parts.Add("✓ Submitted on time by January 31st deadline");
            parts.Add("✓ Implementation form completed");

            if (result.StatisticalTest.UnderpaymentRatioPassed)
            {
                parts.Add($"✓ Underpayment ratio: {result.StatisticalTest.UnderpaymentRatio:F2} (≥80 required)");
            }

            if (result.SalaryRangeTest != null)
            {
                if (result.SalaryRangeTest.Applicable)
                {
                    parts.Add($"✓ Salary range test: Ratio {(result.SalaryRangeTest.Ratio * 100):F1}% (≥80% required)");
                }
                else
                {
                    parts.Add($"✓ Salary range test: Not applicable - {result.SalaryRangeTest.Reason}");
                }
            }

            if (result.ExceptionalServiceTest != null)
            {
                if (result.ExceptionalServiceTest.Applicable)
                {
                    parts.Add($"✓ Exceptional service pay test: Ratio {(result.ExceptionalServiceTest.Ratio * 100):F1}% (≥80% required)");
                }
                else
                {
                    parts.Add($"✓ Exceptional service pay test: Not applicable - {result.ExceptionalServiceTest.Reason}");
                }
            }

            parts.Add("\nAuto-approved - all requirements met");
        }
        else
        {
            if (!result.StatisticalTest.UnderpaymentRatioPassed)
            {
                parts.Add($"✗ Underpayment ratio: {result.StatisticalTest.UnderpaymentRatio:F2} (≥80 required)");
            }

            if (result.SalaryRangeTest != null && !result.SalaryRangeTest.Passed && result.SalaryRangeTest.Applicable)
            {
                parts.Add($"✗ Salary range test failed: Ratio {(result.SalaryRangeTest.Ratio * 100):F1}% (≥80% required)");
            }

            if (result.ExceptionalServiceTest != null && !result.ExceptionalServiceTest.Passed && result.ExceptionalServiceTest.Applicable)
            {
                parts.Add($"✗ Exceptional service pay test failed: Ratio {(result.ExceptionalServiceTest.Ratio * 100):F1}% (≥80% required)");
            }

            parts.Add("\nManual review required - one or more tests failed");
        }

        return string.Join("\n", parts);
    }
}
```

### Post-Submission Workflow Service

```csharp
public class SubmissionWorkflowService : ISubmissionWorkflowService
{
    private readonly PayEquityDbContext _context;
    private readonly ILogger<SubmissionWorkflowService> _logger;

    public async Task<OperationResult> ReopenReportAsync(Guid reportId)
    {
        var report = await _context.Reports.FindAsync(reportId);

        if (report == null)
            return OperationResult.Failed("Report not found");

        if (report.CaseStatus != "Submitted" &&
            report.CaseStatus != "In Compliance" &&
            report.CaseStatus != "Out of Compliance")
        {
            return OperationResult.Failed("Report is not in a submitted state");
        }

        // Store previous submission date
        report.PreviousSubmissionDate = report.SubmittedAt;

        // Revert to draft status
        report.CaseStatus = "Private";
        report.ApprovalStatus = ApprovalStatus.Draft;
        report.WorkflowStatus = "under_revision";
        report.SubmittedAt = null;
        report.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log in submission history
        await _context.SubmissionHistory.AddAsync(new SubmissionHistory
        {
            ReportId = reportId,
            JurisdictionId = report.JurisdictionId,
            ActionType = "reopened",
            PreviousStatus = "Submitted",
            NewStatus = "Private",
            PerformedByEmail = "user@example.com", // Get from current user
            CreatedAt = DateTime.UtcNow
        });

        await _context.ApprovalHistory.AddAsync(new ApprovalHistory
        {
            ReportId = reportId,
            JurisdictionId = report.JurisdictionId,
            ActionType = "reopened_for_editing",
            PreviousStatus = "Submitted",
            NewStatus = "Private",
            Notes = "Report reopened by user for editing",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        _logger.LogInformation("Report {ReportId} reopened for editing", reportId);

        return OperationResult.Success("Report reopened successfully");
    }

    public async Task<OperationResult> ResubmitReportAsync(
        Guid reportId, string revisionNotes)
    {
        var report = await _context.Reports.FindAsync(reportId);

        if (report == null)
            return OperationResult.Failed("Report not found");

        if (string.IsNullOrWhiteSpace(revisionNotes))
            return OperationResult.Failed("Revision notes are required");

        // Increment revision count
        report.RevisionCount++;
        report.RevisionNotes = revisionNotes;
        report.IsResubmission = true;

        // Update status
        report.CaseStatus = "Submitted";
        report.ApprovalStatus = ApprovalStatus.Draft;
        report.WorkflowStatus = "resubmitted";
        report.SubmittedAt = DateTime.UtcNow;
        report.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Create revision record
        await _context.ReportRevisions.AddAsync(new ReportRevision
        {
            ReportId = reportId,
            RevisionNumber = report.RevisionCount,
            RevisionNotes = revisionNotes,
            ChangesSummary = "{}", // TODO: Implement change tracking
            CreatedByEmail = "user@example.com", // Get from current user
            CreatedAt = DateTime.UtcNow
        });

        // Log in submission history
        await _context.SubmissionHistory.AddAsync(new SubmissionHistory
        {
            ReportId = reportId,
            JurisdictionId = report.JurisdictionId,
            ActionType = "resubmitted",
            PreviousStatus = "Private",
            NewStatus = "Submitted",
            RevisionNotes = revisionNotes,
            PerformedByEmail = "user@example.com",
            CreatedAt = DateTime.UtcNow
        });

        await _context.ApprovalHistory.AddAsync(new ApprovalHistory
        {
            ReportId = reportId,
            JurisdictionId = report.JurisdictionId,
            ActionType = "resubmitted",
            PreviousStatus = "Private",
            NewStatus = "Submitted",
            Notes = revisionNotes,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Report {ReportId} resubmitted (revision {RevisionCount})",
            reportId, report.RevisionCount);

        // Trigger auto-approval process
        // This should be done in a background job using Hangfire
        BackgroundJob.Enqueue<IAutoApprovalService>(
            service => service.ProcessAutoApprovalAsync(reportId));

        return OperationResult.Success("Report resubmitted successfully");
    }
}
```

---

## Security Requirements

(Continued in next section due to length...)

### Authentication

**Requirements**:
1. JWT-based authentication with RS256 algorithm
2. Token expiration: 8 hours
3. Refresh token expiration: 7 days
4. Secure password requirements:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

### Authorization

**Role-Based Access Control**:

| Resource | Admin | JurisdictionUser |
|----------|-------|------------------|
| View all jurisdictions | ✓ | ✗ (own only) |
| Create jurisdictions | ✓ | ✗ |
| View all reports | ✓ | ✗ (own only) |
| Approve/reject reports | ✓ | ✗ |
| Generate certificates | ✓ | ✗ |
| Manage case notes | ✓ | ✗ |
| Send emails | ✓ | ✗ |

### Data Protection

1. **Encryption at Rest**: All sensitive data encrypted in SQL Server
2. **Encryption in Transit**: TLS 1.2+ required for all API calls
3. **Password Hashing**: Identity Framework with PBKDF2
4. **SQL Injection Prevention**: Parameterized queries only
5. **XSS Prevention**: Input validation and output encoding
6. **CSRF Protection**: Anti-forgery tokens

### Audit Logging

Log the following events:
- All authentication attempts (success/failure)
- All data modifications
- All report submissions
- All approval actions
- All admin actions

---

## Testing Requirements

### Unit Tests

**Target**: 80% code coverage

Test categories:
- Business logic (compliance calculations)
- Data validation
- Service layer methods
- Repository methods

### Integration Tests

Test scenarios:
- Complete report submission workflow
- Auto-approval process
- Post-submission workflow
- Admin approval workflow
- Authentication flow

### Performance Tests

- API response time: p95 < 500ms
- Concurrent users: Support 200 simultaneous users
- Database query performance: < 100ms for most queries

---

## Deployment Requirements

### Environment Configuration

**Development**:
- Local SQL Server
- Local IIS Express
- Development settings

**Staging**:
- Azure SQL Database
- Azure App Service
- Production-like configuration

**Production**:
- Azure SQL Database (Premium tier)
- Azure App Service (P2V3 or higher)
- Production settings with monitoring

### CI/CD Pipeline

1. Code commit triggers build
2. Automated tests run
3. Code analysis (SonarQube)
4. Deploy to staging
5. Smoke tests on staging
6. Manual approval for production
7. Deploy to production
8. Health check verification

---

## Conclusion

This document provides comprehensive requirements for rebuilding the Minnesota Pay Equity Compliance System in ASP.NET Core 8.0 with SQL Server. All business logic, especially the compliance analysis algorithms, must be implemented exactly as specified to maintain functional parity with the existing system.

**Next Steps**:
1. Review and approve requirements
2. Begin Phase 1 implementation (infrastructure setup)
3. Follow migration plan for phased delivery
4. Conduct thorough testing at each phase
5. Deploy to production with rollback plan ready

---

**Document Version**: 1.0
**Date**: November 20, 2025
**Status**: Complete - Ready for Review
