# Minnesota Pay Equity Compliance System
## Migration Plan: React/Supabase to ASP.NET Core/SQL Server

**Document Version:** 1.0  
**Date:** November 20, 2025  
**Status:** Draft - Planning Phase

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Migration Strategy Overview](#migration-strategy-overview)
3. [Pre-Migration Assessment](#pre-migration-assessment)
4. [Phase-by-Phase Migration Plan](#phase-by-phase-migration-plan)
5. [Database Migration](#database-migration)
6. [Backend API Migration](#backend-api-migration)
7. [Frontend Migration Considerations](#frontend-migration-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Strategy](#deployment-strategy)
10. [Risk Management](#risk-management)
11. [Rollback Plan](#rollback-plan)
12. [Timeline and Resources](#timeline-and-resources)

---

## Executive Summary

### Migration Overview

This document outlines the comprehensive migration plan for transitioning the Minnesota Pay Equity Compliance System from its current React/TypeScript frontend with Supabase (PostgreSQL) backend to a new ASP.NET Core 8.0 Web API with SQL Server backend.

### Key Migration Goals

- **Zero Data Loss**: Preserve all existing jurisdiction, report, and compliance data
- **Functional Parity**: Maintain all current features and workflows
- **Minimal Downtime**: Target < 4 hours of system unavailability
- **Improved Performance**: Leverage SQL Server optimizations
- **Enhanced Security**: Implement enterprise-grade authentication and authorization
- **Better Maintainability**: Transition to Clean Architecture pattern

### Migration Approach

**Big Bang vs. Phased Migration**: We recommend a **phased migration** approach with parallel systems running during transition to minimize risk and allow for validation at each stage.

### Estimated Timeline

- **Phase 1 (Infrastructure)**: 2-3 weeks
- **Phase 2 (Database Migration)**: 2-3 weeks
- **Phase 3 (Backend Development)**: 8-10 weeks
- **Phase 4 (Frontend Updates)**: 4-6 weeks
- **Phase 5 (Testing & Validation)**: 3-4 weeks
- **Phase 6 (Deployment & Cutover)**: 1-2 weeks

**Total Duration**: 20-28 weeks (5-7 months)

---

## Migration Strategy Overview

### Strategic Approach

#### 1. Parallel Development Strategy

Run both old and new systems in parallel during migration:

```
┌─────────────────────────────────────────────────────┐
│                 Migration Period                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Current System  │      │   New System     │   │
│  │  React/Supabase  │◄────►│  ASP.NET/SQL     │   │
│  │                  │ Sync │                  │   │
│  └──────────────────┘      └──────────────────┘   │
│          │                          │              │
│          │                          │              │
│          ▼                          ▼              │
│    Active Users              Testing/Validation    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Benefits**:
- Allows thorough testing with real data
- Enables rollback if issues arise
- Minimizes user disruption
- Validates data integrity continuously

#### 2. Database-First Migration

Start with database migration to establish solid foundation:

1. **Schema Conversion**: PostgreSQL → SQL Server
2. **Data Migration**: Full historical data transfer
3. **Validation**: Comprehensive data integrity checks
4. **Sync Mechanism**: Two-way sync during transition

#### 3. API Compatibility Layer

Build ASP.NET Core APIs to match existing Supabase REST API contracts initially, then optimize:

```typescript
// Current Supabase Call
const { data } = await supabase
  .from('reports')
  .select('*')
  .eq('jurisdiction_id', id);

// Transitional API Call (same structure)
const response = await fetch('/api/reports?jurisdiction_id=' + id);
const data = await response.json();

// Future Optimized API Call
const data = await reportService.getByJurisdiction(id);
```

### Critical Success Factors

1. **Executive Sponsorship**: Ensure MMB leadership commitment
2. **Dedicated Team**: Full-time developers, DBA, QA, PM
3. **User Communication**: Regular updates to jurisdictions
4. **Comprehensive Testing**: Automated and manual validation
5. **Data Backup**: Multiple backup points throughout migration

---

## Pre-Migration Assessment

### Current System Inventory

#### Database Assessment

**Current Supabase (PostgreSQL) Database**:

| Table Name | Record Count (Est.) | Critical? | Complexity |
|-----------|-------------------|-----------|------------|
| jurisdictions | ~850 | Yes | Medium |
| contacts | ~2,500 | Yes | Low |
| reports | ~3,000 | Yes | High |
| job_classifications | ~50,000 | Yes | High |
| implementation_reports | ~3,000 | Yes | Medium |
| submission_history | ~5,000 | Yes | Medium |
| report_revisions | ~1,000 | Yes | High |
| approval_history | ~8,000 | Yes | Medium |
| compliance_certificates | ~2,500 | Yes | Low |
| email_log | ~15,000 | No | Low |
| admin_case_notes | ~10,000 | Yes | Medium |
| benefits_worksheet | ~2,000 | Yes | Low |
| audit_log | ~50,000 | Yes | Low |
| user_profiles | ~1,200 | Yes | High |

**Total Estimated Data Volume**: ~2-3 GB

#### API Inventory

**Existing Supabase API Endpoints** (auto-generated):
- CRUD operations on all tables
- Real-time subscriptions
- Row-Level Security (RLS) policies
- PostgREST interface

**Custom Business Logic**:
- Compliance analysis algorithms (TypeScript)
- Auto-approval service
- Certificate generation
- Email notification system
- Submission workflow service

#### Frontend Components

**React Components**: 80+ components
**Critical User Flows**:
1. User authentication and authorization
2. Jurisdiction management
3. Report creation and submission
4. Job data entry (bulk and manual)
5. Compliance analysis
6. Implementation form
7. Post-submission workflow (reopen/resubmit)
8. Admin approval dashboard
9. Certificate generation and download

### Dependency Analysis

#### External Dependencies

**Current System**:
- `@supabase/supabase-js` - Database client
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF table formatting
- `xlsx` - Excel import/export
- `lucide-react` - Icons

**New System Requirements**:
- Entity Framework Core 8.0
- Microsoft.Data.SqlClient
- iTextSharp or QuestPDF for PDF generation
- EPPlus or NPOI for Excel handling
- Identity Framework for authentication

### Data Quality Assessment

**Pre-Migration Data Audit**:

1. **Identify Data Issues**:
   ```sql
   -- Orphaned records
   SELECT * FROM job_classifications j
   WHERE NOT EXISTS (
     SELECT 1 FROM reports r WHERE r.id = j.report_id
   );
   
   -- Invalid data ranges
   SELECT * FROM job_classifications
   WHERE min_salary > max_salary OR points < 0;
   
   -- Missing required fields
   SELECT * FROM jurisdictions
   WHERE name IS NULL OR jurisdiction_id IS NULL;
   ```

2. **Data Cleansing Plan**:
   - Fix orphaned records
   - Correct invalid data ranges
   - Populate missing required fields
   - Standardize data formats

3. **Data Volume Verification**:
   ```sql
   SELECT 
     (SELECT COUNT(*) FROM jurisdictions) as jurisdictions,
     (SELECT COUNT(*) FROM reports) as reports,
     (SELECT COUNT(*) FROM job_classifications) as jobs,
     (SELECT COUNT(*) FROM contacts) as contacts;
   ```

---

## Phase-by-Phase Migration Plan

### Phase 1: Infrastructure Setup (2-3 Weeks)

#### Week 1: Environment Provisioning

**Tasks**:
1. Provision SQL Server database (Azure SQL or on-premise)
2. Set up development, staging, and production environments
3. Configure Azure App Service or on-premise IIS
4. Establish VPN/network connectivity
5. Set up Azure DevOps or GitHub for CI/CD

**Deliverables**:
- ✅ SQL Server instances provisioned
- ✅ App Service environments configured
- ✅ Network connectivity established
- ✅ DevOps pipelines created

#### Week 2-3: Development Environment

**Tasks**:
1. Create ASP.NET Core 8.0 solution structure
2. Set up Entity Framework Core
3. Configure development tools (Visual Studio, SQL Server Management Studio)
4. Establish coding standards and project structure
5. Set up automated build and deployment pipelines

**Deliverables**:
- ✅ Solution structure created
- ✅ EF Core configured
- ✅ CI/CD pipelines operational
- ✅ Development environment fully functional

---

### Phase 2: Database Migration (2-3 Weeks)

#### Week 1: Schema Conversion

**Step 1: Generate SQL Server DDL**

Convert PostgreSQL schema to SQL Server:

```sql
-- PostgreSQL UUID → SQL Server UNIQUEIDENTIFIER
-- PostgreSQL SERIAL → SQL Server IDENTITY
-- PostgreSQL JSONB → SQL Server NVARCHAR(MAX) + JSON validation
-- PostgreSQL TEXT → SQL Server NVARCHAR(MAX)
-- PostgreSQL TIMESTAMP WITH TIME ZONE → SQL Server DATETIMEOFFSET

-- Example: Jurisdictions Table
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

CREATE INDEX [IX_Jurisdictions_JurisdictionId] 
    ON [dbo].[Jurisdictions]([JurisdictionId]);
CREATE INDEX [IX_Jurisdictions_Name] 
    ON [dbo].[Jurisdictions]([Name]);
```

**Step 2: Create All Tables**

Execute comprehensive DDL script for all 20+ tables with:
- Primary keys
- Foreign key constraints
- Indexes for performance
- Check constraints for data validation
- Default values

**Step 3: Create Views and Stored Procedures**

```sql
-- View: Active Reports by Jurisdiction
CREATE VIEW [dbo].[vw_ActiveReportsByJurisdiction] AS
SELECT 
    j.Id AS JurisdictionId,
    j.Name AS JurisdictionName,
    j.JurisdictionId AS JurisdictionCode,
    r.Id AS ReportId,
    r.ReportYear,
    r.CaseNumber,
    r.CaseStatus,
    r.ApprovalStatus,
    r.SubmittedAt,
    COUNT(jc.Id) AS JobCount
FROM [dbo].[Jurisdictions] j
INNER JOIN [dbo].[Reports] r ON j.Id = r.JurisdictionId
LEFT JOIN [dbo].[JobClassifications] jc ON r.Id = jc.ReportId
WHERE r.CaseStatus IN ('Private', 'Shared', 'Submitted')
GROUP BY 
    j.Id, j.Name, j.JurisdictionId, 
    r.Id, r.ReportYear, r.CaseNumber, 
    r.CaseStatus, r.ApprovalStatus, r.SubmittedAt;

-- Stored Procedure: Get Compliance Summary
CREATE PROCEDURE [dbo].[usp_GetComplianceSummary]
    @ReportYear INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.ComplianceStatus,
        COUNT(*) AS ReportCount,
        COUNT(CASE WHEN r.SubmittedOnTime = 1 THEN 1 END) AS OnTimeCount,
        COUNT(CASE WHEN r.AutoApproved = 1 THEN 1 END) AS AutoApprovedCount
    FROM [dbo].[Reports] r
    WHERE r.ReportYear = @ReportYear
    GROUP BY r.ComplianceStatus;
END;
```

#### Week 2: Data Migration & Validation

**Step 1: Export Data from PostgreSQL**

Use pg_dump or custom export scripts:

```bash
#!/bin/bash
# Export all tables to CSV

TABLES=(
    "jurisdictions"
    "contacts"
    "reports"
    "job_classifications"
    "implementation_reports"
    "submission_history"
    "report_revisions"
    "approval_history"
    "compliance_certificates"
    "email_log"
    "admin_case_notes"
    "benefits_worksheet"
    "audit_log"
    "user_profiles"
)

for table in "${TABLES[@]}"; do
    psql -d pay_equity_db -c "\COPY $table TO '/tmp/${table}.csv' WITH CSV HEADER"
done
```

**Step 2: Data Transformation**

Create transformation scripts to handle:

```python
import pandas as pd
import uuid

def transform_uuids(csv_file):
    """Convert PostgreSQL UUIDs to SQL Server format"""
    df = pd.read_csv(csv_file)
    
    # UUID columns that need transformation
    uuid_columns = ['id', 'jurisdiction_id', 'report_id', 'created_by']
    
    for col in uuid_columns:
        if col in df.columns:
            # PostgreSQL UUID format is compatible with SQL Server
            # Just validate format
            df[col] = df[col].apply(lambda x: str(uuid.UUID(x)))
    
    return df

def transform_timestamps(csv_file):
    """Convert PostgreSQL timestamps to SQL Server DATETIMEOFFSET"""
    df = pd.read_csv(csv_file)
    
    timestamp_columns = ['created_at', 'updated_at', 'submitted_at', 'approved_at']
    
    for col in timestamp_columns:
        if col in df.columns:
            # Convert to ISO 8601 format with timezone
            df[col] = pd.to_datetime(df[col]).dt.strftime('%Y-%m-%d %H:%M:%S.%f %z')
    
    return df

def transform_json_fields(csv_file):
    """Convert JSONB to NVARCHAR(MAX) for SQL Server"""
    df = pd.read_csv(csv_file)
    
    json_columns = ['test_results', 'test_applicability', 'metadata', 'changes_summary']
    
    for col in json_columns:
        if col in df.columns:
            # Ensure valid JSON format
            df[col] = df[col].apply(lambda x: json.dumps(json.loads(x)) if pd.notna(x) else None)
    
    return df

# Transform all data files
for table in TABLES:
    df = pd.read_csv(f'/tmp/{table}.csv')
    df = transform_uuids(df)
    df = transform_timestamps(df)
    df = transform_json_fields(df)
    df.to_csv(f'/tmp/{table}_transformed.csv', index=False)
```

**Step 3: Import Data to SQL Server**

Use SQL Server BCP utility:

```bash
#!/bin/bash
# Import transformed data to SQL Server

SERVER="your-server.database.windows.net"
DATABASE="PayEquityDB"
USERNAME="admin"

for table in "${TABLES[@]}"; do
    echo "Importing $table..."
    
    bcp dbo.$table in /tmp/${table}_transformed.csv \
        -S $SERVER \
        -d $DATABASE \
        -U $USERNAME \
        -c \
        -t, \
        -r "\n" \
        -F 2 \
        -e /tmp/${table}_errors.txt
    
    echo "$table imported. Check /tmp/${table}_errors.txt for errors."
done
```

**Step 4: Data Validation**

```sql
-- Validation Script: Compare record counts
SELECT 'Jurisdictions' AS TableName, COUNT(*) AS RecordCount FROM Jurisdictions
UNION ALL
SELECT 'Contacts', COUNT(*) FROM Contacts
UNION ALL
SELECT 'Reports', COUNT(*) FROM Reports
UNION ALL
SELECT 'JobClassifications', COUNT(*) FROM JobClassifications
UNION ALL
SELECT 'ImplementationReports', COUNT(*) FROM ImplementationReports;

-- Validation: Check foreign key integrity
SELECT 'Orphaned Contacts' AS Issue, COUNT(*) AS Count
FROM Contacts c
WHERE NOT EXISTS (SELECT 1 FROM Jurisdictions j WHERE j.Id = c.JurisdictionId)
UNION ALL
SELECT 'Orphaned Reports', COUNT(*)
FROM Reports r
WHERE NOT EXISTS (SELECT 1 FROM Jurisdictions j WHERE j.Id = r.JurisdictionId)
UNION ALL
SELECT 'Orphaned Jobs', COUNT(*)
FROM JobClassifications jc
WHERE NOT EXISTS (SELECT 1 FROM Reports r WHERE r.Id = jc.ReportId);

-- Validation: Data integrity checks
SELECT 'Invalid Salary Range' AS Issue, COUNT(*) AS Count
FROM JobClassifications
WHERE MinSalary > MaxSalary
UNION ALL
SELECT 'Negative Points', COUNT(*)
FROM JobClassifications
WHERE Points < 0
UNION ALL
SELECT 'Invalid Report Year', COUNT(*)
FROM Reports
WHERE ReportYear < 2000 OR ReportYear > YEAR(GETDATE()) + 1;
```

#### Week 3: Performance Optimization

**Create Indexes**:

```sql
-- Indexes for common query patterns

-- Jurisdictions
CREATE INDEX IX_Jurisdictions_NextReportYear 
    ON Jurisdictions(NextReportYear) 
    WHERE NextReportYear IS NOT NULL;

-- Reports
CREATE INDEX IX_Reports_JurisdictionId_ReportYear 
    ON Reports(JurisdictionId, ReportYear);
CREATE INDEX IX_Reports_CaseStatus 
    ON Reports(CaseStatus) 
    INCLUDE (JurisdictionId, ReportYear, CaseNumber);
CREATE INDEX IX_Reports_ApprovalStatus 
    ON Reports(ApprovalStatus) 
    WHERE ApprovalStatus IN ('pending', 'draft');
CREATE INDEX IX_Reports_SubmittedAt 
    ON Reports(SubmittedAt) 
    WHERE SubmittedAt IS NOT NULL;

-- Job Classifications
CREATE INDEX IX_JobClassifications_ReportId 
    ON JobClassifications(ReportId) 
    INCLUDE (JobNumber, Title, Points, MinSalary, MaxSalary);

-- Approval History
CREATE INDEX IX_ApprovalHistory_ReportId_CreatedAt 
    ON ApprovalHistory(ReportId, CreatedAt DESC);

-- Email Log
CREATE INDEX IX_EmailLog_JurisdictionId_SentAt 
    ON EmailLog(JurisdictionId, SentAt DESC);

-- Admin Case Notes
CREATE INDEX IX_AdminCaseNotes_JurisdictionId_Priority 
    ON AdminCaseNotes(JurisdictionId, Priority) 
    WHERE CompletedAt IS NULL;
```

**Create Statistics**:

```sql
-- Create statistics for query optimizer
CREATE STATISTICS Stats_Reports_ComplianceStatus 
    ON Reports(ComplianceStatus, CaseStatus);

CREATE STATISTICS Stats_Jobs_Points_Salary 
    ON JobClassifications(Points, MinSalary, MaxSalary);
```

---

### Phase 3: Backend API Development (8-10 Weeks)

#### Week 1-2: Core Infrastructure

**Tasks**:
1. Create solution structure with Clean Architecture
2. Set up Entity Framework Core models
3. Configure dependency injection
4. Implement repository pattern
5. Create base API controllers

**Project Structure**:

```
PayEquityCompliance/
├── src/
│   ├── PayEquity.Domain/              # Domain entities and interfaces
│   │   ├── Entities/
│   │   ├── Enums/
│   │   └── Interfaces/
│   ├── PayEquity.Application/         # Business logic and services
│   │   ├── DTOs/
│   │   ├── Services/
│   │   ├── Validators/
│   │   └── Interfaces/
│   ├── PayEquity.Infrastructure/      # Data access and external services
│   │   ├── Data/
│   │   ├── Repositories/
│   │   └── Services/
│   └── PayEquity.API/                 # Web API
│       ├── Controllers/
│       ├── Middleware/
│       └── Configuration/
├── tests/
│   ├── PayEquity.UnitTests/
│   ├── PayEquity.IntegrationTests/
│   └── PayEquity.LoadTests/
└── docs/
```

**Entity Framework DbContext**:

```csharp
public class PayEquityDbContext : DbContext
{
    public PayEquityDbContext(DbContextOptions<PayEquityDbContext> options)
        : base(options)
    {
    }

    public DbSet<Jurisdiction> Jurisdictions { get; set; }
    public DbSet<Contact> Contacts { get; set; }
    public DbSet<Report> Reports { get; set; }
    public DbSet<JobClassification> JobClassifications { get; set; }
    public DbSet<ImplementationReport> ImplementationReports { get; set; }
    public DbSet<SubmissionHistory> SubmissionHistories { get; set; }
    public DbSet<ReportRevision> ReportRevisions { get; set; }
    public DbSet<ApprovalHistory> ApprovalHistories { get; set; }
    public DbSet<ComplianceCertificate> ComplianceCertificates { get; set; }
    public DbSet<AdminCaseNote> AdminCaseNotes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PayEquityDbContext).Assembly);
    }
}
```

#### Week 3-4: Authentication & Authorization

**Implement JWT Authentication**:

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    options.AddPolicy("JurisdictionUser", policy => 
        policy.RequireRole("Admin", "JurisdictionUser"));
});
```

**Authentication Service**:

```csharp
public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest request);
    Task<AuthResult> RefreshTokenAsync(string refreshToken);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
    Task LogoutAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly PayEquityDbContext _context;

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return AuthResult.Failed("Invalid credentials");

        var result = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!result)
            return AuthResult.Failed("Invalid credentials");

        var userProfile = await _context.UserProfiles
            .Include(up => up.Jurisdiction)
            .FirstOrDefaultAsync(up => up.UserId == user.Id);

        var token = GenerateJwtToken(user, userProfile);
        var refreshToken = GenerateRefreshToken();

        // Store refresh token
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _userManager.UpdateAsync(user);

        return AuthResult.Success(token, refreshToken, userProfile);
    }

    private string GenerateJwtToken(ApplicationUser user, UserProfile profile)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, profile.Role),
            new Claim("JurisdictionId", profile.JurisdictionId?.ToString() ?? ""),
            new Claim("JurisdictionName", profile.Jurisdiction?.Name ?? "")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

#### Week 5-6: Core Business Services

**Compliance Analysis Service**:

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

        // Perform linear regression
        var regression = PerformLinearRegression(jobs);
        
        // Calculate predicted pay for each job
        var jobsWithPredicted = CalculatePredictedPay(jobs, regression);
        
        // Perform statistical tests
        var statisticalTest = PerformStatisticalTest(jobsWithPredicted);
        var salaryRangeTest = PerformSalaryRangeTest(jobs);
        var exceptionalServiceTest = PerformExceptionalServiceTest(jobs);

        // Determine overall compliance
        bool isCompliant = statisticalTest.UnderpaymentRatioPassed &&
                          (salaryRangeTest.Passed || !salaryRangeTest.Applicable) &&
                          (exceptionalServiceTest.Passed || !exceptionalServiceTest.Applicable);

        return new ComplianceResult
        {
            IsCompliant = isCompliant,
            StatisticalTest = statisticalTest,
            SalaryRangeTest = salaryRangeTest,
            ExceptionalServiceTest = exceptionalServiceTest,
            RequiresManualReview = CheckManualReviewRequired(jobs, statisticalTest)
        };
    }

    private LinearRegressionResult PerformLinearRegression(
        List<JobClassification> jobs)
    {
        // Filter: only jobs with males > 0
        var maleJobs = jobs.Where(j => j.Males > 0).ToList();
        
        if (maleJobs.Count < 4)
            return new LinearRegressionResult { RequiresManualReview = true };

        int n = maleJobs.Count;
        double sumX = maleJobs.Sum(j => (double)j.Points);
        double sumY = maleJobs.Sum(j => (double)j.MaxSalary);
        double sumXY = maleJobs.Sum(j => j.Points * (double)j.MaxSalary);
        double sumX2 = maleJobs.Sum(j => Math.Pow(j.Points, 2));

        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - Math.Pow(sumX, 2));
        double intercept = (sumY - slope * sumX) / n;

        return new LinearRegressionResult
        {
            Slope = slope,
            Intercept = intercept,
            RequiresManualReview = false
        };
    }

    private StatisticalTestResult PerformStatisticalTest(
        List<JobWithPredictedPay> jobs)
    {
        var femaleJobs = jobs.Where(j => j.Job.Females > 0).ToList();
        
        if (femaleJobs.Count == 0)
            return new StatisticalTestResult { UnderpaymentRatioPassed = true };

        double totalUnderpayment = 0;
        double totalPredictedPay = 0;

        foreach (var job in femaleJobs)
        {
            double actualPay = job.Job.MaxSalary;
            double predictedPay = job.PredictedPay;
            
            if (actualPay < predictedPay)
            {
                totalUnderpayment += (predictedPay - actualPay) * job.Job.Females;
            }
            
            totalPredictedPay += predictedPay * job.Job.Females;
        }

        double underpaymentRatio = totalPredictedPay > 0
            ? ((totalPredictedPay - totalUnderpayment) / totalPredictedPay) * 100
            : 100;

        return new StatisticalTestResult
        {
            UnderpaymentRatioPassed = underpaymentRatio >= 80,
            UnderpaymentRatio = underpaymentRatio,
            TotalUnderpayment = totalUnderpayment,
            TotalPredictedPay = totalPredictedPay
        };
    }
}
```

**Auto-Approval Service**:

```csharp
public class AutoApprovalService : IAutoApprovalService
{
    private readonly PayEquityDbContext _context;
    private readonly IComplianceAnalysisService _complianceService;
    private readonly ICertificateGeneratorService _certificateService;
    private readonly IEmailService _emailService;

    public async Task<bool> ProcessAutoApprovalAsync(Guid reportId)
    {
        var report = await _context.Reports
            .Include(r => r.Jurisdiction)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null)
            return false;

        // Check submission deadline
        bool submittedOnTime = CheckSubmissionDeadline(report);
        
        if (!submittedOnTime)
        {
            await RequireManualReview(report, 
                "Submitted after January 31st deadline");
            return false;
        }

        // Analyze compliance
        var complianceResult = await _complianceService
            .AnalyzeComplianceAsync(reportId);

        if (complianceResult.RequiresManualReview)
        {
            await RequireManualReview(report, 
                "Three or fewer male classes - Alternative Analysis required");
            return false;
        }

        if (complianceResult.IsCompliant)
        {
            // Generate certificate
            var certificateData = await _certificateService
                .GenerateCertificateAsync(report);

            // Update report status
            report.ApprovalStatus = ApprovalStatus.AutoApproved;
            report.CaseStatus = CaseStatus.InCompliance;
            report.ApprovedAt = DateTime.UtcNow;
            report.ApprovedBy = "Auto-Approval System";
            report.CertificateGeneratedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            // Send approval notification
            await _emailService.SendApprovalNotificationAsync(report, certificateData);

            return true;
        }
        else
        {
            report.ApprovalStatus = ApprovalStatus.Pending;
            report.CaseStatus = CaseStatus.OutOfCompliance;
            await _context.SaveChangesAsync();

            await _emailService.SendStaffNotificationAsync(report, 
                "Failed compliance tests - manual review needed");

            return false;
        }
    }
}
```

#### Week 7-8: Report & Job Management APIs

**Report Controller**:

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly IAuthorizationService _authService;

    [HttpGet]
    public async Task<ActionResult<List<ReportDto>>> GetReports(
        [FromQuery] Guid? jurisdictionId = null,
        [FromQuery] int? reportYear = null,
        [FromQuery] string? caseStatus = null)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userJurisdictionId = User.FindFirstValue("JurisdictionId");
        var userRole = User.FindFirstValue(ClaimTypes.Role);

        // Admin can see all reports, jurisdiction users only their own
        if (userRole != "Admin" && jurisdictionId != Guid.Parse(userJurisdictionId))
        {
            return Forbid();
        }

        var reports = await _reportService.GetReportsAsync(
            jurisdictionId, reportYear, caseStatus);
        
        return Ok(reports);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReportDto>> GetReport(Guid id)
    {
        var report = await _reportService.GetReportByIdAsync(id);
        
        if (report == null)
            return NotFound();

        // Check authorization
        if (!await CanAccessReport(id))
            return Forbid();

        return Ok(report);
    }

    [HttpPost]
    public async Task<ActionResult<ReportDto>> CreateReport(
        [FromBody] CreateReportRequest request)
    {
        // Validate user can create report for this jurisdiction
        if (!await CanManageJurisdiction(request.JurisdictionId))
            return Forbid();

        var report = await _reportService.CreateReportAsync(request);
        
        return CreatedAtAction(nameof(GetReport), 
            new { id = report.Id }, report);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReportDto>> UpdateReport(
        Guid id, [FromBody] UpdateReportRequest request)
    {
        if (!await CanAccessReport(id))
            return Forbid();

        var report = await _reportService.UpdateReportAsync(id, request);
        
        if (report == null)
            return NotFound();

        return Ok(report);
    }

    [HttpPost("{id}/submit")]
    public async Task<ActionResult> SubmitReport(
        Guid id, [FromBody] SubmitReportRequest request)
    {
        if (!await CanAccessReport(id))
            return Forbid();

        var result = await _reportService.SubmitReportAsync(id, request);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("{id}/reopen")]
    public async Task<ActionResult> ReopenReport(Guid id)
    {
        if (!await CanAccessReport(id))
            return Forbid();

        var result = await _reportService.ReopenReportAsync(id);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}
```

#### Week 9-10: Integration & Edge Cases

**Tasks**:
1. Implement certificate generation
2. Build email notification system
3. Create Excel import/export functionality
4. Implement audit logging
5. Handle edge cases and error scenarios

---

### Phase 4: Frontend Updates (4-6 Weeks)

#### Week 1-2: API Client Migration

**Replace Supabase Client with API Client**:

```typescript
// Old: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// New: src/lib/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );
          localStorage.setItem('auth_token', data.token);
          error.config.headers.Authorization = `Bearer ${data.token}`;
          return apiClient.request(error.config);
        } catch {
          // Refresh failed, redirect to login
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  // Reports
  getReports: (jurisdictionId?: string, reportYear?: number) =>
    apiClient.get('/reports', { 
      params: { jurisdictionId, reportYear } 
    }),
  
  getReport: (id: string) =>
    apiClient.get(`/reports/${id}`),
  
  createReport: (data: CreateReportRequest) =>
    apiClient.post('/reports', data),
  
  updateReport: (id: string, data: UpdateReportRequest) =>
    apiClient.put(`/reports/${id}`, data),
  
  submitReport: (id: string, data: SubmitReportRequest) =>
    apiClient.post(`/reports/${id}/submit`, data),
  
  reopenReport: (id: string) =>
    apiClient.post(`/reports/${id}/reopen`),
  
  // Jobs
  getJobs: (reportId: string) =>
    apiClient.get('/jobs', { params: { reportId } }),
  
  createJob: (data: CreateJobRequest) =>
    apiClient.post('/jobs', data),
  
  updateJob: (id: string, data: UpdateJobRequest) =>
    apiClient.put(`/jobs/${id}`, data),
  
  deleteJob: (id: string) =>
    apiClient.delete(`/jobs/${id}`),
  
  importJobs: (reportId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/jobs/import/${reportId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Compliance
  analyzeCompliance: (reportId: string) =>
    apiClient.post(`/compliance/analyze/${reportId}`),
  
  // Certificates
  getCertificate: (reportId: string) =>
    apiClient.get(`/certificates/${reportId}`, {
      responseType: 'blob'
    })
};
```

#### Week 3-4: Component Updates

**Update React Components to use new API**:

```typescript
// Example: ReportManagement.tsx

// OLD VERSION (Supabase)
const loadReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*, jurisdiction:jurisdictions(*)')
    .eq('jurisdiction_id', jurisdictionId)
    .order('report_year', { ascending: false });
  
  if (error) {
    console.error('Error loading reports:', error);
    return;
  }
  
  setReports(data);
};

// NEW VERSION (API)
const loadReports = async () => {
  try {
    const { data } = await api.getReports(jurisdictionId);
    setReports(data);
  } catch (error) {
    console.error('Error loading reports:', error);
    toast.error('Failed to load reports');
  }
};

// Submit report
const handleSubmit = async () => {
  try {
    await api.submitReport(reportId, {
      revisionNotes: notes,
      checklistData: checklist
    });
    toast.success('Report submitted successfully!');
    await loadReports();
  } catch (error) {
    console.error('Error submitting report:', error);
    toast.error('Failed to submit report');
  }
};
```

#### Week 5-6: Testing & Bug Fixes

**Tasks**:
1. Test all user workflows end-to-end
2. Fix any API integration issues
3. Update error handling
4. Improve loading states
5. Test offline scenarios

---

### Phase 5: Testing & Validation (3-4 Weeks)

#### Week 1: Unit Testing

**Backend Unit Tests**:

```csharp
[Fact]
public async Task AnalyzeCompliance_WithCompliantData_ReturnsCompliant()
{
    // Arrange
    var jobs = CreateTestJobs(compliant: true);
    var reportId = Guid.NewGuid();
    await SeedJobClassifications(reportId, jobs);
    
    // Act
    var result = await _complianceService.AnalyzeComplianceAsync(reportId);
    
    // Assert
    Assert.True(result.IsCompliant);
    Assert.True(result.StatisticalTest.UnderpaymentRatioPassed);
    Assert.True(result.StatisticalTest.UnderpaymentRatio >= 80);
}

[Fact]
public async Task SubmitReport_AfterDeadline_RequiresManualReview()
{
    // Arrange
    var report = CreateTestReport(submittedAt: new DateTime(2025, 2, 15));
    await _context.Reports.AddAsync(report);
    await _context.SaveChangesAsync();
    
    // Act
    var result = await _autoApprovalService.ProcessAutoApprovalAsync(report.Id);
    
    // Assert
    Assert.False(result);
    var updatedReport = await _context.Reports.FindAsync(report.Id);
    Assert.Equal(ApprovalStatus.Pending, updatedReport.ApprovalStatus);
    Assert.True(updatedReport.RequiresManualReview);
}
```

#### Week 2: Integration Testing

**API Integration Tests**:

```csharp
public class ReportsControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    
    [Fact]
    public async Task GetReports_AsJurisdictionUser_ReturnsOnlyOwnReports()
    {
        // Arrange
        var token = await GetJurisdictionUserToken();
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
        
        // Act
        var response = await _client.GetAsync("/api/reports");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var reports = await response.Content.ReadAsAsync<List<ReportDto>>();
        Assert.All(reports, r => 
            Assert.Equal(TestData.JurisdictionId, r.JurisdictionId));
    }
    
    [Fact]
    public async Task SubmitReport_WithValidData_ReturnsSuccess()
    {
        // Arrange
        var reportId = await CreateTestReport();
        await AddJobClassifications(reportId, 10);
        await CompleteImplementationForm(reportId);
        
        var request = new SubmitReportRequest
        {
            RevisionNotes = "Initial submission",
            ChecklistComplete = true
        };
        
        // Act
        var response = await _client.PostAsJsonAsync(
            $"/api/reports/{reportId}/submit", request);
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        // Verify report status changed
        var report = await GetReport(reportId);
        Assert.Equal("Submitted", report.CaseStatus);
    }
}
```

#### Week 3: User Acceptance Testing (UAT)

**UAT Test Scenarios**:

1. **Complete Report Submission Workflow**
   - Create new report
   - Add 10-15 job classifications
   - Complete compliance analysis
   - Fill implementation form
   - Submit report
   - Verify auto-approval or manual review

2. **Post-Submission Workflow**
   - Submit report
   - Reopen for editing
   - Modify job data
   - Resubmit with revision notes
   - Verify revision tracking

3. **Admin Approval Workflow**
   - Login as admin
   - View pending reports
   - Review compliance results
   - Approve/reject reports
   - Verify notifications sent

4. **Data Import/Export**
   - Import jobs from Excel
   - Export report data
   - Generate compliance certificate
   - Download certificate PDF

#### Week 4: Performance & Load Testing

**Load Test Scenarios**:

```javascript
// Using k6 for load testing

import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failures
  },
};

export default function () {
  // Login
  let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'TestPassword123!'
  }));
  
  check(loginRes, {
    'login successful': (r) => r.status === 200
  });
  
  let token = loginRes.json('token');
  let headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Get reports
  let reportsRes = http.get(`${BASE_URL}/api/reports`, { headers });
  check(reportsRes, {
    'reports loaded': (r) => r.status === 200
  });
  
  // Get specific report
  let reportId = reportsRes.json('0.id');
  let reportRes = http.get(`${BASE_URL}/api/reports/${reportId}`, { headers });
  check(reportRes, {
    'report details loaded': (r) => r.status === 200
  });
  
  sleep(1);
}
```

---

### Phase 6: Deployment & Cutover (1-2 Weeks)

#### Week 1: Staging Deployment

**Tasks**:
1. Deploy to staging environment
2. Final data sync from production
3. Smoke testing
4. User training sessions

**Deployment Checklist**:

```bash
# Pre-Deployment
[ ] Backup production database
[ ] Verify all migrations tested
[ ] Review environment variables
[ ] Check SSL certificates
[ ] Verify DNS records

# Deployment Steps
[ ] Deploy database migrations
[ ] Deploy API to staging
[ ] Deploy frontend to staging
[ ] Run smoke tests
[ ] Verify integrations (email, etc.)

# Post-Deployment
[ ] Monitor application logs
[ ] Check database connections
[ ] Verify API endpoints
[ ] Test critical workflows
```

#### Week 2: Production Cutover

**Cutover Plan** (4-hour maintenance window):

**Hour 1: Pre-Cutover (10:00 PM - 11:00 PM)**
```
10:00 PM - Announce maintenance window to users
10:15 PM - Set old system to read-only mode
10:30 PM - Final database backup
10:45 PM - Final data sync to new database
```

**Hour 2: Migration (11:00 PM - 12:00 AM)**
```
11:00 PM - Run final data validation scripts
11:15 PM - Deploy new API to production
11:30 PM - Deploy new frontend to production
11:45 PM - Update DNS records
```

**Hour 3: Verification (12:00 AM - 1:00 AM)**
```
12:00 AM - Run smoke tests on production
12:15 AM - Verify critical workflows
12:30 AM - Check data integrity
12:45 AM - Monitor error logs
```

**Hour 4: Rollout (1:00 AM - 2:00 AM)**
```
1:00 AM - Enable new system for users
1:15 AM - Monitor user activity
1:30 AM - Verify no critical errors
1:45 AM - Send "system available" notification
2:00 AM - Maintenance window complete
```

**Go/No-Go Criteria**:

```
GO if:
✓ All smoke tests pass
✓ Data validation shows < 0.1% variance
✓ All critical APIs responding < 500ms
✓ Zero critical errors in logs
✓ Test user workflows complete successfully

NO-GO if:
✗ Any smoke test fails
✗ Data validation shows > 1% variance
✗ Any critical API unresponsive
✗ Critical errors in logs
✗ Test workflows fail
```

---

## Testing Strategy

### Comprehensive Test Plan

#### 1. Unit Testing

**Backend (C#) - Target: 80% code coverage**

```csharp
// Example test structure
public class ComplianceAnalysisServiceTests
{
    [Theory]
    [InlineData(100, 95, true)]   // Compliant: 95% ratio
    [InlineData(100, 79, false)]  // Non-compliant: 79% ratio
    [InlineData(100, 80, true)]   // Edge case: exactly 80%
    public void CalculateUnderpaymentRatio_VariousScenarios_ReturnsExpected(
        decimal predicted, decimal actual, bool shouldPass)
    {
        // Test implementation
    }
}
```

**Test Categories**:
- Business logic (compliance calculations)
- Data access (repository methods)
- Service layer (orchestration)
- Utility methods
- Validation logic

#### 2. Integration Testing

**API Integration Tests**

```csharp
[Collection("Integration")]
public class ReportSubmissionIntegrationTests
{
    [Fact]
    public async Task FullReportSubmissionWorkflow_EndToEnd_Succeeds()
    {
        // 1. Create jurisdiction
        var jurisdiction = await CreateTestJurisdiction();
        
        // 2. Create user
        var user = await CreateTestUser(jurisdiction.Id);
        
        // 3. Login and get token
        var token = await LoginUser(user);
        
        // 4. Create report
        var report = await CreateReport(jurisdiction.Id, token);
        
        // 5. Add jobs
        await AddMultipleJobs(report.Id, 15, token);
        
        // 6. Complete implementation form
        await CompleteImplementationForm(report.Id, token);
        
        // 7. Submit report
        var submitResult = await SubmitReport(report.Id, token);
        Assert.True(submitResult.Success);
        
        // 8. Verify auto-approval triggered
        await Task.Delay(5000); // Wait for async processing
        var updatedReport = await GetReport(report.Id, token);
        Assert.Equal("In Compliance", updatedReport.CaseStatus);
    }
}
```

#### 3. Performance Testing

**Load Test Scenarios**:

| Scenario | Users | Duration | Success Criteria |
|----------|-------|----------|------------------|
| Normal Load | 50 | 10 min | p95 < 500ms |
| Peak Load | 200 | 5 min | p95 < 1000ms |
| Stress Test | 500 | 5 min | No errors |
| Spike Test | 50→500→50 | 10 min | Recovery < 2min |

#### 4. Security Testing

**Security Test Plan**:

- [ ] Authentication bypass attempts
- [ ] SQL injection tests
- [ ] XSS vulnerability scans
- [ ] CSRF protection validation
- [ ] Authorization boundary tests
- [ ] JWT token manipulation
- [ ] Rate limiting verification
- [ ] File upload security
- [ ] API endpoint enumeration

#### 5. User Acceptance Testing

**UAT Test Scenarios** (with real users):

1. **Jurisdiction User Tests**
   - Complete new report from scratch
   - Import job data from Excel
   - Submit and reopen report
   - Download certificate

2. **Admin User Tests**
   - Review pending reports
   - Approve/reject reports
   - Search and filter jurisdictions
   - Generate system reports

3. **Edge Cases**
   - Late submission handling
   - Alternative analysis workflow
   - Large dataset (500+ jobs)
   - Concurrent user edits

---

## Risk Management

### Identified Risks & Mitigation

#### High Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | Critical | Low | Multiple backups, validation scripts, parallel systems |
| Extended downtime | High | Medium | Thorough testing, rollback plan, off-hours deployment |
| Compliance calculation errors | Critical | Low | Extensive unit tests, manual verification, parallel calculation |
| Performance degradation | High | Medium | Load testing, caching strategy, database optimization |
| User adoption issues | Medium | Medium | Training, documentation, support plan |

#### Medium Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Integration issues | Medium | Medium | Early integration testing, API contracts |
| Security vulnerabilities | High | Low | Security audit, penetration testing |
| Budget overrun | Medium | Medium | Clear scope, change management process |
| Timeline delays | Medium | High | Buffer time, parallel workstreams |

### Risk Response Plan

**If critical error found in production**:

1. **Immediate Actions** (0-5 minutes)
   - Alert on-call team
   - Assess severity
   - Determine if rollback needed

2. **Assessment** (5-15 minutes)
   - Identify root cause
   - Estimate fix time
   - Check if data affected

3. **Decision** (15-30 minutes)
   - **Option A**: Quick fix (if < 30 min)
   - **Option B**: Rollback to old system
   - **Option C**: Temporary workaround

4. **Communication** (Throughout)
   - Update status page
   - Email affected users
   - Post updates every 30 minutes

---

## Rollback Plan

### Rollback Decision Tree

```
Critical Issue Detected
         |
         ▼
   Can we fix in < 1 hour?
         |
    Yes ─┴─ No
     |        |
     ▼        ▼
  Deploy   Initiate
   Fix    Rollback
```

### Rollback Procedure

**Phase 1: Decision (5 minutes)**
```
1. Assess issue severity
2. Consult decision tree
3. Get approval from project manager
4. Notify all stakeholders
```

**Phase 2: Execution (30 minutes)**
```
1. Switch DNS back to old system
2. Set new system to read-only
3. Sync any new data back to old database
4. Verify old system operational
5. Notify users of rollback
```

**Phase 3: Analysis (next day)**
```
1. Root cause analysis
2. Fix issues in staging
3. Re-test thoroughly
4. Schedule new cutover
```

### Data Sync Strategy During Rollback

**If rollback needed within 2 hours**:
- New system was read-mostly
- Minimal new data created
- Manual sync acceptable

**If rollback needed after 2 hours**:
- Automated sync scripts required
- Identify all new/modified records
- Sync back to old database
- Validate data integrity

---

## Timeline and Resources

### Detailed Project Timeline

```
Month 1: Infrastructure & Planning
├─ Week 1: Environment setup
├─ Week 2: Database schema design
├─ Week 3: Database migration
└─ Week 4: Data validation

Month 2-3: Backend Development
├─ Week 5-6: Core infrastructure & auth
├─ Week 7-8: Business services
├─ Week 9-10: API endpoints
├─ Week 11-12: Integration & testing
└─ Week 12: Backend complete

Month 4-5: Frontend Updates
├─ Week 13-14: API client migration
├─ Week 15-16: Component updates
├─ Week 17-18: Testing & bug fixes
└─ Week 18: Frontend complete

Month 6: Testing & Deployment
├─ Week 19-20: Integration testing
├─ Week 21: UAT with users
├─ Week 22: Performance & security testing
├─ Week 23: Staging deployment
├─ Week 24: Production cutover
└─ Week 24: Go-live celebration! 🎉
```

### Resource Requirements

#### Team Composition

| Role | Count | Commitment | Duration |
|------|-------|-----------|----------|
| Backend Developer (.NET) | 2 | Full-time | 5 months |
| Frontend Developer (React) | 1 | Full-time | 3 months |
| Database Administrator | 1 | Part-time (50%) | 6 months |
| QA Engineer | 1 | Full-time | 4 months |
| DevOps Engineer | 1 | Part-time (25%) | 6 months |
| Project Manager | 1 | Part-time (50%) | 6 months |
| Business Analyst | 1 | Part-time (25%) | 3 months |

#### Budget Estimate

| Category | Cost (Estimated) |
|----------|-----------------|
| Personnel (7 people, 6 months) | $420,000 |
| Azure Infrastructure (6 months) | $12,000 |
| SQL Server Licenses | $5,000 |
| Development Tools | $3,000 |
| Testing Tools | $2,000 |
| Training & Documentation | $5,000 |
| Contingency (15%) | $67,050 |
| **Total** | **$514,050** |

---

## Success Criteria

### Migration Success Metrics

#### Technical Metrics

- [ ] **Data Integrity**: 100% of records migrated without loss
- [ ] **Performance**: API response times < 500ms (p95)
- [ ] **Availability**: 99.9% uptime in first month
- [ ] **Security**: Zero critical vulnerabilities
- [ ] **Test Coverage**: >80% code coverage

#### Business Metrics

- [ ] **User Adoption**: 95% of users successfully using new system within 2 weeks
- [ ] **Support Tickets**: <5% increase in first month
- [ ] **Functionality**: 100% feature parity with old system
- [ ] **Data Quality**: <0.1% variance in compliance calculations
- [ ] **Downtime**: <4 hours total during cutover

#### User Satisfaction

- [ ] User satisfaction survey: >4.0/5.0
- [ ] Task completion rate: >95%
- [ ] Time to complete workflows: Same or faster than old system

---

## Post-Migration Activities

### Week 1 After Go-Live

**Daily Tasks**:
- Monitor error logs and application metrics
- Track user adoption and usage patterns
- Respond to support tickets within 2 hours
- Daily standup to address issues

**Metrics to Track**:
- Active user count
- API response times
- Error rates
- Support ticket volume
- User feedback

### Month 1 After Go-Live

**Weekly Tasks**:
- Review performance metrics
- Analyze user feedback
- Prioritize enhancement requests
- Update documentation based on user questions

**Deliverables**:
- Week 1 retrospective report
- Month 1 success metrics report
- Lessons learned document
- Recommended improvements list

### Ongoing Maintenance

**Monthly**:
- Review and optimize database performance
- Update security patches
- Review and clear old logs
- Capacity planning review

**Quarterly**:
- Major feature enhancements
- User training refreshers
- System health audit
- Disaster recovery drill

---

## Appendix

### A. Database Migration Scripts

Comprehensive scripts available in separate document: `database_migration_scripts.sql`

### B. API Endpoint Mapping

| Old Supabase Endpoint | New ASP.NET Core Endpoint | Notes |
|-----------------------|---------------------------|-------|
| `GET /rest/v1/reports?select=*&jurisdiction_id=eq.{id}` | `GET /api/reports?jurisdictionId={id}` | Simplified query syntax |
| `POST /rest/v1/reports` | `POST /api/reports` | Similar structure |
| `PATCH /rest/v1/reports?id=eq.{id}` | `PUT /api/reports/{id}` | Changed PATCH to PUT |

### C. Configuration Settings

**appsettings.json template**:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=PayEquityDB;..."
  },
  "Jwt": {
    "Key": "...",
    "Issuer": "PayEquityAPI",
    "Audience": "PayEquityClient",
    "ExpirationHours": 8
  },
  "Email": {
    "SmtpServer": "smtp.office365.com",
    "SmtpPort": 587,
    "FromAddress": "payequity.mmb@state.mn.us"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### D. User Training Plan

**Training Sessions**:

1. **Session 1: Introduction to New System** (1 hour)
   - Overview of changes
   - Login and navigation
   - Q&A

2. **Session 2: Report Management** (2 hours)
   - Creating reports
   - Adding job data
   - Submitting reports
   - Hands-on practice

3. **Session 3: Advanced Features** (1 hour)
   - Post-submission workflow
   - Data import/export
   - Tips and tricks

4. **Session 4: Admin Training** (2 hours)
   - Approval dashboard
   - Administrative functions
   - Reporting and analytics

---

## Contact Information

**Project Team**:
- Project Manager: [Name] - [email]
- Lead Backend Developer: [Name] - [email]
- Lead Frontend Developer: [Name] - [email]
- Database Administrator: [Name] - [email]

**Stakeholders**:
- MMB Pay Equity Unit: payequity.mmb@state.mn.us
- IT Department: [email]

**Support**:
- Development Team: [email]
- Helpdesk: [phone/email]

---

**End of Migration Plan**

**Document Status**: Draft - Awaiting Approval  
**Next Review Date**: Upon stakeholder approval  
**Version**: 1.0  
**Last Updated**: November 20, 2025
