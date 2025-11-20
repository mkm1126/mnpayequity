# Planning Documents for ASP.NET Core Migration

This directory contains comprehensive planning documents for migrating the Minnesota Pay Equity Compliance System from React/Supabase to ASP.NET Core with SQL Server.

## Document Overview

### 1. **ASPNET_CORE_REQUIREMENTS.md** (70KB)
**Purpose**: Comprehensive technical requirements for the ASP.NET Core rebuild

**Contents**:
- Executive Summary
- System Overview
- Architecture Requirements (Clean Architecture pattern)
- Complete Database Schema with SQL DDL
- 40+ RESTful API Endpoints with examples
- Business Logic Requirements (including full compliance algorithm in C#)
- Security Requirements
- Testing Requirements
- Deployment Requirements

**Key Sections**:
- Complete C# implementation of compliance analysis algorithms
- Linear regression calculation code
- Auto-approval service implementation
- Post-submission workflow service
- Entity Framework Core entity definitions
- SQL Server database schema with all constraints and indexes

---

### 2. **architecture_diagram.md** (70KB)
**Purpose**: Detailed system architecture diagrams and patterns

**Contents**:
- Clean Architecture (Onion Architecture) pattern
- Layer-by-layer breakdown (Domain, Application, Infrastructure, API)
- Component interaction diagrams
- Database architecture
- Authentication & authorization flow
- Deployment architecture (Azure and on-premise)
- Technology stack decisions

**Key Diagrams**:
```
┌─────────────────────────────────────┐
│      Presentation Layer (API)       │
│                                     │
│  Controllers, Middleware, Filters   │
└─────────────┬───────────────────────┘
              ▼
┌─────────────────────────────────────┐
│       Application Layer             │
│                                     │
│  Services, Use Cases, DTOs          │
└─────────────┬───────────────────────┘
              ▼
┌─────────────────────────────────────┐
│          Domain Layer               │
│                                     │
│  Entities, Interfaces, Business Rules│
└─────────────┬───────────────────────┘
              ▼
┌─────────────────────────────────────┐
│      Infrastructure Layer           │
│                                     │
│  Data Access, External Services     │
└─────────────────────────────────────┘
```

---

### 3. **api_specification.md** (20KB)
**Purpose**: Complete REST API specification

**Contents**:
- All 40+ API endpoints with full documentation
- Request/response examples with JSON
- Authentication flows
- Error handling patterns
- Status codes and error responses
- Query parameters and filtering
- Pagination standards

**Endpoint Categories**:
- Authentication (`/auth/*`)
- Jurisdictions (`/jurisdictions/*`)
- Reports (`/reports/*`)
- Job Classifications (`/jobs/*`)
- Compliance Analysis (`/compliance/*`)
- Certificates (`/certificates/*`)
- Admin Operations (`/admin/*`)

**Example Endpoint**:
```http
POST /api/reports/{id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "revisionNotes": "Initial submission",
  "checklistData": { ... }
}

Response 200 OK:
{
  "success": true,
  "reportId": "guid",
  "caseStatus": "Submitted",
  "approvalStatus": "auto_approved",
  "certificateGenerated": true
}
```

---

### 4. **migration_plan.md** (56KB)
**Purpose**: Step-by-step migration plan from current system to new system

**Contents**:
- **Phase 1**: Infrastructure Setup (2-3 weeks)
- **Phase 2**: Database Migration (2-3 weeks)
- **Phase 3**: Backend Development (8-10 weeks)
- **Phase 4**: Frontend Updates (4-6 weeks)
- **Phase 5**: Testing & Validation (3-4 weeks)
- **Phase 6**: Deployment & Cutover (1-2 weeks)

**Key Sections**:
- Pre-migration assessment
- Database schema conversion (PostgreSQL → SQL Server)
- Data migration scripts and validation
- Data transformation procedures
- Testing strategy (unit, integration, UAT, performance)
- Deployment strategy with rollback plan
- Risk management
- Timeline and resource requirements

**Total Timeline**: 20-28 weeks (5-7 months)

**Budget Estimate**: $514,050

**Cutover Plan**: 4-hour maintenance window with detailed hour-by-hour tasks

---

### 5. **database_schema.sql** (42KB, 1,022 lines)
**Purpose**: Complete SQL Server database creation script

**Contents**:
- All 20 table definitions with complete DDL
- Primary keys, foreign keys, and constraints
- Indexes for optimal performance
- Check constraints for data validation
- 2 database views for common queries
- 2 stored procedures for reporting
- Seed data for email templates and system configuration
- Comprehensive inline documentation

**Tables Created**:
1. Jurisdictions - Local government entities
2. Contacts - Contact persons for jurisdictions
3. Reports - Pay equity reports
4. JobClassifications - Job data with salary and points
5. ImplementationReports - Implementation form data
6. SubmissionHistory - Audit trail of submissions
7. ReportRevisions - Change tracking for resubmissions
8. ApprovalHistory - Approval workflow tracking
9. ComplianceCertificates - Generated certificates
10. BenefitsWorksheet - Benefits comparison data
11. EmailTemplates - Email template library
12. EmailLog - Email communication tracking
13. AdminCaseNotes - Administrative case management
14. UserProfiles - User accounts linked to auth system
15. AuditLog - System-wide audit trail
16. SystemConfig - System configuration settings
17. NotificationQueue - Email notification queue
18. ReportAttachments - File attachments for reports
19. DataExportLog - Track data exports
20. SystemAlerts - Admin alerts and notifications

**Views**:
- `vw_ActiveReportsByJurisdiction` - Active reports with job counts
- `vw_PendingApprovals` - Pending reports awaiting approval

**Stored Procedures**:
- `usp_GetComplianceSummary` - Compliance statistics by year
- `usp_GetJurisdictionDashboard` - Complete jurisdiction overview

**Usage**:
```sql
-- Run on new SQL Server database
sqlcmd -S your-server -d PayEquityDB -i database_schema.sql
```

---

### 6. **post-submission-workflow-plan.md** (19KB)
**Purpose**: Detailed specification for the post-submission workflow feature

**Contents**:
- Feature overview (reopen reports after submission)
- Current vs. proposed workflow
- Self-service revert capability
- Status communication improvements
- Enhanced error prevention
- Streamlined resubmission process
- User guidance improvements

**Key Features**:
- "Reopen for Editing" button on submitted reports
- Revision tracking and history
- Change summaries
- Audit trail of all reopening/resubmission actions

**Note**: This feature is already implemented in the current React/Supabase system and must be maintained in the ASP.NET Core version.

---

## Existing Documentation (Original System)

### 7. **FUNCTIONAL_SPECIFICATION.md** (9.8KB)
Original functional requirements for the current React/Supabase system.

### 8. **HELP_CENTER_SPECIFICATION.md** (45KB)
User help documentation and contextual help specifications.

### 9. **ASP_NET_HELP_MENU_SPECIFICATION.md** (42KB)
Help menu requirements specifically for ASP.NET implementation.

---

## How to Use These Documents

### For Project Managers
1. Start with **ASPNET_CORE_REQUIREMENTS.md** for scope and budget
2. Review **migration_plan.md** for timeline and resources
3. Use documents for stakeholder presentations

### For Developers
1. Read **architecture_diagram.md** to understand system design
2. Use **ASPNET_CORE_REQUIREMENTS.md** for implementation details
3. Reference **api_specification.md** when building APIs
4. Follow **migration_plan.md** for phased development

### For QA Engineers
1. Use **ASPNET_CORE_REQUIREMENTS.md** for test case creation
2. Follow **migration_plan.md** testing strategy
3. Reference **api_specification.md** for API testing

### For Database Administrators
1. Use **database_schema.sql** to create SQL Server database
2. Review **migration_plan.md** Phase 2 for database migration
3. Use DDL scripts in **ASPNET_CORE_REQUIREMENTS.md** for reference
4. Follow data validation procedures

---

## Document Maintenance

**Last Updated**: November 20, 2025
**Version**: 1.0
**Status**: Complete - Ready for Review

**Review Schedule**:
- Update after stakeholder review
- Revise based on implementation feedback
- Maintain as living documents during project

---

## Quick Reference

| Task | Document to Reference |
|------|----------------------|
| Understanding system architecture | architecture_diagram.md |
| Creating SQL Server database | database_schema.sql |
| Implementing compliance calculations | ASPNET_CORE_REQUIREMENTS.md (Business Logic section) |
| Building REST APIs | api_specification.md |
| Planning database migration | migration_plan.md (Phase 2) |
| Estimating timeline and budget | migration_plan.md (Timeline section) |
| Writing test cases | ASPNET_CORE_REQUIREMENTS.md (Testing section) |
| Implementing post-submission workflow | post-submission-workflow-plan.md |
| Deploying to production | migration_plan.md (Phase 6) |

---

## Critical Implementation Notes

### ⚠️ Must-Haves

1. **Compliance Algorithm Accuracy**
   - The compliance calculation algorithms must be implemented EXACTLY as specified
   - Linear regression, underpayment ratio, salary range tests are critical
   - Any deviation could result in incorrect compliance determinations

2. **Data Integrity**
   - Zero data loss during migration is non-negotiable
   - All 20+ tables and relationships must be preserved
   - Comprehensive validation at each migration step

3. **Security**
   - Role-based access control must be strictly enforced
   - Audit logging for all data changes
   - JWT authentication with proper token management

4. **Performance**
   - API response times must meet SLA (p95 < 500ms)
   - Support for 200+ concurrent users
   - Database indexes for optimal query performance

5. **Functional Parity**
   - All features from current system must be maintained
   - Post-submission workflow (reopen/resubmit)
   - Auto-approval system
   - Certificate generation

---

## Contact Information

**For Questions About These Documents**:
- Technical Lead: [Name]
- Project Manager: [Name]
- Solution Architect: [Name]

**Document Location**: `/docs` directory in project repository

---

## Appendices

### A. Technology Stack Summary

**Backend**:
- ASP.NET Core 8.0
- C# 12.0
- Entity Framework Core 8.0
- SQL Server 2019+

**Key Libraries**:
- AutoMapper - Object mapping
- FluentValidation - Input validation
- Serilog - Logging
- Hangfire - Background jobs
- iTextSharp/QuestPDF - PDF generation
- xUnit - Testing

**Infrastructure**:
- Azure SQL Database
- Azure App Service
- Azure DevOps (CI/CD)

### B. Key Acronyms

- **MMB**: Minnesota Management and Budget
- **RLS**: Row Level Security (Supabase feature)
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Token
- **EF Core**: Entity Framework Core
- **DTO**: Data Transfer Object
- **UAT**: User Acceptance Testing

### C. Related Files

All planning documents reference these key implementation files:
- `src/lib/complianceAnalysis.ts` (current TypeScript implementation)
- `src/lib/autoApprovalService.ts` (current auto-approval logic)
- `src/lib/supabase.ts` (current type definitions)
- `supabase/migrations/*.sql` (current database schema)

---

**End of Planning Documents README**
