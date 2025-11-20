# Minnesota Pay Equity Compliance System
## ASP.NET Core Architecture Diagram

**Version:** 1.0  
**Date:** November 2024  
**Target Platform:** ASP.NET Core 8.0 with SQL Server

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#system-architecture-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Application Architecture](#application-architecture)
4. [Data Architecture](#data-architecture)
5. [Security Architecture](#security-architecture)
6. [Deployment Architecture](#deployment-architecture)
7. [Integration Architecture](#integration-architecture)

---

## SYSTEM ARCHITECTURE OVERVIEW

### Architecture Style
**Clean Architecture (Onion Architecture)**

```
┌─────────────────────────────────────────────────────────────┐
│                         Presentation Layer                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Blazor Server Pages / Razor Pages + Controllers       │ │
│  │  - Authentication UI                                    │ │
│  │  - Jurisdiction Management UI                           │ │
│  │  - Report Management UI                                 │ │
│  │  - Admin Dashboards                                     │ │
│  │  - API Controllers (RESTful)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                        Application Layer                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services & Use Cases                                   │ │
│  │  - JurisdictionService                                  │ │
│  │  - ReportService                                        │ │
│  │  - ComplianceAnalysisService                           │ │
│  │  - SubmissionWorkflowService                           │ │
│  │  - AutoApprovalService                                 │ │
│  │  - NotificationService                                  │ │
│  │                                                         │ │
│  │  DTOs, Validators, Mappers                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                          Domain Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Domain Entities                                        │ │
│  │  - Jurisdiction, Contact, Report                        │ │
│  │  - JobClassification                                    │ │
│  │  - ImplementationReport                                 │ │
│  │                                                         │ │
│  │  Business Rules & Domain Logic                          │ │
│  │  - Gender Classification Rules                          │ │
│  │  - Compliance Calculation Logic                         │ │
│  │  - Auto-Approval Rules                                  │ │
│  │                                                         │ │
│  │  Domain Events                                          │ │
│  │  - ReportSubmittedEvent                                 │ │
│  │  - ReportApprovedEvent                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Access (EF Core)                                  │ │
│  │  - ApplicationDbContext                                 │ │
│  │  - Repositories                                         │ │
│  │  - Migrations                                           │ │
│  │                                                         │ │
│  │  External Services                                      │ │
│  │  - EmailService (SendGrid/SMTP)                        │ │
│  │  - PdfGenerationService (iTextSharp)                   │ │
│  │  - ExcelExportService (EPPlus)                         │ │
│  │  - FileStorageService (Blob Storage)                   │ │
│  │  - CacheService (Redis)                                │ │
│  │                                                         │ │
│  │  Identity                                               │ │
│  │  - ASP.NET Core Identity                               │ │
│  │  - JWT Token Service                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    Database & Storage                        │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  SQL Server      │  │ Blob Storage │  │ Redis Cache  │  │
│  │  - Tables        │  │ - PDFs       │  │ - Sessions   │  │
│  │  - Indexes       │  │ - Files      │  │ - App Cache  │  │
│  │  - Stored Procs  │  │              │  │              │  │
│  └──────────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## HIGH-LEVEL ARCHITECTURE

### System Context Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        External Systems                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Email Service│  │  File Storage│  │  Monitoring Service  │  │
│  │  (SendGrid)  │  │ (Blob Store) │  │ (App Insights)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘  │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          ↓                  ↓                  ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Pay Equity Compliance System                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Web Application                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │   Web UI     │  │  REST API    │  │  Background     │  │ │
│  │  │  (Blazor)    │  │ Controllers  │  │    Jobs         │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Services                     │ │
│  │  - Compliance Analysis  - Auto-Approval  - Notifications   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Data & Storage                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │ │
│  │  │ SQL Server   │  │    Cache     │  │   File Storage  │  │ │
│  │  │   Database   │  │    (Redis)   │  │     (Blob)      │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          ↑                  ↑                  ↑
          │                  │                  │
┌─────────┴──────────────────┴──────────────────┴──────────────────┐
│                              Users                               │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Jurisdiction │  │     Admin    │  │    Coordinator       │  │
│  │    Users     │  │    Users     │  │       Users          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### User Interaction Flow

```
┌─────────────┐
│ User Visits │
│   Website   │
└──────┬──────┘
       ↓
┌──────────────────┐
│  Login Page      │
│  - Email         │
│  - Password      │
└──────┬───────────┘
       ↓
┌──────────────────────┐
│  Authentication      │
│  (ASP.NET Identity)  │
└──────┬───────────────┘
       ↓
   ┌───┴────┐
   │Verified?│
   └───┬────┘
       │ Yes
       ↓
┌──────────────────────┐
│   User Dashboard     │
│  - Jurisdiction Info │
│  - Reports List      │
│  - Quick Actions     │
└──────┬───────────────┘
       ↓
   ┌───┴─────────────────────┐
   │ User Action?            │
   └────┬────────────────────┘
        │
   ┌────┴────┬─────────┬─────────┐
   │         │         │         │
   ↓         ↓         ↓         ↓
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Create│ │ Edit │ │Submit│ │Export│
│Report│ │Report│ │Report│ │Report│
└──────┘ └──────┘ └──────┘ └──────┘
```

---

## APPLICATION ARCHITECTURE

### Project Structure

```
PayEquityCompliance/
│
├── src/
│   │
│   ├── PayEquity.Domain/                    # Domain Layer (Core)
│   │   ├── Entities/
│   │   │   ├── Jurisdiction.cs
│   │   │   ├── Contact.cs
│   │   │   ├── Report.cs
│   │   │   ├── JobClassification.cs
│   │   │   ├── ImplementationReport.cs
│   │   │   └── ...
│   │   ├── ValueObjects/
│   │   │   ├── Address.cs
│   │   │   ├── ComplianceResult.cs
│   │   │   └── ...
│   │   ├── Events/
│   │   │   ├── ReportSubmittedEvent.cs
│   │   │   ├── ReportApprovedEvent.cs
│   │   │   └── ...
│   │   ├── Interfaces/
│   │   │   ├── IRepository.cs
│   │   │   └── IUnitOfWork.cs
│   │   └── Exceptions/
│   │       ├── DomainException.cs
│   │       └── ...
│   │
│   ├── PayEquity.Application/               # Application Layer
│   │   ├── Services/
│   │   │   ├── JurisdictionService.cs
│   │   │   ├── ReportService.cs
│   │   │   ├── ComplianceAnalysisService.cs
│   │   │   ├── SubmissionWorkflowService.cs
│   │   │   ├── AutoApprovalService.cs
│   │   │   ├── NotificationService.cs
│   │   │   └── ...
│   │   ├── DTOs/
│   │   │   ├── JurisdictionDto.cs
│   │   │   ├── ReportDto.cs
│   │   │   ├── ComplianceResultDto.cs
│   │   │   └── ...
│   │   ├── Validators/
│   │   │   ├── CreateReportValidator.cs
│   │   │   ├── SubmitReportValidator.cs
│   │   │   └── ...
│   │   ├── Mappings/
│   │   │   └── AutoMapperProfile.cs
│   │   ├── Interfaces/
│   │   │   ├── IJurisdictionService.cs
│   │   │   ├── IReportService.cs
│   │   │   └── ...
│   │   └── Exceptions/
│   │       └── ApplicationException.cs
│   │
│   ├── PayEquity.Infrastructure/            # Infrastructure Layer
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── JurisdictionConfiguration.cs
│   │   │   │   ├── ReportConfiguration.cs
│   │   │   │   └── ...
│   │   │   └── Migrations/
│   │   │       └── (EF Core migrations)
│   │   ├── Repositories/
│   │   │   ├── GenericRepository.cs
│   │   │   ├── JurisdictionRepository.cs
│   │   │   ├── ReportRepository.cs
│   │   │   └── ...
│   │   ├── Identity/
│   │   │   ├── ApplicationUser.cs
│   │   │   ├── ApplicationRole.cs
│   │   │   └── IdentityService.cs
│   │   ├── Services/
│   │   │   ├── EmailService.cs
│   │   │   ├── PdfGenerationService.cs
│   │   │   ├── ExcelExportService.cs
│   │   │   ├── FileStorageService.cs
│   │   │   └── CacheService.cs
│   │   └── Extensions/
│   │       └── ServiceCollectionExtensions.cs
│   │
│   ├── PayEquity.Web/                       # Presentation Layer (UI)
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── Controllers/
│   │   │   ├── HomeController.cs
│   │   │   ├── JurisdictionController.cs
│   │   │   ├── ReportController.cs
│   │   │   └── ...
│   │   ├── Pages/                          # Razor Pages or Blazor
│   │   │   ├── Index.cshtml
│   │   │   ├── Dashboard.cshtml
│   │   │   ├── Reports/
│   │   │   └── ...
│   │   ├── ViewModels/
│   │   │   ├── DashboardViewModel.cs
│   │   │   ├── ReportViewModel.cs
│   │   │   └── ...
│   │   ├── wwwroot/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── lib/
│   │   └── Views/                          # MVC Views (if not using Blazor)
│   │       ├── Shared/
│   │       ├── Home/
│   │       └── ...
│   │
│   └── PayEquity.Api/                       # API Project (Optional Separate)
│       ├── Program.cs
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── JurisdictionsController.cs
│       │   ├── ReportsController.cs
│       │   └── ...
│       └── Middleware/
│           ├── ErrorHandlingMiddleware.cs
│           └── ...
│
├── tests/
│   ├── PayEquity.UnitTests/
│   │   ├── Domain/
│   │   ├── Application/
│   │   └── ...
│   ├── PayEquity.IntegrationTests/
│   │   ├── Api/
│   │   ├── Data/
│   │   └── ...
│   └── PayEquity.FunctionalTests/
│       └── ...
│
└── docs/
    ├── architecture.md
    ├── api-specification.md
    └── ...
```

### Dependency Flow

```
┌───────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│              (PayEquity.Web / PayEquity.Api)              │
│                                                           │
│  Dependencies:                                            │
│  → PayEquity.Application                                  │
│  → PayEquity.Infrastructure (DI Registration only)        │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                   Application Layer                        │
│                (PayEquity.Application)                     │
│                                                           │
│  Dependencies:                                            │
│  → PayEquity.Domain                                       │
│  → Interfaces only (no concrete implementations)          │
└─────────────────────┬─────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────────────┐
│                     Domain Layer                           │
│                  (PayEquity.Domain)                        │
│                                                           │
│  Dependencies:                                            │
│  → NONE (completely independent)                          │
└───────────────────────────────────────────────────────────┘
                      ↑
┌─────────────────────┴─────────────────────────────────────┐
│                Infrastructure Layer                        │
│              (PayEquity.Infrastructure)                    │
│                                                           │
│  Dependencies:                                            │
│  → PayEquity.Domain                                       │
│  → PayEquity.Application (interfaces)                     │
│  → External libraries (EF Core, SendGrid, etc.)          │
└───────────────────────────────────────────────────────────┘
```

---

## DATA ARCHITECTURE

### Database Schema Overview

```
┌────────────────────────────────────────────────────────────┐
│                    CORE ENTITIES                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌───────────────┐       ┌───────────────┐               │
│  │ Jurisdictions │◄──────┤   Contacts    │               │
│  │  (850 rows)   │   1:N │               │               │
│  └───────┬───────┘       └───────────────┘               │
│          │ 1                                              │
│          │                                                │
│          │ N                                              │
│  ┌───────▼───────┐                                        │
│  │    Reports    │                                        │
│  │ (300/year)    │                                        │
│  └───────┬───────┘                                        │
│          │ 1                                              │
│          ├────────────┬──────────────┬─────────────┐      │
│          │ N          │ 1:1          │ 1:N         │ 1:N  │
│  ┌───────▼───────┐  ┌▼─────────────┐ ┌▼──────────┐ ┌▼───│
│  │     Jobs      │  │Implementation│ │Submission │ │App-│
│  │Classifications│  │   Reports    │ │ History   │ │roval│
│  │  (10-100/rpt) │  │              │ │           │ │Hist│
│  └───────────────┘  └──────────────┘ └───────────┘ └────│
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   SUPPORTING ENTITIES                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Submission   │  │   Report     │  │  Benefits    │    │
│  │  Checklists  │  │  Revisions   │  │  Worksheets  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Compliance   │  │  Admin Case  │  │    Email     │    │
│  │ Certificates │  │    Notes     │  │     Log      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  Audit Logs  │  │   Admin      │                       │
│  │              │  │Activity Log  │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   IDENTITY ENTITIES                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ AspNetUsers  │  │ AspNetRoles  │  │AspNetUser    │    │
│  │              │──┤              │  │   Claims     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Data Access Pattern

```
┌────────────────────────────────────────────────────────────┐
│                     Controllers                             │
│  (Receive HTTP requests, return HTTP responses)            │
└─────────────────────────┬──────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                    Application Services                     │
│  (Business logic, orchestration, validation)               │
└─────────────────────────┬──────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                      Repositories                           │
│  (Data access abstraction via IRepository<T>)              │
└─────────────────────────┬──────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                   Entity Framework Core                     │
│  (ORM, change tracking, query translation)                 │
└─────────────────────────┬──────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│                      SQL Server                             │
│  (Database storage, indexes, constraints)                  │
└────────────────────────────────────────────────────────────┘
```

### Caching Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    Application Tier                         │
│                                                            │
│  Request → Check Cache → Cache Hit? ─Yes─→ Return Data    │
│                  │                                         │
│                  │ No                                      │
│                  ↓                                         │
│            Query Database                                  │
│                  │                                         │
│                  ↓                                         │
│            Store in Cache ────────────→ Return Data        │
│                                                            │
└────────────────────────────────────────────────────────────┘

Cache Layers:
┌─────────────────────────────────────────────────────────────┐
│ L1: In-Memory Cache (IMemoryCache)                         │
│ - Reference data (small, rarely changes)                    │
│ - User sessions                                             │
│ - TTL: 1 hour                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ L2: Distributed Cache (Redis)                               │
│ - Report data (frequently accessed)                         │
│ - Compliance calculations                                   │
│ - User permissions                                          │
│ - TTL: 5-30 minutes                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ L3: Database (SQL Server)                                   │
│ - All persistent data                                       │
│ - Source of truth                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## SECURITY ARCHITECTURE

### Authentication Flow

```
┌──────────────┐
│    User      │
│  (Browser)   │
└──────┬───────┘
       │ 1. POST /api/auth/login
       │    { email, password }
       ↓
┌──────────────────────┐
│  Auth Controller     │
└──────┬───────────────┘
       │ 2. Validate credentials
       ↓
┌──────────────────────┐
│ ASP.NET Identity     │
│ UserManager          │
└──────┬───────────────┘
       │ 3. Check password hash
       ↓
┌──────────────────────┐
│   SQL Server         │
│   AspNetUsers        │
└──────┬───────────────┘
       │ 4. Valid? Generate JWT
       ↓
┌──────────────────────┐
│  JWT Service         │
│  - Create token      │
│  - Add claims        │
│  - Sign token        │
└──────┬───────────────┘
       │ 5. Return JWT
       ↓
┌──────────────┐
│    User      │
│  Store token │
│  in storage  │
└──────┬───────┘
       │ 6. Subsequent requests
       │    Authorization: Bearer <token>
       ↓
┌──────────────────────┐
│  API Endpoint        │
│  [Authorize]         │
└──────┬───────────────┘
       │ 7. Validate JWT
       ↓
┌──────────────────────┐
│  JWT Middleware      │
│  - Verify signature  │
│  - Check expiration  │
│  - Extract claims    │
└──────┬───────────────┘
       │ 8. Allow access
       ↓
┌──────────────────────┐
│  Controller Action   │
│  Process request     │
└──────────────────────┘
```

### Authorization Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Authorization Layers                       │
└──────────────────────────────────────────────────────────────┘

Layer 1: Authentication
┌─────────────────────────────────────────────────────────────┐
│ Is user logged in? (Valid JWT token?)                       │
│ ✓ Yes → Continue                                            │
│ ✗ No  → 401 Unauthorized                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
Layer 2: Role Check
┌─────────────────────────────────────────────────────────────┐
│ Does user have required role?                               │
│ [Authorize(Roles = "Admin,Jurisdiction")]                   │
│ ✓ Yes → Continue                                            │
│ ✗ No  → 403 Forbidden                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
Layer 3: Resource-Level Authorization
┌─────────────────────────────────────────────────────────────┐
│ Does user have access to THIS specific resource?            │
│ - Admin: Access to all                                      │
│ - Jurisdiction: Only own jurisdiction's data                │
│ ✓ Yes → Continue                                            │
│ ✗ No  → 403 Forbidden                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
Layer 4: Operation-Level Authorization
┌─────────────────────────────────────────────────────────────┐
│ Can user perform THIS operation on THIS resource?           │
│ - Can jurisdiction user approve reports? No                 │
│ - Can admin approve reports? Yes                            │
│ ✓ Yes → Allow operation                                     │
│ ✗ No  → 403 Forbidden                                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Security

```
┌──────────────────────────────────────────────────────────────┐
│                    Data at Rest                               │
│                                                              │
│  ┌────────────────┐                                          │
│  │  SQL Server    │                                          │
│  │  - TDE Enabled │ ← Transparent Data Encryption           │
│  │  - Encrypted   │                                          │
│  │    Backups     │                                          │
│  └────────────────┘                                          │
│                                                              │
│  ┌────────────────┐                                          │
│  │  Blob Storage  │                                          │
│  │  - Server-side │ ← Azure Storage Encryption              │
│  │    Encryption  │                                          │
│  └────────────────┘                                          │
│                                                              │
│  ┌────────────────┐                                          │
│  │   Passwords    │                                          │
│  │  - BCrypt Hash │ ← Salted hash, work factor 12          │
│  └────────────────┘                                          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   Data in Transit                             │
│                                                              │
│  Browser ←──HTTPS/TLS 1.2+──→ Load Balancer                │
│                    │                                         │
│                    │                                         │
│  Load Balancer ←──HTTPS/TLS──→ App Server                  │
│                    │                                         │
│                    │                                         │
│  App Server ←──SQL Encrypted──→ SQL Server                 │
│                    │                                         │
│                    │                                         │
│  App Server ←──HTTPS──→ External Services                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## DEPLOYMENT ARCHITECTURE

### Azure Deployment (Recommended)

```
┌───────────────────────────────────────────────────────────────────┐
│                           Azure Cloud                             │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Azure App Service                         │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Web App      │  │ Web App      │  │   Scale Out     │  │ │
│  │  │ Instance 1   │  │ Instance 2   │  │ Auto-scaling    │  │ │
│  │  │ (Primary)    │  │ (Secondary)  │  │ 1-5 instances   │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  │                                                              │ │
│  │  Plan: S2 Standard (2 cores, 3.5 GB RAM)                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                ↓↑                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Azure SQL Database                         │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Primary Database (Read/Write)                         │  │ │
│  │  │ Tier: S2 Standard (50 DTUs)                           │  │ │
│  │  │ Size: 250 GB                                          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                          ↓                                   │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Read Replica (Optional for reporting)                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                ↓↑                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Azure Blob Storage                         │ │
│  │  - PDFs, Certificates, Exports                              │ │
│  │  - Hot tier for recent files                                │ │
│  │  - Cool tier for archives                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                ↓↑                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Azure Redis Cache                          │ │
│  │  - Session state                                            │ │
│  │  - Application cache                                        │ │
│  │  - Tier: Basic C1 (1 GB)                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                ↓↑                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Azure Key Vault                            │ │
│  │  - Connection strings                                       │ │
│  │  - API keys                                                 │ │
│  │  - Certificates                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                ↓↑                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               Azure Application Insights                     │ │
│  │  - Performance monitoring                                   │ │
│  │  - Error tracking                                           │ │
│  │  - User analytics                                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                              ↑↓
┌───────────────────────────────────────────────────────────────────┐
│                      External Services                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────────┐ │
│  │  SendGrid  │  │   Azure    │  │      Azure CDN             │ │
│  │   Email    │  │  Front Door│  │   (Static Assets)          │ │
│  └────────────┘  └────────────┘  └────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### On-Premise Deployment (Alternative)

```
┌───────────────────────────────────────────────────────────────────┐
│                    On-Premise Data Center                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Load Balancer                             │ │
│  │  (F5, HAProxy, or Windows NLB)                              │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             ↓                                     │
│  ┌──────────────────────────┴──────────────────────────────────┐ │
│  │                    IIS Web Servers                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ IIS Server 1 │  │ IIS Server 2 │  │  IIS Server 3   │  │ │
│  │  │ Windows 2019 │  │ Windows 2019 │  │  Windows 2019   │  │ │
│  │  │ 8 GB RAM     │  │ 8 GB RAM     │  │  8 GB RAM       │  │ │
│  │  │ 4 vCPUs      │  │ 4 vCPUs      │  │  4 vCPUs        │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             ↓↑                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    SQL Server Cluster                        │ │
│  │  ┌──────────────┐              ┌──────────────┐            │ │
│  │  │  SQL Primary │←──────────→│  SQL Secondary │            │ │
│  │  │  Node 1      │ AlwaysOn   │  Node 2        │            │ │
│  │  │  16 GB RAM   │ AG         │  16 GB RAM     │            │ │
│  │  │  8 vCPUs     │            │  8 vCPUs       │            │ │
│  │  └──────────────┘              └──────────────┘            │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Shared Storage (SAN)                                  │  │ │
│  │  │ - Database files                                      │  │ │
│  │  │ - Backups                                             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             ↓↑                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    File Server                               │ │
│  │  - PDF files                                                │ │
│  │  - Certificates                                             │ │
│  │  - Exports                                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             ↓↑                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Redis Server                              │ │
│  │  - Session state                                            │ │
│  │  - Application cache                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │   WAF   │ (Web Application Firewall)
                    │ Security│
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │   CDN   │ (Content Delivery Network)
                    │         │ Static assets
                    └────┬────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     DMZ (Perimeter)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Load Balancer / Reverse Proxy             │  │
│  │          (SSL Termination, Health Checks)            │  │
│  └────────────────────┬─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 Application Tier (Private)                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  App Server  │  │  App Server  │  │   App Server    │ │
│  │      1       │  │      2       │  │       3         │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Data Tier (Isolated)                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ SQL Server   │  │    Redis     │  │  File Storage   │ │
│  │   Cluster    │  │    Cache     │  │                 │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Network Segmentation:
- DMZ:         Public-facing, port 80/443 only
- App Tier:    Private subnet, no direct internet access
- Data Tier:   Isolated subnet, app tier access only
- Firewall:    Between each tier
```

---

## INTEGRATION ARCHITECTURE

### External Service Integration

```
┌──────────────────────────────────────────────────────────────┐
│              Pay Equity Compliance System                     │
└───────┬──────────────────────────────────────────────────────┘
        │
        ├─────────────┐
        │             │
        ↓             ↓
┌──────────────┐  ┌──────────────┐
│   SendGrid   │  │Azure Blob    │
│    Email     │  │   Storage    │
│   Service    │  │              │
└──────────────┘  └──────────���───┘
        ↓             ↓
   SMTP/API       REST API
   TLS 1.2+       HTTPS
```

### Email Service Integration

```
Application
    │
    ├──→ IEmailService (Interface)
    │
    └──→ EmailService (Implementation)
            │
            ├──→ SendGrid SDK
            │     │
            │     └──→ SendGrid API
            │           (HTTPS, API Key Auth)
            │
            └──→ SMTP Client
                  │
                  └──→ SMTP Server
                        (TLS, Username/Password)
```

### File Storage Integration

```
Application
    │
    ├──→ IFileStorageService (Interface)
    │
    └──→ FileStorageService (Implementation)
            │
            ├──→ Azure Blob Storage Client
            │     │
            │     └──→ Azure Blob Storage
            │           (HTTPS, SAS Token or Connection String)
            │
            └──→ File System Provider
                  │
                  └──→ Network File Share
                        (SMB/CIFS, Windows Auth)
```

### Background Job Processing

```
┌──────────────────────────────────────────────────────────────┐
│                    Background Jobs                            │
│                                                              │
│  Job Scheduler: Hangfire or Quartz.NET                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Scheduled Jobs:                                         │ │
│  │                                                         │ │
│  │ 1. Auto-Approval Processing                             │ │
│  │    - Trigger: On report submission                      │ │
│  │    - Frequency: Immediate                               │ │
│  │                                                         │ │
│  │ 2. Deadline Reminder Emails                             │ │
│  │    - Trigger: Scheduled                                 │ │
│  │    - Frequency: Daily at 8:00 AM                        │ │
│  │                                                         │ │
│  │ 3. Certificate Generation                               │ │
│  │    - Trigger: On report approval                        │ │
│  │    - Frequency: Immediate                               │ │
│  │                                                         │ │
│  │ 4. Cleanup Old Files                                    │ │
│  │    - Trigger: Scheduled                                 │ │
│  │    - Frequency: Weekly                                  │ │
│  │                                                         │ │
│  │ 5. Database Maintenance                                 │ │
│  │    - Trigger: Scheduled                                 │ │
│  │    - Frequency: Weekly                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## API ARCHITECTURE

### API Endpoint Structure

```
/api/v1/
├── auth/
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /refresh-token
│   └── POST   /forgot-password
│
├── jurisdictions/
│   ├── GET    /
│   ├── GET    /{id}
│   ├── POST   /
│   ├── PUT    /{id}
│   └── DELETE /{id}
│
├── jurisdictions/{id}/contacts/
│   ├── GET    /
│   ├── POST   /
│   └── ...
│
├── reports/
│   ├── GET    /
│   ├── GET    /{id}
│   ├── POST   /
│   ├── PUT    /{id}
│   ├── DELETE /{id}
│   ├── POST   /{id}/submit
│   ├── POST   /{id}/reopen
│   └── GET    /{id}/history
│
├── reports/{id}/jobs/
│   ├── GET    /
│   ├── POST   /
│   ├── POST   /bulk
│   └── ...
│
├── reports/{id}/compliance/
│   ├── GET    /
│   └── POST   /analyze
│
└── admin/
    ├── approvals/
    ├── notes/
    └── dashboard/
```

### API Request/Response Flow

```
Client Request
    │
    ├──→ [1] API Controller receives request
    │         │
    │         ├──→ [Authorize] attribute checks authentication
    │         │
    │         └──→ Model binding and validation
    │
    ├──→ [2] Controller calls Application Service
    │         │
    │         ├──→ FluentValidation validates input
    │         │
    │         └──→ AutoMapper maps DTO to Entity
    │
    ├──→ [3] Service performs business logic
    │         │
    │         ├──→ Calls Repository for data access
    │         │
    │         └──→ Domain logic execution
    │
    ├──→ [4] Repository queries database
    │         │
    │         └──→ EF Core translates to SQL
    │
    ├──→ [5] Response generation
    │         │
    │         ├──→ AutoMapper maps Entity to DTO
    │         │
    │         └──→ Format as JSON
    │
    └──→ [6] Return HTTP response to client
              (200 OK, 201 Created, 400 Bad Request, etc.)
```

---

**END OF ARCHITECTURE DIAGRAM DOCUMENT**

This architecture ensures:
- ✅ Scalability through horizontal scaling
- ✅ Maintainability through clean separation of concerns
- ✅ Security through defense in depth
- ✅ Performance through caching and optimization
- ✅ Reliability through redundancy and failover
- ✅ Testability through dependency injection and interfaces
