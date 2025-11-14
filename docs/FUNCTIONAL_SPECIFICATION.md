re Key Vault or AWS Secrets Manager (production)

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
