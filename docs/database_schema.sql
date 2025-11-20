/*
  ============================================================================
  Minnesota Pay Equity Compliance System
  SQL Server Database Schema
  ============================================================================

  Purpose: Complete database schema for ASP.NET Core implementation
  Database: SQL Server 2019+
  Version: 1.0
  Date: November 20, 2025

  This script creates all tables, indexes, constraints, and initial data
  required for the Pay Equity Compliance System.

  Execution Notes:
  - Run this script on a new, empty SQL Server database
  - Ensure you have CREATE TABLE, CREATE INDEX permissions
  - Script is idempotent (uses IF NOT EXISTS checks)
  - Estimated execution time: 2-3 minutes

  Tables Created (20):
  1. Jurisdictions           - Local government entities
  2. Contacts               - Contact persons for jurisdictions
  3. Reports                - Pay equity reports
  4. JobClassifications     - Job data with salary and point values
  5. ImplementationReports  - Implementation form data
  6. SubmissionHistory      - Audit trail of submissions
  7. ReportRevisions        - Change tracking for resubmissions
  8. ApprovalHistory        - Approval workflow tracking
  9. ComplianceCertificates - Generated certificates
  10. BenefitsWorksheet     - Benefits comparison data
  11. EmailTemplates        - Email template library
  12. EmailLog              - Email communication tracking
  13. AdminCaseNotes        - Administrative case management
  14. UserProfiles          - User accounts linked to auth system
  15. AuditLog              - System-wide audit trail
  16. SystemConfig          - System configuration settings
  17. NotificationQueue     - Email notification queue
  18. ReportAttachments     - File attachments for reports
  19. DataExportLog         - Track data exports
  20. SystemAlerts          - Admin alerts and notifications

  ============================================================================
*/

-- Set database options
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================================
-- 1. JURISDICTIONS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Jurisdictions]') AND type in (N'U'))
BEGIN
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
        [IsActive] BIT NOT NULL DEFAULT 1,
        [Notes] NVARCHAR(MAX) NULL,
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
    CREATE INDEX [IX_Jurisdictions_Type] ON [dbo].[Jurisdictions]([JurisdictionType]);
END
GO

-- ============================================================================
-- 2. CONTACTS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Contacts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Contacts] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(255) NOT NULL,
        [Title] NVARCHAR(255) NULL,
        [Email] NVARCHAR(255) NOT NULL,
        [Phone] NVARCHAR(20) NULL,
        [IsPrimary] BIT NOT NULL DEFAULT 0,
        [ReceiveNotifications] BIT NOT NULL DEFAULT 1,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_Contacts_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id])
            ON DELETE CASCADE
    );

    CREATE INDEX [IX_Contacts_JurisdictionId] ON [dbo].[Contacts]([JurisdictionId]);
    CREATE INDEX [IX_Contacts_Email] ON [dbo].[Contacts]([Email]);
    CREATE INDEX [IX_Contacts_IsPrimary] ON [dbo].[Contacts]([JurisdictionId], [IsPrimary])
        WHERE [IsPrimary] = 1;
END
GO

-- ============================================================================
-- 3. REPORTS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reports]') AND type in (N'U'))
BEGIN
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
        [ManualReviewReason] NVARCHAR(MAX) NULL,
        [ApprovalStatus] NVARCHAR(50) NOT NULL DEFAULT 'draft',
        [ApprovedBy] NVARCHAR(255) NULL,
        [ApprovedAt] DATETIMEOFFSET NULL,
        [RejectionReason] NVARCHAR(MAX) NULL,
        [CertificateGeneratedAt] DATETIMEOFFSET NULL,
        [AutoApproved] BIT NOT NULL DEFAULT 0,
        [SubmittedOnTime] BIT NULL,
        [SubmissionDeadline] DATETIMEOFFSET NULL,
        [TestResults] NVARCHAR(MAX) NULL,
        [TestApplicability] NVARCHAR(MAX) NULL,
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
    CREATE INDEX [IX_Reports_SubmittedAt]
        ON [dbo].[Reports]([SubmittedAt] DESC)
        WHERE [SubmittedAt] IS NOT NULL;
    CREATE INDEX [IX_Reports_WorkflowStatus]
        ON [dbo].[Reports]([WorkflowStatus]);
END
GO

-- ============================================================================
-- 4. JOB CLASSIFICATIONS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[JobClassifications]') AND type in (N'U'))
BEGIN
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
        [Notes] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_JobClassifications_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
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
    CREATE INDEX [IX_JobClassifications_Points]
        ON [dbo].[JobClassifications]([ReportId], [Points]);
END
GO

-- ============================================================================
-- 5. IMPLEMENTATION REPORTS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ImplementationReports]') AND type in (N'U'))
BEGIN
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
        [TotalEmployees] INT NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_ImplementationReports_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
        CONSTRAINT [CK_ImplementationReports_HealthBenefits]
            CHECK ([HealthBenefitsEvaluated] IN ('Yes', 'No', 'N/A'))
    );

    CREATE INDEX [IX_ImplementationReports_ReportId]
        ON [dbo].[ImplementationReports]([ReportId]);
END
GO

-- ============================================================================
-- 6. SUBMISSION HISTORY TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SubmissionHistory]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SubmissionHistory] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ReportId] UNIQUEIDENTIFIER NOT NULL,
        [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
        [ActionType] NVARCHAR(50) NOT NULL,
        [PreviousStatus] NVARCHAR(50) NULL,
        [NewStatus] NVARCHAR(50) NOT NULL,
        [RevisionNotes] NVARCHAR(MAX) NULL,
        [DataSnapshot] NVARCHAR(MAX) NULL,
        [PerformedBy] UNIQUEIDENTIFIER NULL,
        [PerformedByEmail] NVARCHAR(255) NOT NULL,
        [IpAddress] NVARCHAR(50) NULL,
        [UserAgent] NVARCHAR(500) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_SubmissionHistory_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
        CONSTRAINT [FK_SubmissionHistory_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id]),
        CONSTRAINT [CK_SubmissionHistory_ActionType]
            CHECK ([ActionType] IN ('submitted', 'reopened', 'resubmitted'))
    );

    CREATE INDEX [IX_SubmissionHistory_ReportId_CreatedAt]
        ON [dbo].[SubmissionHistory]([ReportId], [CreatedAt] DESC);
    CREATE INDEX [IX_SubmissionHistory_JurisdictionId]
        ON [dbo].[SubmissionHistory]([JurisdictionId], [CreatedAt] DESC);
END
GO

-- ============================================================================
-- 7. REPORT REVISIONS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReportRevisions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ReportRevisions] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ReportId] UNIQUEIDENTIFIER NOT NULL,
        [RevisionNumber] INT NOT NULL,
        [RevisionNotes] NVARCHAR(MAX) NOT NULL,
        [ChangesSummary] NVARCHAR(MAX) NOT NULL,
        [JobsModifiedCount] INT NOT NULL DEFAULT 0,
        [JobsAddedCount] INT NOT NULL DEFAULT 0,
        [JobsRemovedCount] INT NOT NULL DEFAULT 0,
        [ImplementationModified] BIT NOT NULL DEFAULT 0,
        [CreatedBy] UNIQUEIDENTIFIER NULL,
        [CreatedByEmail] NVARCHAR(255) NOT NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_ReportRevisions_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
        CONSTRAINT [UQ_ReportRevisions_ReportRevision]
            UNIQUE ([ReportId], [RevisionNumber])
    );

    CREATE INDEX [IX_ReportRevisions_ReportId]
        ON [dbo].[ReportRevisions]([ReportId], [RevisionNumber] DESC);
END
GO

-- ============================================================================
-- 8. APPROVAL HISTORY TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ApprovalHistory]') AND type in (N'U'))
BEGIN
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
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
        CONSTRAINT [FK_ApprovalHistory_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id])
    );

    CREATE INDEX [IX_ApprovalHistory_ReportId_CreatedAt]
        ON [dbo].[ApprovalHistory]([ReportId], [CreatedAt] DESC);
    CREATE INDEX [IX_ApprovalHistory_JurisdictionId]
        ON [dbo].[ApprovalHistory]([JurisdictionId], [CreatedAt] DESC);
END
GO

-- ============================================================================
-- 9. COMPLIANCE CERTIFICATES TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ComplianceCertificates]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ComplianceCertificates] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ReportId] UNIQUEIDENTIFIER NOT NULL,
        [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
        [ReportYear] INT NOT NULL,
        [CertificateData] NVARCHAR(MAX) NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [FileSize] BIGINT NULL,
        [ContentType] NVARCHAR(100) NOT NULL DEFAULT 'application/pdf',
        [GeneratedBy] NVARCHAR(255) NULL,
        [DownloadCount] INT NOT NULL DEFAULT 0,
        [LastDownloadedAt] DATETIMEOFFSET NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_ComplianceCertificates_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
        CONSTRAINT [FK_ComplianceCertificates_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id])
    );

    CREATE INDEX [IX_ComplianceCertificates_ReportId]
        ON [dbo].[ComplianceCertificates]([ReportId]);
    CREATE INDEX [IX_ComplianceCertificates_JurisdictionId_ReportYear]
        ON [dbo].[ComplianceCertificates]([JurisdictionId], [ReportYear] DESC);
END
GO

-- ============================================================================
-- 10. BENEFITS WORKSHEET TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BenefitsWorksheet]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BenefitsWorksheet] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ReportId] UNIQUEIDENTIFIER NOT NULL,
        [JobClassificationId] UNIQUEIDENTIFIER NOT NULL,
        [BenefitType] NVARCHAR(100) NOT NULL,
        [BenefitValue] DECIMAL(18, 2) NOT NULL,
        [IncludedInSalary] BIT NOT NULL DEFAULT 0,
        [Notes] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_BenefitsWorksheet_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE,
        CONSTRAINT [FK_BenefitsWorksheet_JobClassifications]
            FOREIGN KEY ([JobClassificationId]) REFERENCES [dbo].[JobClassifications]([Id])
    );

    CREATE INDEX [IX_BenefitsWorksheet_ReportId]
        ON [dbo].[BenefitsWorksheet]([ReportId]);
    CREATE INDEX [IX_BenefitsWorksheet_JobClassificationId]
        ON [dbo].[BenefitsWorksheet]([JobClassificationId]);
END
GO

-- ============================================================================
-- 11. EMAIL TEMPLATES TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmailTemplates]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[EmailTemplates] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [TemplateName] NVARCHAR(100) NOT NULL UNIQUE,
        [Subject] NVARCHAR(255) NOT NULL,
        [Body] NVARCHAR(MAX) NOT NULL,
        [TemplateType] NVARCHAR(50) NOT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [Variables] NVARCHAR(MAX) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [CK_EmailTemplates_Type] CHECK ([TemplateType] IN (
            'submission_confirmation',
            'approval_notification',
            'rejection_notification',
            'manual_review_required',
            'deadline_reminder',
            'general_notification'
        ))
    );

    CREATE INDEX [IX_EmailTemplates_TemplateName]
        ON [dbo].[EmailTemplates]([TemplateName]);
    CREATE INDEX [IX_EmailTemplates_Type]
        ON [dbo].[EmailTemplates]([TemplateType])
        WHERE [IsActive] = 1;
END
GO

-- ============================================================================
-- 12. EMAIL LOG TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmailLog]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[EmailLog] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [JurisdictionId] UNIQUEIDENTIFIER NULL,
        [ReportId] UNIQUEIDENTIFIER NULL,
        [TemplateId] UNIQUEIDENTIFIER NULL,
        [RecipientEmail] NVARCHAR(255) NOT NULL,
        [RecipientName] NVARCHAR(255) NULL,
        [Subject] NVARCHAR(255) NOT NULL,
        [Body] NVARCHAR(MAX) NOT NULL,
        [Status] NVARCHAR(50) NOT NULL,
        [SentAt] DATETIMEOFFSET NULL,
        [ErrorMessage] NVARCHAR(MAX) NULL,
        [RetryCount] INT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_EmailLog_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id]),
        CONSTRAINT [FK_EmailLog_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]),
        CONSTRAINT [FK_EmailLog_EmailTemplates]
            FOREIGN KEY ([TemplateId]) REFERENCES [dbo].[EmailTemplates]([Id]),
        CONSTRAINT [CK_EmailLog_Status] CHECK ([Status] IN (
            'pending', 'sent', 'failed', 'queued'
        ))
    );

    CREATE INDEX [IX_EmailLog_JurisdictionId_SentAt]
        ON [dbo].[EmailLog]([JurisdictionId], [SentAt] DESC);
    CREATE INDEX [IX_EmailLog_ReportId]
        ON [dbo].[EmailLog]([ReportId], [SentAt] DESC);
    CREATE INDEX [IX_EmailLog_Status]
        ON [dbo].[EmailLog]([Status])
        WHERE [Status] IN ('pending', 'queued', 'failed');
END
GO

-- ============================================================================
-- 13. ADMIN CASE NOTES TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AdminCaseNotes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AdminCaseNotes] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [JurisdictionId] UNIQUEIDENTIFIER NOT NULL,
        [ReportId] UNIQUEIDENTIFIER NULL,
        [Title] NVARCHAR(255) NOT NULL,
        [Content] NVARCHAR(MAX) NOT NULL,
        [Priority] NVARCHAR(20) NOT NULL DEFAULT 'Normal',
        [Category] NVARCHAR(50) NULL,
        [AssignedTo] NVARCHAR(255) NULL,
        [DueDate] DATE NULL,
        [CompletedAt] DATETIMEOFFSET NULL,
        [CompletedBy] NVARCHAR(255) NULL,
        [IsPrivate] BIT NOT NULL DEFAULT 0,
        [CreatedBy] NVARCHAR(255) NOT NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_AdminCaseNotes_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id]),
        CONSTRAINT [FK_AdminCaseNotes_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id]),
        CONSTRAINT [CK_AdminCaseNotes_Priority] CHECK ([Priority] IN (
            'Low', 'Normal', 'High', 'Urgent'
        ))
    );

    CREATE INDEX [IX_AdminCaseNotes_JurisdictionId]
        ON [dbo].[AdminCaseNotes]([JurisdictionId], [CreatedAt] DESC);
    CREATE INDEX [IX_AdminCaseNotes_ReportId]
        ON [dbo].[AdminCaseNotes]([ReportId], [CreatedAt] DESC);
    CREATE INDEX [IX_AdminCaseNotes_Priority]
        ON [dbo].[AdminCaseNotes]([Priority], [CompletedAt])
        WHERE [CompletedAt] IS NULL;
END
GO

-- ============================================================================
-- 14. USER PROFILES TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserProfiles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserProfiles] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [UserId] NVARCHAR(450) NOT NULL UNIQUE, -- ASP.NET Identity User ID
        [JurisdictionId] UNIQUEIDENTIFIER NULL,
        [Email] NVARCHAR(255) NOT NULL UNIQUE,
        [FullName] NVARCHAR(255) NOT NULL,
        [Role] NVARCHAR(50) NOT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [LastLoginAt] DATETIMEOFFSET NULL,
        [LoginCount] INT NOT NULL DEFAULT 0,
        [Preferences] NVARCHAR(MAX) NULL, -- JSON
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_UserProfiles_Jurisdictions]
            FOREIGN KEY ([JurisdictionId]) REFERENCES [dbo].[Jurisdictions]([Id]),
        CONSTRAINT [CK_UserProfiles_Role] CHECK ([Role] IN (
            'Admin', 'JurisdictionUser', 'ReadOnly'
        ))
    );

    CREATE INDEX [IX_UserProfiles_UserId]
        ON [dbo].[UserProfiles]([UserId]);
    CREATE INDEX [IX_UserProfiles_Email]
        ON [dbo].[UserProfiles]([Email]);
    CREATE INDEX [IX_UserProfiles_JurisdictionId]
        ON [dbo].[UserProfiles]([JurisdictionId])
        WHERE [JurisdictionId] IS NOT NULL;
    CREATE INDEX [IX_UserProfiles_Role]
        ON [dbo].[UserProfiles]([Role])
        WHERE [IsActive] = 1;
END
GO

-- ============================================================================
-- 15. AUDIT LOG TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLog]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AuditLog] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [UserId] NVARCHAR(450) NULL,
        [UserEmail] NVARCHAR(255) NULL,
        [EntityType] NVARCHAR(100) NOT NULL,
        [EntityId] NVARCHAR(100) NOT NULL,
        [Action] NVARCHAR(50) NOT NULL,
        [OldValues] NVARCHAR(MAX) NULL, -- JSON
        [NewValues] NVARCHAR(MAX) NULL, -- JSON
        [IpAddress] NVARCHAR(50) NULL,
        [UserAgent] NVARCHAR(500) NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [CK_AuditLog_Action] CHECK ([Action] IN (
            'Create', 'Update', 'Delete', 'Login', 'Logout', 'View'
        ))
    );

    CREATE INDEX [IX_AuditLog_UserId_CreatedAt]
        ON [dbo].[AuditLog]([UserId], [CreatedAt] DESC);
    CREATE INDEX [IX_AuditLog_EntityType_EntityId]
        ON [dbo].[AuditLog]([EntityType], [EntityId], [CreatedAt] DESC);
    CREATE INDEX [IX_AuditLog_CreatedAt]
        ON [dbo].[AuditLog]([CreatedAt] DESC);
END
GO

-- ============================================================================
-- 16. SYSTEM CONFIG TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SystemConfig]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SystemConfig] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ConfigKey] NVARCHAR(100) NOT NULL UNIQUE,
        [ConfigValue] NVARCHAR(MAX) NOT NULL,
        [Description] NVARCHAR(500) NULL,
        [Category] NVARCHAR(50) NOT NULL DEFAULT 'General',
        [IsEncrypted] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        [UpdatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE INDEX [IX_SystemConfig_ConfigKey]
        ON [dbo].[SystemConfig]([ConfigKey]);
    CREATE INDEX [IX_SystemConfig_Category]
        ON [dbo].[SystemConfig]([Category]);
END
GO

-- ============================================================================
-- 17. NOTIFICATION QUEUE TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NotificationQueue]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[NotificationQueue] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [NotificationType] NVARCHAR(50) NOT NULL,
        [RecipientEmail] NVARCHAR(255) NOT NULL,
        [Subject] NVARCHAR(255) NOT NULL,
        [Body] NVARCHAR(MAX) NOT NULL,
        [Priority] INT NOT NULL DEFAULT 5,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending',
        [ScheduledFor] DATETIMEOFFSET NULL,
        [SentAt] DATETIMEOFFSET NULL,
        [ErrorMessage] NVARCHAR(MAX) NULL,
        [RetryCount] INT NOT NULL DEFAULT 0,
        [MaxRetries] INT NOT NULL DEFAULT 3,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [CK_NotificationQueue_Status] CHECK ([Status] IN (
            'pending', 'sent', 'failed', 'cancelled'
        ))
    );

    CREATE INDEX [IX_NotificationQueue_Status_Priority]
        ON [dbo].[NotificationQueue]([Status], [Priority] DESC)
        WHERE [Status] = 'pending';
    CREATE INDEX [IX_NotificationQueue_ScheduledFor]
        ON [dbo].[NotificationQueue]([ScheduledFor])
        WHERE [Status] = 'pending' AND [ScheduledFor] IS NOT NULL;
END
GO

-- ============================================================================
-- 18. REPORT ATTACHMENTS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReportAttachments]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ReportAttachments] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ReportId] UNIQUEIDENTIFIER NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [FileSize] BIGINT NOT NULL,
        [ContentType] NVARCHAR(100) NOT NULL,
        [FileData] VARBINARY(MAX) NULL, -- For small files, use blob storage for large
        [StoragePath] NVARCHAR(500) NULL, -- Path in blob storage
        [Description] NVARCHAR(MAX) NULL,
        [UploadedBy] NVARCHAR(255) NOT NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [FK_ReportAttachments_Reports]
            FOREIGN KEY ([ReportId]) REFERENCES [dbo].[Reports]([Id])
            ON DELETE CASCADE
    );

    CREATE INDEX [IX_ReportAttachments_ReportId]
        ON [dbo].[ReportAttachments]([ReportId]);
END
GO

-- ============================================================================
-- 19. DATA EXPORT LOG TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DataExportLog]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DataExportLog] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ExportType] NVARCHAR(50) NOT NULL,
        [ExportFormat] NVARCHAR(20) NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [RecordCount] INT NOT NULL,
        [FileSize] BIGINT NULL,
        [Filters] NVARCHAR(MAX) NULL, -- JSON
        [ExportedBy] NVARCHAR(255) NOT NULL,
        [ExportedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [CK_DataExportLog_Format] CHECK ([ExportFormat] IN (
            'Excel', 'CSV', 'PDF', 'JSON'
        ))
    );

    CREATE INDEX [IX_DataExportLog_ExportedAt]
        ON [dbo].[DataExportLog]([ExportedAt] DESC);
    CREATE INDEX [IX_DataExportLog_ExportedBy]
        ON [dbo].[DataExportLog]([ExportedBy], [ExportedAt] DESC);
END
GO

-- ============================================================================
-- 20. SYSTEM ALERTS TABLE
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SystemAlerts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SystemAlerts] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [AlertType] NVARCHAR(50) NOT NULL,
        [Severity] NVARCHAR(20) NOT NULL,
        [Title] NVARCHAR(255) NOT NULL,
        [Message] NVARCHAR(MAX) NOT NULL,
        [RelatedEntityType] NVARCHAR(100) NULL,
        [RelatedEntityId] NVARCHAR(100) NULL,
        [IsRead] BIT NOT NULL DEFAULT 0,
        [ReadBy] NVARCHAR(255) NULL,
        [ReadAt] DATETIMEOFFSET NULL,
        [ExpiresAt] DATETIMEOFFSET NULL,
        [CreatedAt] DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),

        CONSTRAINT [CK_SystemAlerts_Severity] CHECK ([Severity] IN (
            'Info', 'Warning', 'Error', 'Critical'
        ))
    );

    CREATE INDEX [IX_SystemAlerts_IsRead_CreatedAt]
        ON [dbo].[SystemAlerts]([IsRead], [CreatedAt] DESC);
    CREATE INDEX [IX_SystemAlerts_Severity]
        ON [dbo].[SystemAlerts]([Severity], [IsRead])
        WHERE [IsRead] = 0;
END
GO

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Active Reports by Jurisdiction
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ActiveReportsByJurisdiction')
BEGIN
    EXEC('
    CREATE VIEW [dbo].[vw_ActiveReportsByJurisdiction] AS
    SELECT
        j.Id AS JurisdictionId,
        j.Name AS JurisdictionName,
        j.JurisdictionId AS JurisdictionCode,
        j.JurisdictionType,
        r.Id AS ReportId,
        r.ReportYear,
        r.CaseNumber,
        r.CaseStatus,
        r.ComplianceStatus,
        r.ApprovalStatus,
        r.SubmittedAt,
        r.ApprovedAt,
        COUNT(jc.Id) AS JobCount,
        r.CreatedAt,
        r.UpdatedAt
    FROM [dbo].[Jurisdictions] j
    INNER JOIN [dbo].[Reports] r ON j.Id = r.JurisdictionId
    LEFT JOIN [dbo].[JobClassifications] jc ON r.Id = jc.ReportId
    WHERE r.CaseStatus IN (''Private'', ''Shared'', ''Submitted'')
    GROUP BY
        j.Id, j.Name, j.JurisdictionId, j.JurisdictionType,
        r.Id, r.ReportYear, r.CaseNumber, r.CaseStatus,
        r.ComplianceStatus, r.ApprovalStatus, r.SubmittedAt,
        r.ApprovedAt, r.CreatedAt, r.UpdatedAt
    ');
END
GO

-- View: Pending Approvals Summary
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'vw_PendingApprovals')
BEGIN
    EXEC('
    CREATE VIEW [dbo].[vw_PendingApprovals] AS
    SELECT
        r.Id AS ReportId,
        j.Id AS JurisdictionId,
        j.Name AS JurisdictionName,
        j.JurisdictionId AS JurisdictionCode,
        r.ReportYear,
        r.CaseNumber,
        r.SubmittedAt,
        r.ComplianceStatus,
        r.RequiresManualReview,
        r.ManualReviewReason,
        COUNT(jc.Id) AS JobCount,
        DATEDIFF(DAY, r.SubmittedAt, GETDATE()) AS DaysPending
    FROM [dbo].[Reports] r
    INNER JOIN [dbo].[Jurisdictions] j ON r.JurisdictionId = j.Id
    LEFT JOIN [dbo].[JobClassifications] jc ON r.Id = jc.ReportId
    WHERE r.ApprovalStatus = ''pending''
    GROUP BY
        r.Id, j.Id, j.Name, j.JurisdictionId,
        r.ReportYear, r.CaseNumber, r.SubmittedAt,
        r.ComplianceStatus, r.RequiresManualReview, r.ManualReviewReason
    ');
END
GO

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Stored Procedure: Get Compliance Summary by Year
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'usp_GetComplianceSummary')
    DROP PROCEDURE [dbo].[usp_GetComplianceSummary];
GO

CREATE PROCEDURE [dbo].[usp_GetComplianceSummary]
    @ReportYear INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        r.ComplianceStatus,
        COUNT(*) AS ReportCount,
        COUNT(CASE WHEN r.SubmittedOnTime = 1 THEN 1 END) AS OnTimeCount,
        COUNT(CASE WHEN r.AutoApproved = 1 THEN 1 END) AS AutoApprovedCount,
        COUNT(CASE WHEN r.RequiresManualReview = 1 THEN 1 END) AS ManualReviewCount,
        AVG(CASE
            WHEN r.SubmittedAt IS NOT NULL AND r.ApprovedAt IS NOT NULL
            THEN DATEDIFF(DAY, r.SubmittedAt, r.ApprovedAt)
            ELSE NULL
        END) AS AvgApprovalDays
    FROM [dbo].[Reports] r
    WHERE r.ReportYear = @ReportYear
    GROUP BY r.ComplianceStatus;
END
GO

-- Stored Procedure: Get Jurisdiction Dashboard
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'usp_GetJurisdictionDashboard')
    DROP PROCEDURE [dbo].[usp_GetJurisdictionDashboard];
GO

CREATE PROCEDURE [dbo].[usp_GetJurisdictionDashboard]
    @JurisdictionId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Jurisdiction Info
    SELECT
        Id,
        JurisdictionId,
        Name,
        Address,
        City,
        State,
        Zipcode,
        Phone,
        JurisdictionType,
        NextReportYear
    FROM [dbo].[Jurisdictions]
    WHERE Id = @JurisdictionId;

    -- Recent Reports
    SELECT
        r.Id,
        r.ReportYear,
        r.CaseNumber,
        r.CaseStatus,
        r.ComplianceStatus,
        r.ApprovalStatus,
        r.SubmittedAt,
        COUNT(jc.Id) AS JobCount
    FROM [dbo].[Reports] r
    LEFT JOIN [dbo].[JobClassifications] jc ON r.Id = jc.ReportId
    WHERE r.JurisdictionId = @JurisdictionId
    GROUP BY
        r.Id, r.ReportYear, r.CaseNumber, r.CaseStatus,
        r.ComplianceStatus, r.ApprovalStatus, r.SubmittedAt
    ORDER BY r.ReportYear DESC, r.CaseNumber DESC;

    -- Primary Contact
    SELECT TOP 1
        Id,
        Name,
        Title,
        Email,
        Phone
    FROM [dbo].[Contacts]
    WHERE JurisdictionId = @JurisdictionId
      AND IsPrimary = 1
      AND IsActive = 1;
END
GO

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert Default Email Templates
IF NOT EXISTS (SELECT * FROM [dbo].[EmailTemplates] WHERE TemplateName = 'submission_confirmation')
BEGIN
    INSERT INTO [dbo].[EmailTemplates] (TemplateName, Subject, Body, TemplateType, Variables)
    VALUES (
        'submission_confirmation',
        'Pay Equity Report Submitted Successfully',
        '<p>Dear {{JurisdictionName}},</p>
        <p>Your Pay Equity Report for {{ReportYear}} has been submitted successfully.</p>
        <p><strong>Case Number:</strong> {{CaseNumber}}<br>
        <strong>Submission Date:</strong> {{SubmissionDate}}</p>
        <p>Your report will be reviewed shortly. You will receive a notification once the review is complete.</p>
        <p>Thank you,<br>Minnesota Management & Budget<br>Pay Equity Unit</p>',
        'submission_confirmation',
        '["JurisdictionName", "ReportYear", "CaseNumber", "SubmissionDate"]'
    );
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[EmailTemplates] WHERE TemplateName = 'auto_approval')
BEGIN
    INSERT INTO [dbo].[EmailTemplates] (TemplateName, Subject, Body, TemplateType, Variables)
    VALUES (
        'auto_approval',
        'Pay Equity Report Approved - Certificate Available',
        '<p>Dear {{JurisdictionName}},</p>
        <p>Great news! Your Pay Equity Report for {{ReportYear}} has been automatically approved.</p>
        <p><strong>Case Number:</strong> {{CaseNumber}}<br>
        <strong>Approval Date:</strong> {{ApprovalDate}}<br>
        <strong>Status:</strong> In Compliance</p>
        <p>Your compliance certificate is now available for download in the system.</p>
        <p>Thank you for your timely submission and compliance.</p>
        <p>Best regards,<br>Minnesota Management & Budget<br>Pay Equity Unit</p>',
        'approval_notification',
        '["JurisdictionName", "ReportYear", "CaseNumber", "ApprovalDate"]'
    );
END
GO

-- Insert Default System Configuration
IF NOT EXISTS (SELECT * FROM [dbo].[SystemConfig] WHERE ConfigKey = 'submission_deadline_month')
BEGIN
    INSERT INTO [dbo].[SystemConfig] (ConfigKey, ConfigValue, Description, Category)
    VALUES
        ('submission_deadline_month', '1', 'Month for report submission deadline (1 = January)', 'Reporting'),
        ('submission_deadline_day', '31', 'Day for report submission deadline', 'Reporting'),
        ('reporting_cycle_years', '3', 'Number of years in reporting cycle', 'Reporting'),
        ('auto_approval_enabled', 'true', 'Enable automatic approval for compliant reports', 'Approval'),
        ('auto_approval_delay_minutes', '5', 'Minutes to wait before auto-approval', 'Approval'),
        ('underpayment_ratio_threshold', '80', 'Minimum underpayment ratio percentage for compliance', 'Compliance'),
        ('manual_review_male_classes_threshold', '3', 'Max male classes before manual review required', 'Compliance');
END
GO

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

PRINT '';
PRINT '============================================================================';
PRINT 'Minnesota Pay Equity Compliance System';
PRINT 'Database Schema Creation Complete';
PRINT '============================================================================';
PRINT '';
PRINT 'Tables Created: 20';
PRINT 'Views Created: 2';
PRINT 'Stored Procedures Created: 2';
PRINT 'Email Templates Seeded: 2';
PRINT 'System Configuration Seeded: 7 settings';
PRINT '';
PRINT 'Database is ready for use with ASP.NET Core application.';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Update connection string in appsettings.json';
PRINT '2. Configure Entity Framework Core DbContext';
PRINT '3. Run data migration from PostgreSQL (see migration_plan.md)';
PRINT '4. Deploy ASP.NET Core Web API';
PRINT '';
PRINT '============================================================================';
GO
