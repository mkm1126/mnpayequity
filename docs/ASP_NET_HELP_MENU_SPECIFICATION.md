# ASP.NET Help Menu Implementation Specification

## Overview
This document provides complete specifications for implementing a comprehensive Help Menu system in your ASP.NET Core application. The help system consists of three main components: a Quick Help Center, a Comprehensive Help Guide, and a Resource Library.

---

## Table of Contents
1. [Help Menu Navigation Item](#1-help-menu-navigation-item)
2. [Component 1: Quick Help Center](#2-component-1-quick-help-center)
3. [Component 2: Comprehensive Help Guide](#3-component-2-comprehensive-help-guide)
4. [Component 3: Resource Library](#4-component-3-resource-library)
5. [Data Models](#5-data-models)
6. [CSS Styling](#6-css-styling)
7. [JavaScript Functionality](#7-javascript-functionality)
8. [Implementation Steps](#8-implementation-steps)

---

## 1. Help Menu Navigation Item

### 1.1 Navigation Bar Addition
Add a "Help" dropdown menu to your navigation bar (see separate navigation CSS specification).

**Navigation Structure:**
```html
<li class="nav-item">
  <button class="nav-dropdown-toggle" onclick="toggleDropdown('helpMenu')">
    Help
    <svg class="dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  <div id="helpMenu" class="dropdown-menu">
    <a href="#" onclick="openQuickHelp(event)" class="dropdown-item">Quick Help</a>
    <a href="#" onclick="openComprehensiveGuide(event)" class="dropdown-item">Full Help Guide</a>
    <a href="#" onclick="openResourceLibrary(event)" class="dropdown-item">Official Resources</a>
    <div class="dropdown-divider"></div>
    <a href="mailto:payequity.mmb@state.mn.us" class="dropdown-item">Contact Support</a>
  </div>
</li>
```

---

## 2. Component 1: Quick Help Center

### 2.1 Purpose
The Quick Help Center provides searchable, categorized help articles with contextual suggestions based on what the user is currently doing.

### 2.2 Visual Design
- Full-screen modal overlay (dark semi-transparent background)
- Large centered white panel (max-width: 1280px, max-height: 90vh)
- Header with search bar
- Left sidebar with categories (256px width)
- Main content area with article listings
- Footer with contact information

### 2.3 Features Required

#### Search Functionality
- Live search as user types
- Search across: article titles, content, and keywords
- Display result count
- Clear visual indication when no results found

#### Category Navigation
- Left sidebar with these categories:
  - All Articles (default)
  - Official Documents
  - Getting Started
  - Employee Eligibility
  - Job Classifications
  - Job Evaluation
  - Salary Data
  - Compliance Tests
  - Compensation
  - Troubleshooting
  - Deadlines
  - Benefits
  - Data Entry
  - Compliance

#### Article Display
- List view showing:
  - Category badge (small, gray background)
  - Article title (bold, clickable)
  - First 2 lines of content preview
  - Right chevron icon
- Click any article to view full details

#### Article Detail View
- Back button to return to list
- Category badge at top
- Full article title (large, bold)
- Full article content
- "Download Official PDF" button (if article has associated PDF)
- "When to Use This Document" section (green-bordered callout box)

#### Contextual Help (Optional Advanced Feature)
- If user is on a specific page, show "Related to what you're working on" section at top
- Display 3 most relevant articles based on current context
- Use keyword matching to determine relevance

### 2.4 Help Articles to Include

You need to create **at least 14 help articles** covering these topics:

1. **What is the Minnesota Local Government Pay Equity Act?**
   - Category: Getting Started
   - Keywords: law, act, requirements, basics, overview
   - Link to: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/

2. **Which employees must be included in the report?**
   - Category: Employee Eligibility
   - Keywords: eligibility, employees, requirements, 67 days, 14 hours, students
   - Content: Explain 67-day, 14-hour rules

3. **How are job classes categorized by gender?**
   - Category: Job Classifications
   - Keywords: gender, male, female, balanced, 70%, 80%, dominated
   - Content: Male-dominated (80%+), Female-dominated (70%+), Balanced

4. **What are job evaluation points?**
   - Category: Job Evaluation
   - Keywords: points, evaluation, skill, effort, responsibility, working conditions
   - Content: Explain the 4 factors

5. **How should I enter salary information?**
   - Category: Salary Data
   - Keywords: salary, wage, monthly, hourly, conversion, pay
   - Content: Monthly amounts, conversion formulas

6. **What is the Statistical Analysis Test?**
   - Category: Compliance Tests
   - Keywords: statistical, test, underpayment, ratio, 80%, predicted pay
   - Content: Explain the 80% threshold

7. **What is the Salary Range Test?**
   - Category: Compliance Tests
   - Keywords: salary range, test, years to max, 110%, 140%, advancement
   - Content: Explain 110-140% acceptable range

8. **What is Exceptional Service Pay (ESP)?**
   - Category: Compensation
   - Keywords: ESP, exceptional service, longevity, certification, differential
   - Content: Types of ESP and equity requirements

9. **What if my jurisdiction fails a compliance test?**
   - Category: Troubleshooting
   - Keywords: fail, failed, out of compliance, fix, correct, adjust
   - Content: Steps to take when failing tests

10. **When is the report due?**
    - Category: Deadlines
    - Keywords: deadline, due date, january 31, when, submit
    - Content: January 31st every 3 years

11. **How do I handle benefits in the report?**
    - Category: Benefits
    - Keywords: benefits, insurance, health, dental, retirement, value
    - Content: Cash value calculation methods

12. **Can I copy job data from a previous year?**
    - Category: Data Entry
    - Keywords: copy, previous year, import, reuse, duplicate
    - Content: How to copy and what must be updated

13. **Instructions for Submitting a Report (Official PDF)**
    - Category: Official Documents
    - Keywords: instructions, submit, submission, requirements, how to, guide, pdf, forms, deadline
    - PDF URL: https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf
    - When to Use: "Reference when preparing to submit your report"

14. **State Job Match Evaluation System Guide (Official PDF)**
    - Category: Official Documents
    - Keywords: points, evaluation, job match, state system, classification, 2023
    - PDF URL: https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf
    - When to Use: "Use when evaluating jobs for the first time"

### 2.5 Footer Contact Information
Display prominently at bottom:
- **Still need help?**
  - Contact: payequity.mmb@state.mn.us
- **Official Resources**
  - Visit MMB Pay Equity website: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/

---

## 3. Component 2: Comprehensive Help Guide

### 3.1 Purpose
Step-by-step walkthrough of the entire pay equity reporting process from start to finish. This is your "user manual" for the system.

### 3.2 Visual Design
- Full-screen modal (same as Quick Help)
- Left sidebar navigation (256px) with section icons
- Main content area with detailed explanations
- Footer with contact info and close button

### 3.3 Guide Structure

The guide must include these **9 major sections**:

#### Section 1: Getting Started with Pay Equity Reporting
- Icon: Book
- Subsections:
  - What is the Pay Equity Act?
  - Who Must Report?
  - Key Deadlines

#### Section 2: Official Minnesota MMB Documents
- Icon: FileText
- Subsections (each with download links):
  - Instructions for Submitting a Report
  - State Job Match Evaluation System (2023)
  - Guide to Understanding Pay Equity Compliance
  - How to Interpret Your Results

#### Section 3: Step 1 - Data Gathering
- Icon: CheckCircle
- Subsections:
  - Which Employees to Include
  - Required Information for Each Employee
  - Organizing by Job Classification
  - Salary Information

#### Section 4: Step 2 - Job Evaluation
- Icon: CheckCircle
- Subsections:
  - The Four Evaluation Factors (Skill, Effort, Responsibility, Working Conditions)
  - Consistency is Critical
  - Common Evaluation Mistakes

#### Section 5: Step 3 - Data Entry
- Icon: CheckCircle
- Subsections:
  - Jurisdiction Information
  - Creating Your Report
  - Entering Job Classifications
  - Data Entry Tips

#### Section 6: Step 4 - Compliance Testing
- Icon: CheckCircle
- Subsections:
  - The Three Compliance Tests
  - Understanding Your Results
  - What If You're Out of Compliance?

#### Section 7: Step 5 - Final Submission
- Icon: CheckCircle
- Subsections:
  - Required Documents
  - How to Submit
  - After Submission
  - Deadline Reminder

#### Section 8: Report Sharing & Privacy Controls
- Icon: CheckCircle
- Subsections:
  - Understanding Report Privacy
  - Using the Toggle Slider
  - When to Share Reports
  - What Shared Reports Include
  - Switching Back to Private
  - Report Status Indicators

#### Section 9: Using System Tools
- Icon: CheckCircle
- Subsections:
  - Job Match Wizard
  - What-If Calculator
  - Gap Analysis Tool
  - Pre-Submission Checker
  - Submission Checklist

#### Section 10: Common Issues & Troubleshooting
- Icon: CheckCircle
- Subsections:
  - My jurisdiction fails the Statistical Analysis Test
  - My jurisdiction fails the Salary Range Test
  - My jurisdiction fails the Exceptional Service Pay Test
  - I don't have enough male-dominated classes
  - I found errors after submitting
  - I can't afford to fix all issues immediately

#### Section 11: Annual Data Maintenance Best Practices
- Icon: CheckCircle
- Subsections:
  - Best Practice Tip: Refresh Your Data Every Year
  - When to Update Your Data
  - Maintaining Job Classification Data
  - When to Update Salary Information
  - Annual Data Audit Recommendations
  - Preserving Institutional Knowledge
  - Using This System for Year-Round Maintenance
  - Benefits of Proactive Maintenance

#### Section 12: Getting Help & Contact Information
- Icon: Phone
- Subsections:
  - Contact the MMB Pay Equity Unit
    - Email: payequity.mmb@state.mn.us
    - Phone: 651-259-3824
    - Hours: Monday-Friday, 8:00 AM - 4:30 PM Central
  - What MMB Can Help With
  - What to Prepare Before Calling

### 3.4 Special Visual Elements

#### Quick Start Box (on Getting Started section only)
- Gradient blue background (#003865 to #004d7a)
- White text
- Numbered list of 8 steps:
  1. Review official documents
  2. Start gathering employee data early
  3. Evaluate all jobs using State Job Match system
  4. Enter data into system carefully
  5. Run compliance tests and analyze results
  6. Address any compliance issues
  7. Run pre-submission checker
  8. Submit by January 31st

#### Subsection Formatting
- Green left border (4px, color #78BE21)
- Left padding
- Bold subsection titles
- Pre-formatted text with line breaks preserved
- External link icons where applicable

---

## 4. Component 3: Resource Library

### 4.1 Purpose
Quick access to official Minnesota Management & Budget PDF documents and external resources.

### 4.2 Visual Design
- Can be displayed as:
  - Full page component
  - Compact sidebar widget (shows 3 resources)
  - Modal popup

### 4.3 Resources to Include

**Six official resources:**

1. **Local Government Pay Equity Act**
   - Category: Legal Requirements
   - Description: Official Minnesota statute and regulations
   - URL: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/

2. **Instructions for Submitting a Report**
   - Category: Reporting Instructions
   - Description: Step-by-step submission guide
   - URL: https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf

3. **State Job Match Evaluation System**
   - Category: Job Evaluation
   - Description: Job evaluation guide with point system
   - URL: https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf

4. **Guide to Understanding Pay Equity Compliance**
   - Category: Compliance
   - Description: How to understand and achieve compliance
   - URL: https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf

5. **How to Interpret Your Results**
   - Category: Compliance
   - Description: Detailed test results explanation
   - URL: https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf

6. **Pay Equity Contact Information**
   - Category: Support
   - Description: Contact MMB Pay Equity Unit
   - URL: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/

### 4.4 Resource Card Design
Each resource displays as a card with:
- File icon (blue background circle)
- Resource title (bold, clickable)
- External link icon
- Description text
- Category badge
- Hover state: Blue border, light blue background

### 4.5 Contact Information Box
At bottom of resource library:
- Light blue background (#F0F9FF)
- Blue border
- Contains:
  - Pay Equity Unit
  - Minnesota Management and Budget
  - Phone: 651-259-3824 (clickable tel: link)
  - Email: payequity.mmb@state.mn.us (clickable mailto: link)

---

## 5. Data Models

### 5.1 HelpArticle Model

```csharp
public class HelpArticle
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Category { get; set; }
    public string Content { get; set; }
    public List<string> Keywords { get; set; }
    public string PdfUrl { get; set; }  // Optional
    public string WhenToUse { get; set; }  // Optional
}
```

### 5.2 HelpSection Model (for Comprehensive Guide)

```csharp
public class HelpSection
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string IconName { get; set; }  // Book, FileText, CheckCircle, Phone
    public string Content { get; set; }
    public List<Subsection> Subsections { get; set; }
    public List<ResourceLink> Links { get; set; }
}

public class Subsection
{
    public string Title { get; set; }
    public string Content { get; set; }
    public List<ResourceLink> Links { get; set; }
}

public class ResourceLink
{
    public string Text { get; set; }
    public string Url { get; set; }
}
```

### 5.3 Resource Model

```csharp
public class Resource
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Url { get; set; }
    public List<string> Keywords { get; set; }
    public string Category { get; set; }
}
```

---

## 6. CSS Styling

### 6.1 Modal Overlay

```css
/* Help Modal Overlay */
.help-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
  overflow-y: auto;
}

.help-modal-overlay.hidden {
  display: none;
}

/* Help Modal Container */
.help-modal {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 80rem;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  margin: 2rem auto;
}
```

### 6.2 Header

```css
/* Modal Header */
.help-modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.help-modal-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.help-modal-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.help-modal-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #003865;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-modal-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #ffffff;
}

.help-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.help-modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.help-modal-close {
  color: #9ca3af;
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s ease;
}

.help-modal-close:hover {
  color: #4b5563;
}
```

### 6.3 Search Bar

```css
/* Search Bar */
.help-search-wrapper {
  position: relative;
}

.help-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

.help-search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.help-search-input:focus {
  outline: none;
  border-color: #003865;
  box-shadow: 0 0 0 3px rgba(0, 56, 101, 0.1);
}
```

### 6.4 Sidebar Navigation

```css
/* Sidebar */
.help-sidebar {
  width: 16rem;
  border-right: 1px solid #e5e7eb;
  padding: 1rem;
  background-color: #f9fafb;
  overflow-y: auto;
}

.help-sidebar-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.help-category-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.help-category-button {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #374151;
}

.help-category-button:hover {
  background-color: #e5e7eb;
}

.help-category-button.active {
  background-color: #003865;
  color: #ffffff;
}
```

### 6.5 Content Area

```css
/* Main Content Area */
.help-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.help-content-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

/* Article Cards */
.help-article-card {
  width: 100%;
  text-align: left;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.help-article-card:hover {
  border-color: #003865;
  background-color: #eff6ff;
}

.help-article-category-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.help-article-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.help-article-card:hover .help-article-title {
  color: #003865;
}

.help-article-preview {
  font-size: 0.875rem;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.help-article-chevron {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: auto;
  margin-top: 0.25rem;
}

.help-article-card:hover .help-article-chevron {
  color: #003865;
}
```

### 6.6 Article Detail View

```css
/* Article Detail */
.help-article-detail {
  max-width: 48rem;
}

.help-back-button {
  color: #003865;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
}

.help-back-button:hover {
  color: #004d7a;
  text-decoration: underline;
}

.help-article-detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 1rem 0;
}

.help-article-content {
  color: #374151;
  line-height: 1.625;
  white-space: pre-line;
  margin-bottom: 1.5rem;
}

.help-download-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #003865;
  color: #ffffff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.help-download-button:hover {
  background-color: #004d7a;
}

.help-when-to-use-box {
  padding: 1rem;
  background-color: #f0fdf4;
  border-left: 4px solid #22c55e;
  border-radius: 0 0.5rem 0.5rem 0;
  margin-top: 1.5rem;
}

.help-when-to-use-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-when-to-use-content {
  font-size: 0.875rem;
  color: #15803d;
}
```

### 6.7 Footer

```css
/* Footer */
.help-modal-footer {
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem;
  background-color: #f9fafb;
}

.help-footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.help-contact-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: border-color 0.2s ease;
}

.help-contact-card:hover {
  border-color: #003865;
}

.help-contact-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #003865;
  flex-shrink: 0;
}

.help-contact-label {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  margin: 0;
}

.help-contact-value {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}
```

### 6.8 Contextual Help Section

```css
/* Contextual Help */
.help-contextual-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
}

.help-contextual-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.75rem;
}

.help-contextual-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.help-contextual-article {
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.help-contextual-article:hover {
  border-color: #60a5fa;
}

.help-contextual-article-title {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}
```

### 6.9 Comprehensive Guide Specific Styles

```css
/* Guide Subsection Formatting */
.guide-subsection {
  border-left: 4px solid #78BE21;
  padding-left: 1rem;
  margin-bottom: 1.5rem;
}

.guide-subsection-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.guide-subsection-content {
  color: #374151;
  line-height: 1.625;
  white-space: pre-line;
}

.guide-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #003865;
  font-weight: 500;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.guide-link:hover {
  color: #004d7a;
  text-decoration: underline;
}

/* Quick Start Box */
.guide-quick-start {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #003865 0%, #004d7a 100%);
  color: #ffffff;
  border-radius: 0.5rem;
}

.guide-quick-start-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.guide-quick-start-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.guide-quick-start-item {
  display: flex;
  align-items: start;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.guide-quick-start-number {
  font-weight: 700;
  flex-shrink: 0;
}
```

### 6.10 Resource Library Styles

```css
/* Resource Library */
.resource-library {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.resource-library-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.resource-library-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #003865;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resource-library-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #ffffff;
}

.resource-library-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.resource-library-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Resource Card */
.resource-card {
  display: block;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.resource-card:hover {
  border-color: #003865;
  background-color: #eff6ff;
}

.resource-card-content {
  display: flex;
  align-items: start;
  gap: 0.75rem;
}

.resource-card-icon {
  width: 2rem;
  height: 2rem;
  background-color: #dbeafe;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.2s ease;
}

.resource-card:hover .resource-card-icon {
  background-color: #bfdbfe;
}

.resource-card-icon svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #2563eb;
}

.resource-card-text {
  flex: 1;
}

.resource-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.resource-card-title {
  font-weight: 600;
  color: #111827;
  transition: color 0.2s ease;
}

.resource-card:hover .resource-card-title {
  color: #003865;
}

.resource-card-external-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.resource-card:hover .resource-card-external-icon {
  color: #003865;
}

.resource-card-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.resource-card-category {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* Resource Library Contact Box */
.resource-library-contact {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
}

.resource-library-contact-title {
  font-weight: 600;
  color: #1e3a8a;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.resource-library-contact-info {
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.5;
}

.resource-library-contact-info strong {
  font-weight: 600;
}

.resource-library-contact-info a {
  color: #1e40af;
  text-decoration: underline;
}

.resource-library-contact-info a:hover {
  color: #1e3a8a;
}
```

### 6.11 Responsive Design

```css
/* Mobile Responsive */
@media (max-width: 768px) {
  .help-modal {
    max-width: 100%;
    max-height: 100vh;
    margin: 0;
    border-radius: 0;
  }

  .help-sidebar {
    display: none; /* Or convert to dropdown on mobile */
  }

  .help-content {
    padding: 1rem;
  }

  .help-footer-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 7. JavaScript Functionality

### 7.1 Quick Help Center Functions

```javascript
// Global state
let currentView = 'list'; // 'list' or 'detail'
let selectedCategory = null;
let selectedArticle = null;
let searchQuery = '';

// Open Quick Help modal
function openQuickHelp(event) {
  if (event) event.preventDefault();
  document.getElementById('quickHelpModal').classList.remove('hidden');
  loadArticleList();
}

// Close modal
function closeHelpModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
  resetHelpState();
}

// Reset state
function resetHelpState() {
  currentView = 'list';
  selectedCategory = null;
  selectedArticle = null;
  searchQuery = '';
  document.getElementById('helpSearchInput').value = '';
}

// Search functionality
function searchArticles(query) {
  searchQuery = query.toLowerCase();
  loadArticleList();
}

// Filter by category
function selectCategory(category) {
  selectedCategory = category;
  loadArticleList();
}

// Load article list
function loadArticleList() {
  const articles = getFilteredArticles();
  const container = document.getElementById('articleListContainer');

  if (articles.length === 0) {
    container.innerHTML = `
      <div class="help-no-results">
        <svg><!-- File Question Icon --></svg>
        <p>No articles found</p>
        <p class="text-sm">Try a different search term or browse by category</p>
      </div>
    `;
    return;
  }

  let html = '';
  articles.forEach(article => {
    html += `
      <button class="help-article-card" onclick="viewArticle('${article.id}')">
        <div>
          <div class="help-article-category-badge">${article.category}</div>
          <h4 class="help-article-title">${article.title}</h4>
          <p class="help-article-preview">${article.content}</p>
        </div>
        <svg class="help-article-chevron"><!-- Chevron Right Icon --></svg>
      </button>
    `;
  });

  container.innerHTML = html;
}

// Get filtered articles
function getFilteredArticles() {
  let filtered = allHelpArticles;

  // Filter by search
  if (searchQuery) {
    filtered = filtered.filter(article =>
      article.title.toLowerCase().includes(searchQuery) ||
      article.content.toLowerCase().includes(searchQuery) ||
      article.keywords.some(k => k.toLowerCase().includes(searchQuery))
    );
  }

  // Filter by category
  if (selectedCategory) {
    filtered = filtered.filter(article => article.category === selectedCategory);
  }

  return filtered;
}

// View article detail
function viewArticle(articleId) {
  const article = allHelpArticles.find(a => a.id === articleId);
  if (!article) return;

  selectedArticle = article;
  currentView = 'detail';

  let html = `
    <button class="help-back-button" onclick="backToList()">← Back to articles</button>
    <div class="help-article-category-badge">${article.category}</div>
    <h2 class="help-article-detail-title">${article.title}</h2>
  `;

  if (article.pdfUrl) {
    html += `
      <a href="${article.pdfUrl}" target="_blank" class="help-download-button">
        <svg><!-- Download Icon --></svg>
        Download Official PDF
      </a>
    `;
  }

  html += `<div class="help-article-content">${article.content}</div>`;

  if (article.whenToUse) {
    html += `
      <div class="help-when-to-use-box">
        <h3 class="help-when-to-use-title">
          <svg><!-- File Text Icon --></svg>
          When to Use This Document
        </h3>
        <p class="help-when-to-use-content">${article.whenToUse}</p>
      </div>
    `;
  }

  document.getElementById('articleListContainer').innerHTML = html;
}

// Back to article list
function backToList() {
  currentView = 'list';
  selectedArticle = null;
  loadArticleList();
}
```

### 7.2 Comprehensive Guide Functions

```javascript
// Open Comprehensive Guide
function openComprehensiveGuide(event) {
  if (event) event.preventDefault();
  document.getElementById('comprehensiveGuideModal').classList.remove('hidden');
  selectGuideSection('getting-started');
}

// Select guide section
function selectGuideSection(sectionId) {
  // Update active state in sidebar
  document.querySelectorAll('.guide-nav-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`guideNav_${sectionId}`).classList.add('active');

  // Load section content
  const section = guideSections.find(s => s.id === sectionId);
  if (!section) return;

  const container = document.getElementById('guideContentContainer');

  let html = `
    <div class="guide-section-header">
      <h2 class="guide-section-title">${section.title}</h2>
      <p class="guide-section-intro">${section.content}</p>
    </div>
  `;

  if (section.subsections) {
    section.subsections.forEach(subsection => {
      html += `
        <div class="guide-subsection">
          <h3 class="guide-subsection-title">${subsection.title}</h3>
          <p class="guide-subsection-content">${subsection.content}</p>
      `;

      if (subsection.links) {
        subsection.links.forEach(link => {
          html += `
            <a href="${link.url}" target="_blank" class="guide-link">
              <svg><!-- External Link Icon --></svg>
              ${link.text}
            </a>
          `;
        });
      }

      html += `</div>`;
    });
  }

  // Add Quick Start box for getting-started section
  if (sectionId === 'getting-started') {
    html += `
      <div class="guide-quick-start">
        <h3 class="guide-quick-start-title">Quick Start</h3>
        <ol class="guide-quick-start-list">
          <li class="guide-quick-start-item">
            <span class="guide-quick-start-number">1.</span>
            <span>Review official documents (especially submission instructions)</span>
          </li>
          <!-- Add remaining 7 steps -->
        </ol>
      </div>
    `;
  }

  container.innerHTML = html;
}
```

### 7.3 Resource Library Functions

```javascript
// Open Resource Library
function openResourceLibrary(event) {
  if (event) event.preventDefault();
  document.getElementById('resourceLibraryModal').classList.remove('hidden');
  loadResources();
}

// Load resources
function loadResources() {
  const container = document.getElementById('resourceListContainer');

  let html = '';
  allResources.forEach(resource => {
    html += `
      <a href="${resource.url}" target="_blank" class="resource-card">
        <div class="resource-card-content">
          <div class="resource-card-icon">
            <svg><!-- File Text Icon --></svg>
          </div>
          <div class="resource-card-text">
            <div class="resource-card-header">
              <h3 class="resource-card-title">${resource.title}</h3>
              <svg class="resource-card-external-icon"><!-- External Link Icon --></svg>
            </div>
            <p class="resource-card-description">${resource.description}</p>
            <span class="resource-card-category">${resource.category}</span>
          </div>
        </div>
      </a>
    `;
  });

  container.innerHTML = html;
}
```

### 7.4 Icon SVG Helper Functions

```javascript
// Helper function to get SVG icons
function getSvgIcon(iconName) {
  const icons = {
    book: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',

    search: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>',

    chevronRight: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>',

    externalLink: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>',

    download: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>',

    fileText: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',

    mail: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>',

    phone: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>',

    checkCircle: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',

    fileQuestion: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
  };

  return icons[iconName] || '';
}
```

---

## 8. Implementation Steps

### Step 1: Create Database Tables (if storing help content in database)

```sql
-- Help Articles Table
CREATE TABLE HelpArticles (
    Id NVARCHAR(50) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Keywords NVARCHAR(500),
    PdfUrl NVARCHAR(500),
    WhenToUse NVARCHAR(1000),
    DisplayOrder INT,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETDATE(),
    ModifiedDate DATETIME DEFAULT GETDATE()
);

-- Help Sections Table (for Comprehensive Guide)
CREATE TABLE HelpSections (
    Id NVARCHAR(50) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    IconName NVARCHAR(50),
    Content NVARCHAR(MAX),
    DisplayOrder INT,
    IsActive BIT DEFAULT 1
);

-- Help Subsections Table
CREATE TABLE HelpSubsections (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SectionId NVARCHAR(50) FOREIGN KEY REFERENCES HelpSections(Id),
    Title NVARCHAR(255) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    DisplayOrder INT
);

-- Resources Table
CREATE TABLE Resources (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    Url NVARCHAR(500) NOT NULL,
    Keywords NVARCHAR(500),
    Category NVARCHAR(100),
    DisplayOrder INT,
    IsActive BIT DEFAULT 1
);
```

**Note:** Alternatively, you can store all help content in JSON files or hardcode it in your views/controllers.

### Step 2: Create Models

Create C# model classes as specified in Section 5 (Data Models).

### Step 3: Create Controllers

```csharp
// HelpController.cs
public class HelpController : Controller
{
    private readonly IHelpService _helpService;

    public HelpController(IHelpService helpService)
    {
        _helpService = helpService;
    }

    // Get all help articles (for Quick Help Center)
    public IActionResult GetArticles(string searchQuery = null, string category = null)
    {
        var articles = _helpService.GetArticles(searchQuery, category);
        return Json(articles);
    }

    // Get single article detail
    public IActionResult GetArticle(string id)
    {
        var article = _helpService.GetArticleById(id);
        if (article == null) return NotFound();
        return Json(article);
    }

    // Get all guide sections (for Comprehensive Guide)
    public IActionResult GetGuideSections()
    {
        var sections = _helpService.GetGuideSections();
        return Json(sections);
    }

    // Get single guide section
    public IActionResult GetGuideSection(string id)
    {
        var section = _helpService.GetGuideSectionById(id);
        if (section == null) return NotFound();
        return Json(section);
    }

    // Get all resources (for Resource Library)
    public IActionResult GetResources()
    {
        var resources = _helpService.GetResources();
        return Json(resources);
    }
}
```

### Step 4: Create Service Layer

```csharp
// IHelpService.cs
public interface IHelpService
{
    List<HelpArticle> GetArticles(string searchQuery = null, string category = null);
    HelpArticle GetArticleById(string id);
    List<HelpSection> GetGuideSections();
    HelpSection GetGuideSectionById(string id);
    List<Resource> GetResources();
}

// HelpService.cs
public class HelpService : IHelpService
{
    // Implement methods - can read from database, JSON files, or return hardcoded data

    public List<HelpArticle> GetArticles(string searchQuery = null, string category = null)
    {
        // Query database or return hardcoded list
        // Apply filters based on searchQuery and category
    }

    // ... implement other methods
}
```

### Step 5: Create Partial Views

Create three partial views:

**_QuickHelpCenter.cshtml**
- Full modal implementation with search, categories, article list, and detail views

**_ComprehensiveHelpGuide.cshtml**
- Full modal with sidebar navigation and scrollable content sections

**_ResourceLibrary.cshtml**
- Can be modal or embedded component showing resource cards

### Step 6: Add to Layout

In your `_Layout.cshtml`:

```html
<!-- Include modals at bottom of body -->
@await Html.PartialAsync("_QuickHelpCenter")
@await Html.PartialAsync("_ComprehensiveHelpGuide")
@await Html.PartialAsync("_ResourceLibrary")
```

### Step 7: Add CSS

Add all CSS from Section 6 to your main stylesheet or create a separate `help.css` file.

### Step 8: Add JavaScript

Add all JavaScript from Section 7 to your main JavaScript file or create a separate `help.js` file.

### Step 9: Populate Content

Seed your database or JSON files with:
- All 14+ help articles
- All 12 comprehensive guide sections with subsections
- All 6 resources

### Step 10: Test All Features

Test these scenarios:
- Opening each modal from navigation
- Searching articles
- Filtering by category
- Viewing article details
- Downloading PDFs
- Navigation between guide sections
- All external links open correctly
- Mobile responsive behavior
- Keyboard accessibility

---

## Summary

This comprehensive help system provides three levels of assistance:

1. **Quick Help Center** - Fast access to specific questions with search and categories
2. **Comprehensive Help Guide** - Step-by-step walkthrough of the entire reporting process
3. **Resource Library** - Direct links to official Minnesota MMB PDF documents

The system is designed to be:
- User-friendly and intuitive
- Searchable and categorized
- Mobile responsive
- Accessible
- Easy to maintain and update

All content should match the official Minnesota Management & Budget pay equity guidance while being presented in a clear, helpful format within your application.

**Contact Information for Support:**
- Email: payequity.mmb@state.mn.us
- Phone: 651-259-3824
- Website: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/

---

## End of Specification

This document should provide your ASP.NET developer with everything needed to build a complete, professional help system for your pay equity reporting application.
