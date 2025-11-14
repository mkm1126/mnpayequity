# Help Center Component Specification for ASP.NET Core

## Overview
The Help Center is a searchable, modal-based help system that provides users with quick access to pay equity reporting documentation. It features a category sidebar, search functionality, and detailed article views with PDF download links.

---

## Visual Design & Layout

### Modal Structure
The Help Center appears as a full-screen modal overlay with the following structure:

```
┌─────────────────────────────────────────────────────────────┐
│ [Modal Overlay - Semi-transparent black background]         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Header Section                                         │  │
│  │ - Icon + "Help Center" title                          │  │
│  │ - Close button (×)                                     │  │
│  │ - Search bar                                           │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Main Content Area (scrollable)                        │  │
│  │  ┌──────────┬─────────────────────────────────────┐  │  │
│  │  │ Sidebar  │ Article List / Article Detail        │  │  │
│  │  │          │                                       │  │  │
│  │  │Categories│ • All Help Articles                  │  │  │
│  │  │          │ • [Article 1]                        │  │  │
│  │  │          │ • [Article 2]                        │  │  │
│  │  │          │ • [Article 3]                        │  │  │
│  │  └──────────┴─────────────────────────────────────┘  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ Footer Section                                         │  │
│  │ - Contact information                                  │  │
│  │ - External resource links                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dimensions & Spacing
- **Modal Width**: Max 1280px (80rem), 100% on smaller screens
- **Modal Height**: Max 90vh (90% of viewport height)
- **Sidebar Width**: 256px (16rem) fixed
- **Content Area**: Remaining space (flex-grow)
- **Padding**: 1.5rem (24px) for sections
- **Border Radius**: 0.5rem (8px) for modal and buttons

### Color Scheme
- **Primary Brand Color**: `#003865` (Navy Blue)
- **Primary Hover**: `#004d7a` (Darker Navy)
- **Background**: `#ffffff` (White)
- **Sidebar Background**: `#f9fafb` (Light Gray)
- **Border Color**: `#e5e7eb` (Gray 200)
- **Text Primary**: `#111827` (Gray 900)
- **Text Secondary**: `#6b7280` (Gray 600)
- **Text Tertiary**: `#9ca3af` (Gray 400)

---

## Component Parts

### 1. Header Section

**Elements:**
- **Icon Box**: 40px × 40px square with rounded corners
  - Background: `#003865`
  - Contains: Book icon (white, 24px)
- **Title**: "Help Center" (text-2xl, font-bold)
- **Close Button**: Large × symbol (text-2xl)
  - Hover effect: Gray to darker gray
- **Search Bar**: Full-width input with icon
  - Placeholder: "Search for help articles..."
  - Search icon on left side
  - Focus state: Blue ring around input

**HTML Structure:**
```html
<div class="help-modal-header">
  <div class="help-title-row">
    <div class="help-icon-title">
      <div class="help-icon">
        <!-- Book SVG icon -->
      </div>
      <h2>Help Center</h2>
    </div>
    <button class="help-close-btn" onclick="closeHelpCenter()">×</button>
  </div>

  <div class="help-search-wrapper">
    <!-- Search SVG icon -->
    <input type="text" id="helpSearchInput"
           placeholder="Search for help articles..."
           onkeyup="searchHelpArticles(this.value)" />
  </div>
</div>
```

### 2. Sidebar (Category Navigation)

**Elements:**
- **Section Title**: "CATEGORIES" (uppercase, tracking-wide, text-sm, font-semibold)
- **Category Buttons**: Vertical list of clickable categories
  - Default state: Gray text, transparent background
  - Hover state: Light gray background
  - Active state: Navy background with white text
  - Categories auto-generated from articles

**Categories to Display:**
1. All Articles (special - shows all)
2. Official Documents
3. Getting Started
4. Employee Eligibility
5. Job Classifications
6. Job Evaluation
7. Salary Data
8. Compliance Tests
9. Compensation
10. Troubleshooting
11. Deadlines
12. Benefits
13. Data Entry
14. Compliance

**HTML Structure:**
```html
<div class="help-sidebar">
  <h3 class="help-sidebar-title">CATEGORIES</h3>
  <div class="help-category-list">
    <button class="help-category-btn active" onclick="selectCategory(null)">
      All Articles
    </button>
    <button class="help-category-btn" onclick="selectCategory('Official Documents')">
      Official Documents
    </button>
    <!-- Repeat for each category -->
  </div>
</div>
```

### 3. Main Content Area (Two Views)

#### View 1: Article List View

**Elements:**
- **View Title**: Shows current filter state
  - "All Help Articles" (default)
  - "[Category] Articles" (when filtered)
  - "Search Results (X)" (when searching)
- **Contextual Articles** (optional): Blue box at top showing 3 relevant articles
- **Article Cards**: Clickable cards in vertical list
  - Category badge (small, gray)
  - Article title (font-semibold, hover changes to navy)
  - Content preview (2 lines max)
  - Right chevron icon
  - Hover effect: Navy border, light blue background
- **Empty State**: When no results
  - File-Question icon (large, gray)
  - "No articles found" message
  - Suggestion text

**HTML Structure:**
```html
<div class="help-content-area">
  <!-- Optional: Contextual articles -->
  <div class="help-contextual-box">
    <h3>Related to what you're working on:</h3>
    <!-- 3 article buttons -->
  </div>

  <h3 class="help-content-title">All Help Articles</h3>

  <div class="help-article-list">
    <button class="help-article-card" onclick="viewArticle('1')">
      <div class="help-article-content">
        <span class="help-category-badge">Getting Started</span>
        <h4 class="help-article-title">Article Title Here</h4>
        <p class="help-article-preview">Preview text here...</p>
      </div>
      <!-- Chevron icon -->
    </button>
    <!-- Repeat for each article -->
  </div>
</div>
```

#### View 2: Article Detail View

**Elements:**
- **Back Button**: "← Back to articles" (clickable link)
- **Category Badge**: Small rounded pill
- **Article Title**: Large, bold heading (text-2xl)
- **PDF Download Button** (if article has PDF):
  - Navy background
  - "Download Official PDF" text
  - Download icon
  - Opens in new tab
- **Article Content**: Full text with preserved line breaks
- **"When to Use" Box** (if article has this field):
  - Green background (`#f0fdf4`)
  - Green left border (4px, `#22c55e`)
  - FileText icon
  - "When to Use This Document" heading
  - Description text

**HTML Structure:**
```html
<div class="help-article-detail">
  <button class="help-back-btn" onclick="backToArticleList()">
    ← Back to articles
  </button>

  <span class="help-category-badge">Official Documents</span>

  <h2 class="help-article-detail-title">Article Title</h2>

  <!-- If has PDF -->
  <a href="[PDF_URL]" target="_blank" class="help-download-btn">
    <!-- Download icon -->
    Download Official PDF
  </a>

  <div class="help-article-body">
    [Article content with line breaks preserved]
  </div>

  <!-- If has whenToUse -->
  <div class="help-when-to-use-box">
    <h3>
      <!-- FileText icon -->
      When to Use This Document
    </h3>
    <p>[When to use text]</p>
  </div>
</div>
```

### 4. Footer Section

**Elements:**
- **Contact Card**:
  - Mail icon (navy)
  - "Still need help?" label
  - "Contact: payequity.mmb@state.mn.us"
- **Resources Card**:
  - External link icon (navy)
  - "Official Resources" label
  - "Visit MMB Pay Equity website"
  - Links to: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/
  - Hover effect: Navy border

**HTML Structure:**
```html
<div class="help-footer">
  <div class="help-footer-grid">
    <div class="help-contact-card">
      <!-- Mail icon -->
      <div>
        <p class="help-contact-label">Still need help?</p>
        <p class="help-contact-value">Contact: payequity.mmb@state.mn.us</p>
      </div>
    </div>

    <a href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/"
       target="_blank" class="help-contact-card">
      <!-- External link icon -->
      <div>
        <p class="help-contact-label">Official Resources</p>
        <p class="help-contact-value">Visit MMB Pay Equity website</p>
      </div>
    </a>
  </div>
</div>
```

---

## Help Articles Content

You need to create **14 help articles** with the following structure:

### Article Data Model

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

### Complete Article List

#### Article 1: Instructions for Submitting a Report (PDF)
- **ID**: `pdf-submission`
- **Title**: `Instructions for Submitting a Local Government Pay Equity Report`
- **Category**: `Official Documents`
- **Content**:
```
This comprehensive official guide from Minnesota Management & Budget provides complete step-by-step instructions for submitting your local government pay equity report.

What's Covered:
• Report submission deadlines and procedures
• Required forms and documentation
• Data reporting requirements
• Common submission errors to avoid
• Contact information for assistance
• Compliance certification requirements

This is your primary reference for understanding what must be submitted and how to properly complete your report.
```
- **PDF URL**: `https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf`
- **When to Use**: `Reference this document when preparing to submit your report, verifying submission requirements, or if you receive questions from MMB about your submission.`
- **Keywords**: `instructions, submit, submission, requirements, how to, guide, pdf, forms, deadline`

#### Article 2: State Job Match Evaluation System (PDF)
- **ID**: `pdf-job-match`
- **Title**: `State Job Match Evaluation System Guide (2023)`
- **Category**: `Official Documents`
- **Content**:
```
The official State Job Match Evaluation System guide explains how to properly evaluate and assign point values to your job classifications.

What's Covered:
• The four evaluation factors: Skill, Effort, Responsibility, and Working Conditions
• Point assignment methodology and examples
• Comparison with state job classifications
• Guidelines for consistent evaluation across all jobs
• Common job titles and their typical point ranges
• How to handle unique or specialized positions

This system ensures objective, consistent job evaluation that stands up to compliance review.
```
- **PDF URL**: `https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf`
- **When to Use**: `Use this guide when entering job classifications for the first time, evaluating new positions, or if your point assignments are questioned during a review.`
- **Keywords**: `points, evaluation, job match, state system, classification, 2023, skill, effort, responsibility, working conditions`

#### Article 3: Guide to Understanding Pay Equity Compliance (PDF)
- **ID**: `pdf-understand-compliance`
- **Title**: `Guide to Understanding Pay Equity Compliance`
- **Category**: `Official Documents`
- **Content**:
```
This essential guide explains what pay equity compliance means, how the statistical tests work, and what actions you should take based on your results.

What's Covered:
• Definition of pay equity compliance
• Explanation of the three compliance tests
• Understanding the 80% threshold
• What it means to be "in compliance" vs "out of compliance"
• Required corrective actions for non-compliance
• Implementation timelines and planning
• Working with the MMB Pay Equity Unit

Everyone involved in pay equity reporting should read this guide to understand the goals and requirements.
```
- **PDF URL**: `https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf`
- **When to Use**: `Essential reading before running your first compliance analysis, when explaining results to leadership, or when planning corrective actions for non-compliance.`
- **Keywords**: `compliance, understanding, guide, requirements, tests, 80%, threshold, corrective action`

#### Article 4: How to Interpret Your Results (PDF)
- **ID**: `pdf-interpret-results`
- **Title**: `How to Interpret Your Pay Equity Results`
- **Category**: `Official Documents`
- **Content**:
```
Detailed technical guide for understanding and interpreting the results of your pay equity compliance analysis.

What's Covered:
• Statistical Analysis Test interpretation
• Salary Range Test calculations and meaning
• Exceptional Service Pay Test analysis
• Understanding the predicted pay line
• Identifying problematic job classifications
• Calculating required salary adjustments
• Documentation requirements for implementation plans

This guide helps you move from test results to actionable compliance strategies.
```
- **PDF URL**: `https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf`
- **When to Use**: `Refer to this after running your compliance analysis to understand what the numbers mean and determine next steps for addressing any issues.`
- **Keywords**: `results, interpret, tests, analysis, understand, statistical, salary range, exceptional service, predicted pay`

#### Article 5: What is the Minnesota Local Government Pay Equity Act?
- **ID**: `1`
- **Title**: `What is the Minnesota Local Government Pay Equity Act?`
- **Category**: `Getting Started`
- **Content**: `The Minnesota Local Government Pay Equity Act (Minnesota Statutes 471.991-471.999) requires local governments to ensure equitable compensation between female-dominated and male-dominated job classes of comparable work value. All political subdivisions with more than one female job class must submit annual pay equity reports. For complete details, visit: https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/`
- **Keywords**: `law, act, requirements, basics, overview`

#### Article 6: Which employees must be included?
- **ID**: `2`
- **Title**: `Which employees must be included in the report?`
- **Category**: `Employee Eligibility`
- **Content**: `Include all employees who meet these criteria: Regular employees who work at least 67 days per year AND at least 14 hours per week on average. Student employees who work at least 100 days per year AND at least 14 hours per week on average. Exclude temporary, seasonal, or casual employees who don't meet these minimums.`
- **Keywords**: `eligibility, employees, requirements, 67 days, 14 hours, students`

#### Article 7: How are job classes categorized by gender?
- **ID**: `3`
- **Title**: `How are job classes categorized by gender?`
- **Category**: `Job Classifications`
- **Content**: `Job classes are categorized as: Male-dominated: 80% or more employees are male. Female-dominated: 70% or more employees are female. Balanced: No more than 80% male and no more than 70% female. This categorization is based on the actual employee count in each job class, not the nature of the work itself.`
- **Keywords**: `gender, male, female, balanced, 70%, 80%, dominated`

#### Article 8: What are job evaluation points?
- **ID**: `4`
- **Title**: `What are job evaluation points?`
- **Category**: `Job Evaluation`
- **Content**: `Job evaluation points represent the relative value of each job class based on four factors: Skill (education, training, experience required), Effort (physical and mental demands), Responsibility (accountability and decision-making), and Working Conditions (physical environment and hazards). Your jurisdiction should use a consistent, approved job evaluation system to assign points.`
- **Keywords**: `points, evaluation, skill, effort, responsibility, working conditions`

#### Article 9: How should I enter salary information?
- **ID**: `5`
- **Title**: `How should I enter salary information?`
- **Category**: `Salary Data`
- **Content**: `Enter all salaries as monthly amounts. For hourly employees, convert using: (Hourly Rate × Hours per Week × 52 weeks) ÷ 12 months. Enter both minimum and maximum salary for each job class. If there's no salary range (only one pay rate), enter the same amount for both minimum and maximum.`
- **Keywords**: `salary, wage, monthly, hourly, conversion, pay`

#### Article 10: What is the Statistical Analysis Test?
- **ID**: `6`
- **Title**: `What is the Statistical Analysis Test?`
- **Category**: `Compliance Tests`
- **Content**: `The Statistical Analysis Test compares the percentage of male-dominated and female-dominated job classes that fall below their predicted pay (based on job value). The underpayment ratio must be 80% or less to pass. This test ensures that female-dominated classes aren't systematically underpaid compared to male-dominated classes of similar value.`
- **Keywords**: `statistical, test, underpayment, ratio, 80%, predicted pay`

#### Article 11: What is the Salary Range Test?
- **ID**: `7`
- **Title**: `What is the Salary Range Test?`
- **Category**: `Compliance Tests`
- **Content**: `The Salary Range Test compares the average number of years it takes to reach maximum salary in male-dominated versus female-dominated job classes. The ratio must be between 110% and 140% to pass. This ensures that neither gender faces unreasonably long advancement periods.`
- **Keywords**: `salary range, test, years to max, 110%, 140%, advancement`

#### Article 12: What is Exceptional Service Pay?
- **ID**: `8`
- **Title**: `What is Exceptional Service Pay (ESP)?`
- **Category**: `Compensation`
- **Content**: `Exceptional Service Pay is additional compensation beyond regular salary for longevity, special skills, certifications, or exceptional performance. Common types include: longevity pay, certification pay, shift differential, bilingual pay, and education pay. The ESP test ensures these opportunities are distributed equitably between male and female-dominated classes.`
- **Keywords**: `ESP, exceptional service, longevity, certification, differential`

#### Article 13: What if my jurisdiction fails a compliance test?
- **ID**: `9`
- **Title**: `What if my jurisdiction fails a compliance test?`
- **Category**: `Troubleshooting`
- **Content**: `Failing a test means pay disparities exist between male and female-dominated classes. You should: 1) Identify the specific classes contributing to the failure, 2) Review and adjust compensation structures, 3) Budget for equity adjustments, 4) Consider multi-year implementation plans if immediate changes aren't feasible, 5) Consult with MMB Pay Equity Unit for guidance, 6) Document all corrective actions taken.`
- **Keywords**: `fail, failed, out of compliance, fix, correct, adjust`

#### Article 14: When is the report due?
- **ID**: `10`
- **Title**: `When is the report due?`
- **Category**: `Deadlines`
- **Content**: `Pay equity reports are due by January 31st every three years. The report should reflect data as of December 31st of the previous year. Late submissions may result in non-compliance penalties. Plan to start gathering data in November or December to ensure timely submission.`
- **Keywords**: `deadline, due date, january 31, when, submit`

---

## CSS Styling

### Complete Stylesheet

```css
/* ============================================
   HELP CENTER MODAL STYLES
   ============================================ */

/* Modal Overlay */
.help-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.help-modal-overlay.hidden {
  display: none;
}

/* Modal Container */
.help-modal {
  background-color: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 80rem;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

/* ============================================
   HEADER SECTION
   ============================================ */

.help-modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.help-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.help-icon-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.help-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #003865;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #ffffff;
}

.help-modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.help-close-btn {
  color: #9ca3af;
  background: transparent;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  transition: color 0.2s ease;
}

.help-close-btn:hover {
  color: #4b5563;
}

/* Search Bar */
.help-search-wrapper {
  position: relative;
}

.help-search-wrapper svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  pointer-events: none;
}

#helpSearchInput {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

#helpSearchInput:focus {
  outline: none;
  border-color: #003865;
  box-shadow: 0 0 0 3px rgba(0, 56, 101, 0.1);
}

/* ============================================
   MAIN CONTENT AREA
   ============================================ */

.help-content-wrapper {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 16rem 1fr;
}

/* Sidebar */
.help-sidebar {
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

.help-category-btn {
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

.help-category-btn:hover {
  background-color: #e5e7eb;
}

.help-category-btn.active {
  background-color: #003865;
  color: #ffffff;
}

/* Content Area */
.help-content-area {
  padding: 1.5rem;
  overflow-y: auto;
}

.help-content-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

/* ============================================
   CONTEXTUAL ARTICLES (Optional)
   ============================================ */

.help-contextual-box {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
}

.help-contextual-box h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.75rem;
}

.help-contextual-article {
  width: 100%;
  text-align: left;
  padding: 0.75rem;
  background-color: #ffffff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.help-contextual-article:hover {
  border-color: #60a5fa;
}

.help-contextual-article span {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

/* ============================================
   ARTICLE LIST VIEW
   ============================================ */

.help-article-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.help-article-card {
  width: 100%;
  text-align: left;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  display: flex;
  align-items: start;
  justify-content: space-between;
}

.help-article-card:hover {
  border-color: #003865;
  background-color: #eff6ff;
}

.help-article-content {
  flex: 1;
}

.help-category-badge {
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
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.help-article-card:hover .help-article-title {
  color: #003865;
}

.help-article-preview {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.help-article-card svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 0.75rem;
  margin-top: 0.25rem;
}

.help-article-card:hover svg {
  color: #003865;
}

/* Empty State */
.help-empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.help-empty-state svg {
  width: 4rem;
  height: 4rem;
  color: #d1d5db;
  margin: 0 auto 1rem auto;
}

.help-empty-state p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.help-empty-state p.text-sm {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* ============================================
   ARTICLE DETAIL VIEW
   ============================================ */

.help-article-detail {
  max-width: 48rem;
}

.help-back-btn {
  color: #003865;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.25rem 0;
  transition: color 0.2s ease;
}

.help-back-btn:hover {
  color: #004d7a;
  text-decoration: underline;
}

.help-article-detail .help-category-badge {
  background-color: #dbeafe;
  color: #1e40af;
}

.help-article-detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 1rem 0;
}

.help-download-btn {
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

.help-download-btn:hover {
  background-color: #004d7a;
}

.help-download-btn svg {
  width: 1rem;
  height: 1rem;
}

.help-article-body {
  color: #374151;
  line-height: 1.625;
  white-space: pre-line;
  margin-bottom: 1.5rem;
}

.help-when-to-use-box {
  padding: 1rem;
  background-color: #f0fdf4;
  border-left: 4px solid #22c55e;
  border-radius: 0 0.5rem 0.5rem 0;
  margin-top: 1.5rem;
}

.help-when-to-use-box h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-when-to-use-box h3 svg {
  width: 1rem;
  height: 1rem;
}

.help-when-to-use-box p {
  font-size: 0.875rem;
  color: #15803d;
  margin: 0;
}

/* ============================================
   FOOTER SECTION
   ============================================ */

.help-footer {
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

.help-contact-card svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #003865;
  flex-shrink: 0;
}

.help-contact-label {
  font-weight: 500;
  color: #111827;
  font-size: 0.875rem;
  margin: 0 0 0.125rem 0;
}

.help-contact-value {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* ============================================
   RESPONSIVE DESIGN
   ============================================ */

@media (max-width: 768px) {
  .help-modal {
    max-width: 100%;
    max-height: 100vh;
    margin: 0;
    border-radius: 0;
  }

  .help-content-wrapper {
    grid-template-columns: 1fr;
  }

  .help-sidebar {
    display: none;
  }

  .help-footer-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## JavaScript Functionality

### Complete JavaScript Implementation

```javascript
// ============================================
// HELP CENTER - STATE MANAGEMENT
// ============================================

let helpCenterState = {
  isOpen: false,
  view: 'list', // 'list' or 'detail'
  selectedCategory: null,
  selectedArticle: null,
  searchQuery: '',
  articles: [] // Will be populated
};

// ============================================
// HELP CENTER - OPEN/CLOSE
// ============================================

function openHelpCenter() {
  helpCenterState.isOpen = true;
  document.getElementById('helpCenterModal').classList.remove('hidden');
  loadHelpArticles();
  renderArticleList();
}

function closeHelpCenter() {
  helpCenterState.isOpen = false;
  document.getElementById('helpCenterModal').classList.add('hidden');
  resetHelpCenterState();
}

function resetHelpCenterState() {
  helpCenterState.view = 'list';
  helpCenterState.selectedCategory = null;
  helpCenterState.selectedArticle = null;
  helpCenterState.searchQuery = '';
  document.getElementById('helpSearchInput').value = '';
}

// ============================================
// HELP CENTER - SEARCH
// ============================================

function searchHelpArticles(query) {
  helpCenterState.searchQuery = query.toLowerCase();
  renderArticleList();
}

// ============================================
// HELP CENTER - CATEGORY SELECTION
// ============================================

function selectCategory(category) {
  helpCenterState.selectedCategory = category;
  helpCenterState.selectedArticle = null;

  // Update active state on buttons
  document.querySelectorAll('.help-category-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (category === null) {
    document.querySelector('[onclick="selectCategory(null)"]').classList.add('active');
  } else {
    document.querySelector(`[onclick="selectCategory('${category}')"]`).classList.add('active');
  }

  renderArticleList();
}

// ============================================
// HELP CENTER - ARTICLE LIST RENDERING
// ============================================

function renderArticleList() {
  const container = document.getElementById('helpContentArea');
  const articles = getFilteredArticles();

  let html = '';

  // Title based on current filter
  if (helpCenterState.selectedCategory) {
    html += `<h3 class="help-content-title">${helpCenterState.selectedCategory} Articles</h3>`;
  } else if (helpCenterState.searchQuery) {
    html += `<h3 class="help-content-title">Search Results (${articles.length})</h3>`;
  } else {
    html += `<h3 class="help-content-title">All Help Articles</h3>`;
  }

  // Empty state
  if (articles.length === 0) {
    html += `
      <div class="help-empty-state">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No articles found</p>
        <p class="text-sm">Try a different search term or browse by category</p>
      </div>
    `;
  } else {
    html += '<div class="help-article-list">';

    articles.forEach(article => {
      html += `
        <button class="help-article-card" onclick="viewArticle('${article.id}')">
          <div class="help-article-content">
            <span class="help-category-badge">${article.category}</span>
            <h4 class="help-article-title">${article.title}</h4>
            <p class="help-article-preview">${article.content}</p>
          </div>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      `;
    });

    html += '</div>';
  }

  container.innerHTML = html;
}

// ============================================
// HELP CENTER - FILTER ARTICLES
// ============================================

function getFilteredArticles() {
  let filtered = helpCenterState.articles;

  // Filter by search query
  if (helpCenterState.searchQuery) {
    filtered = filtered.filter(article => {
      return article.title.toLowerCase().includes(helpCenterState.searchQuery) ||
             article.content.toLowerCase().includes(helpCenterState.searchQuery) ||
             article.keywords.some(k => k.toLowerCase().includes(helpCenterState.searchQuery));
    });
  }

  // Filter by category
  if (helpCenterState.selectedCategory) {
    filtered = filtered.filter(article => article.category === helpCenterState.selectedCategory);
  }

  return filtered;
}

// ============================================
// HELP CENTER - VIEW ARTICLE DETAIL
// ============================================

function viewArticle(articleId) {
  const article = helpCenterState.articles.find(a => a.id === articleId);
  if (!article) return;

  helpCenterState.selectedArticle = article;
  helpCenterState.view = 'detail';

  const container = document.getElementById('helpContentArea');

  let html = `
    <div class="help-article-detail">
      <button class="help-back-btn" onclick="backToArticleList()">
        ← Back to articles
      </button>

      <span class="help-category-badge">${article.category}</span>

      <h2 class="help-article-detail-title">${article.title}</h2>
  `;

  // PDF download button if applicable
  if (article.pdfUrl) {
    html += `
      <a href="${article.pdfUrl}" target="_blank" rel="noopener noreferrer" class="help-download-btn">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Official PDF
      </a>
    `;
  }

  html += `<div class="help-article-body">${article.content}</div>`;

  // When to use box if applicable
  if (article.whenToUse) {
    html += `
      <div class="help-when-to-use-box">
        <h3>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          When to Use This Document
        </h3>
        <p>${article.whenToUse}</p>
      </div>
    `;
  }

  html += '</div>';

  container.innerHTML = html;
}

// ============================================
// HELP CENTER - BACK TO LIST
// ============================================

function backToArticleList() {
  helpCenterState.view = 'list';
  helpCenterState.selectedArticle = null;
  renderArticleList();
}

// ============================================
// HELP CENTER - LOAD ARTICLES (FROM SERVER OR STATIC)
// ============================================

function loadHelpArticles() {
  // Option 1: Load from server via AJAX
  // fetch('/Help/GetArticles')
  //   .then(response => response.json())
  //   .then(data => {
  //     helpCenterState.articles = data;
  //     renderArticleList();
  //   });

  // Option 2: Use static data (embedded in page)
  helpCenterState.articles = window.HELP_ARTICLES || [];
}
```

---

## ASP.NET Core Implementation

### Step 1: Create the Model

```csharp
// Models/HelpArticle.cs
namespace YourApp.Models
{
    public class HelpArticle
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public string Content { get; set; }
        public List<string> Keywords { get; set; }
        public string PdfUrl { get; set; }
        public string WhenToUse { get; set; }
    }
}
```

### Step 2: Create the Service

```csharp
// Services/HelpService.cs
namespace YourApp.Services
{
    public interface IHelpService
    {
        List<HelpArticle> GetAllArticles();
        HelpArticle GetArticleById(string id);
        List<string> GetCategories();
    }

    public class HelpService : IHelpService
    {
        private readonly List<HelpArticle> _articles;

        public HelpService()
        {
            // Initialize with all 14 articles
            _articles = new List<HelpArticle>
            {
                // Add all articles from the content section above
                new HelpArticle
                {
                    Id = "pdf-submission",
                    Title = "Instructions for Submitting a Local Government Pay Equity Report",
                    Category = "Official Documents",
                    Content = "This comprehensive official guide...",
                    Keywords = new List<string> { "instructions", "submit", "submission" },
                    PdfUrl = "https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf",
                    WhenToUse = "Reference this document when preparing..."
                },
                // ... add remaining 13 articles
            };
        }

        public List<HelpArticle> GetAllArticles()
        {
            return _articles;
        }

        public HelpArticle GetArticleById(string id)
        {
            return _articles.FirstOrDefault(a => a.Id == id);
        }

        public List<string> GetCategories()
        {
            return _articles.Select(a => a.Category).Distinct().ToList();
        }
    }
}
```

### Step 3: Register Service in Startup

```csharp
// Program.cs or Startup.cs
services.AddScoped<IHelpService, HelpService>();
```

### Step 4: Create the Partial View

```cshtml
@* Views/Shared/_HelpCenter.cshtml *@
@model List<YourApp.Models.HelpArticle>

<div id="helpCenterModal" class="help-modal-overlay hidden">
  <div class="help-modal">
    <!-- Header -->
    <div class="help-modal-header">
      <div class="help-title-row">
        <div class="help-icon-title">
          <div class="help-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2>Help Center</h2>
        </div>
        <button class="help-close-btn" onclick="closeHelpCenter()">×</button>
      </div>

      <div class="help-search-wrapper">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" id="helpSearchInput"
               placeholder="Search for help articles..."
               onkeyup="searchHelpArticles(this.value)" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="help-content-wrapper">
      <!-- Sidebar -->
      <div class="help-sidebar">
        <h3 class="help-sidebar-title">CATEGORIES</h3>
        <div class="help-category-list">
          <button class="help-category-btn active" onclick="selectCategory(null)">
            All Articles
          </button>
          @foreach (var category in Model.Select(a => a.Category).Distinct())
          {
            <button class="help-category-btn" onclick="selectCategory('@category')">
              @category
            </button>
          }
        </div>
      </div>

      <!-- Content Area -->
      <div id="helpContentArea" class="help-content-area">
        <!-- Populated by JavaScript -->
      </div>
    </div>

    <!-- Footer -->
    <div class="help-footer">
      <div class="help-footer-grid">
        <div class="help-contact-card">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div>
            <p class="help-contact-label">Still need help?</p>
            <p class="help-contact-value">Contact: payequity.mmb@state.mn.us</p>
          </div>
        </div>

        <a href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/"
           target="_blank" class="help-contact-card">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <div>
            <p class="help-contact-label">Official Resources</p>
            <p class="help-contact-value">Visit MMB Pay Equity website</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>

<script>
  // Embed articles as JavaScript variable
  window.HELP_ARTICLES = @Html.Raw(Json.Serialize(Model));
</script>
```

### Step 5: Include in Layout

```cshtml
@* Views/Shared/_Layout.cshtml *@
@inject IHelpService HelpService

<!DOCTYPE html>
<html>
<head>
    <!-- Your existing head content -->
    <link rel="stylesheet" href="~/css/help-center.css" />
</head>
<body>
    <!-- Your existing layout content -->

    <!-- Include Help Center modal -->
    @await Html.PartialAsync("_HelpCenter", HelpService.GetAllArticles())

    <script src="~/js/help-center.js"></script>
</body>
</html>
```

### Step 6: Add Navigation Link

In your navigation menu:

```html
<a href="#" onclick="openHelpCenter(); return false;">Help</a>
```

---

## Testing Checklist

- [ ] Modal opens when clicking Help link
- [ ] Modal closes when clicking × button
- [ ] Modal closes when clicking outside (optional)
- [ ] Search filters articles in real-time
- [ ] Category buttons filter articles
- [ ] Active category shows navy background
- [ ] Clicking article card opens detail view
- [ ] Back button returns to list view
- [ ] PDF download buttons open in new tab
- [ ] "When to Use" box displays correctly
- [ ] Contact email and website links work
- [ ] Responsive design works on mobile
- [ ] All 14 articles display correctly
- [ ] Keywords enable proper search

---

## Summary

This Help Center component provides:

✅ **14 Help Articles** covering all major topics
✅ **Search Functionality** with keyword matching
✅ **Category Filtering** with sidebar navigation
✅ **Article Detail View** with PDF downloads
✅ **Responsive Design** for mobile and desktop
✅ **Professional Styling** matching Minnesota MMB branding
✅ **Easy Maintenance** - add articles via service
✅ **Complete Documentation** for your developer

The component is self-contained and can be added to any page in your ASP.NET Core application.
