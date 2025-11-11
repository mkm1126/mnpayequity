import { useState } from 'react';
import { Book, ExternalLink, FileText, Video, Mail, Phone, Download, CheckCircle, ArrowRight } from 'lucide-react';

type ComprehensiveHelpGuideProps = {
  onClose: () => void;
};

type HelpSection = {
  id: string;
  title: string;
  icon: any;
  content: string;
  subsections?: {
    title: string;
    content: string;
    links?: { text: string; url: string }[];
  }[];
  links?: { text: string; url: string }[];
};

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Pay Equity Reporting',
    icon: Book,
    content: 'Welcome to the Minnesota Local Government Pay Equity Reporting System. This guide will help you understand your obligations and successfully complete your annual pay equity report.',
    subsections: [
      {
        title: 'What is the Pay Equity Act?',
        content: 'The Minnesota Local Government Pay Equity Act (Minnesota Statutes 471.991-471.999) requires local governments to ensure that female-dominated and male-dominated job classes of comparable work value receive equitable compensation. All political subdivisions with more than one female job class must comply.',
        links: [
          { text: 'Minnesota Pay Equity Law Overview', url: 'https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/' }
        ]
      },
      {
        title: 'Who Must Report?',
        content: 'All Minnesota counties, cities, towns, school districts, and other political subdivisions with more than one female-dominated job class must submit annual pay equity reports by January 31st each year.',
      },
      {
        title: 'Key Deadlines',
        content: 'Annual reports are due by January 31st for data as of December 31st of the previous year. We recommend starting data collection early to ensure adequate time for job evaluation, analysis, and any necessary corrections.'
      }
    ]
  },
  {
    id: 'official-documents',
    title: 'Official Minnesota MMB Documents',
    icon: FileText,
    content: 'Minnesota Management & Budget (MMB) provides comprehensive official guidance documents. These should be your primary reference for all pay equity reporting questions.',
    subsections: [
      {
        title: 'Instructions for Submitting a Local Government Pay Equity Report',
        content: 'This is your primary reference document. It contains complete step-by-step instructions for preparing and submitting your annual report, including all required forms and documentation.',
        links: [
          { text: 'Download Submission Instructions PDF', url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf' }
        ]
      },
      {
        title: 'State Job Match Evaluation System (2023)',
        content: 'The official guide for evaluating job classifications and assigning point values based on skill, effort, responsibility, and working conditions. This system ensures objective, consistent job evaluation.',
        links: [
          { text: 'Download State Job Match Guide PDF', url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf' }
        ]
      },
      {
        title: 'Guide to Understanding Pay Equity Compliance',
        content: 'Essential reading for understanding what compliance means, how the statistical tests work, and what actions to take based on your results. Everyone involved in pay equity reporting should review this guide.',
        links: [
          { text: 'Download Compliance Guide PDF', url: 'https://mn.gov/mmb-stat/pay-equity/guide-understand-compl.pdf' }
        ]
      },
      {
        title: 'How to Interpret Your Pay Equity Results',
        content: 'Detailed technical guide for understanding compliance test results, identifying problematic job classifications, and calculating required salary adjustments.',
        links: [
          { text: 'Download Results Interpretation Guide PDF', url: 'https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf' }
        ]
      }
    ]
  },
  {
    id: 'data-gathering',
    title: 'Step 1: Data Gathering',
    icon: CheckCircle,
    content: 'Proper data collection is the foundation of accurate pay equity reporting. Start this process early to ensure adequate time.',
    subsections: [
      {
        title: 'Which Employees to Include',
        content: 'Include all employees who work:\n• Regular employees: 67+ days per year AND 14+ hours per week on average\n• Student employees: 100+ days per year AND 14+ hours per week on average\n\nExclude temporary, seasonal, or casual employees who don\'t meet these minimums.'
      },
      {
        title: 'Required Information for Each Employee',
        content: '• Job classification/title\n• Gender (for classification purposes only)\n• Current salary or hourly rate\n• Hours worked per week\n• Days worked per year\n• Years of service\n• Any exceptional service pay received'
      },
      {
        title: 'Organizing by Job Classification',
        content: 'Group employees into distinct job classes based on similar duties, responsibilities, and qualifications. Each job class should represent a distinct type of work, not just similar titles.'
      },
      {
        title: 'Salary Information',
        content: 'For each job class, document:\n• Minimum monthly salary\n• Maximum monthly salary\n• Number of years to reach maximum\n• Any longevity or exceptional service pay'
      }
    ]
  },
  {
    id: 'job-evaluation',
    title: 'Step 2: Job Evaluation',
    icon: CheckCircle,
    content: 'Every job must be evaluated using an approved system. The State Job Match system is recommended and built into this application.',
    subsections: [
      {
        title: 'The Four Evaluation Factors',
        content: 'Jobs are evaluated on:\n\n1. Skill: Education, training, experience required\n2. Effort: Physical and mental demands\n3. Responsibility: Accountability for decisions, resources, outcomes\n4. Working Conditions: Physical environment and hazards\n\nEach factor is assigned points based on level (1-4). Use the Job Match Wizard in this system to guide you through the evaluation.'
      },
      {
        title: 'Consistency is Critical',
        content: 'Apply the same evaluation standards to all jobs. Inconsistent evaluation is the most common cause of compliance issues. Document your rationale for point assignments.'
      },
      {
        title: 'Common Evaluation Mistakes',
        content: '• Assigning points based on the person, not the position\n• Undervaluing skills in female-dominated jobs\n• Overemphasizing physical demands vs. mental demands\n• Inconsistent application of working conditions criteria\n• Letting current pay influence point assignments'
      }
    ],
    links: [
      { text: 'State Job Match Evaluation System Guide', url: 'https://mn.gov/mmb-stat/pay-equity/State%20Job%20Match%20Evaluation%20System-%202023.pdf' }
    ]
  },
  {
    id: 'data-entry',
    title: 'Step 3: Data Entry',
    icon: CheckCircle,
    content: 'Enter your data carefully into this system. Double-check all entries before running compliance tests.',
    subsections: [
      {
        title: 'Jurisdiction Information',
        content: 'Verify your jurisdiction name, ID, address, and contact information are current. Designate at least one primary contact with complete contact details.'
      },
      {
        title: 'Creating Your Report',
        content: 'Create a new report for the current year. Give it a clear case description (e.g., "Annual Report 2024" or "Corrected Report 2024").'
      },
      {
        title: 'Entering Job Classifications',
        content: 'For each job class, enter:\n• Job title\n• Point value (from your evaluation)\n• Number of male employees\n• Number of female employees\n• Number of non-binary employees\n• Minimum monthly salary\n• Maximum monthly salary\n• Years to reach maximum\n• Years of service pay\n• Exceptional service category (if applicable)'
      },
      {
        title: 'Data Entry Tips',
        content: '• You can copy jobs from previous years and update the data\n• You can import jobs from a CSV file\n• Use the manual entry wizard for a guided experience\n• Save frequently as you work\n• Use the data validation tools to catch errors'
      }
    ]
  },
  {
    id: 'compliance-testing',
    title: 'Step 4: Compliance Testing',
    icon: CheckCircle,
    content: 'After entering all data, run the compliance evaluation to test whether your jurisdiction meets pay equity requirements.',
    subsections: [
      {
        title: 'The Three Compliance Tests',
        content: '1. Statistical Analysis Test: Compares percentage of male vs. female jobs below predicted pay. Underpayment ratio must be 80% or less.\n\n2. Salary Range Test: Compares average years to maximum salary. Ratio must be between 80% and 140%.\n\n3. Exceptional Service Pay Test: Compares percentage receiving exceptional service pay. Ratio must be 80% or more (if >20% of male classes receive ESP).'
      },
      {
        title: 'Understanding Your Results',
        content: 'The system will show you:\n• Overall compliance status\n• Detailed results for each test\n• General information about your job classes\n• Statistical analysis with predicted pay calculations\n\nUse the Gap Analysis tool to identify which specific jobs are causing compliance issues.',
        links: [
          { text: 'How to Interpret Your Results Guide', url: 'https://mn.gov/mmb-stat/pay-equity/interpret-results-pay%20equity.pdf' }
        ]
      },
      {
        title: 'What If You\'re Out of Compliance?',
        content: 'Don\'t panic - many jurisdictions fail initially. You have options:\n\n• Review data for errors (most common cause)\n• Use the What-If Calculator to test salary adjustments\n• Use the Gap Analysis to prioritize which jobs to address\n• Develop a multi-year implementation plan\n• Budget for equity adjustments in next fiscal year\n• Consult with MMB Pay Equity Unit for guidance'
      }
    ]
  },
  {
    id: 'submission',
    title: 'Step 5: Final Submission',
    icon: CheckCircle,
    content: 'Before submitting, use the Pre-Submission Checker to ensure all requirements are met.',
    subsections: [
      {
        title: 'Required Documents',
        content: '• Completed pay equity report (export from this system)\n• Compliance test results (export from this system)\n• Implementation plan (if out of compliance)\n• Any supporting documentation or notes\n• Authorized signatures as required'
      },
      {
        title: 'How to Submit',
        content: 'Email all documents to the MMB Pay Equity Unit at:\npayequity.mmb@state.mn.us\n\nInclude your jurisdiction name and report year in the subject line.'
      },
      {
        title: 'After Submission',
        content: '• MMB will review your submission\n• They may contact you with questions\n• You\'ll receive confirmation of acceptance\n• Keep copies of everything for your records\n• Note any follow-up actions required'
      },
      {
        title: 'Deadline Reminder',
        content: 'Reports must be submitted by January 31st each year. Late submissions may result in non-compliance penalties.'
      }
    ],
    links: [
      { text: 'Official Submission Instructions', url: 'https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf' }
    ]
  },
  {
    id: 'sharing-reports',
    title: 'Report Sharing & Privacy Controls',
    icon: CheckCircle,
    content: 'Control who can access your pay equity reports using the built-in privacy and sharing features.',
    subsections: [
      {
        title: 'Understanding Report Privacy',
        content: 'Every report starts as "Private" which means only your jurisdiction can view it. You can choose to share reports with State Pay Equity Coordinators at Minnesota Management & Budget when you need assistance or are ready for review.'
      },
      {
        title: 'Using the Toggle Slider',
        content: 'You\'ll find a toggle slider next to each report in your list and in the report detail view:\n\n• Gray (Left Position) = Private: Only your jurisdiction can view\n• Yellow (Right Position) = Shared: State coordinators can also view\n\nSimply click the toggle to switch between states. A confirmation modal will appear explaining what will happen.'
      },
      {
        title: 'When to Share Reports',
        content: 'Consider sharing your report with state coordinators when:\n\n• You need technical assistance or guidance\n• You\'re ready for preliminary review before final submission\n• You want feedback on your compliance analysis\n• You have questions about implementation planning\n• You need help interpreting test results\n\nYou can switch back to Private at any time.'
      },
      {
        title: 'What Shared Reports Include',
        content: 'When you share a report, state coordinators can view:\n\n• All job classifications and evaluations\n• Salary data and equity calculations\n• Compliance test results\n• Implementation plans (if applicable)\n• Report notes and documentation\n\nThey cannot edit your data - they can only view it.'
      },
      {
        title: 'Switching Back to Private',
        content: 'You can make a report private again at any time by clicking the toggle slider. State coordinators will immediately lose access to the report data. Your report remains in your jurisdiction\'s records regardless of sharing status.'
      },
      {
        title: 'Report Status Indicators',
        content: 'Reports show their current status:\n\n• "Private (MMB Only)" - Only your jurisdiction can view\n• "Shared" - State coordinators have access\n• "Submitted" - Officially submitted to MMB\n• "In Compliance" - Approved and compliant\n• "Out of Compliance" - Requires action\n\nOnce a report is submitted, approved, or marked with compliance status, the sharing toggle is no longer available.'
      }
    ]
  },
  {
    id: 'tools',
    title: 'Using System Tools',
    icon: CheckCircle,
    content: 'This system includes powerful tools to help you understand and achieve pay equity compliance.',
    subsections: [
      {
        title: 'Job Match Wizard',
        content: 'Interactive tool that guides you through evaluating a job using the State Job Match system. Answer questions about skill, effort, responsibility, and working conditions to calculate point values.'
      },
      {
        title: 'What-If Calculator',
        content: 'Test different salary adjustment scenarios to see their impact on compliance before implementing changes. Calculate annual costs and see which adjustments move you toward compliance.'
      },
      {
        title: 'Gap Analysis Tool',
        content: 'Identifies specific jobs that are underpaid relative to their value. Prioritizes issues by severity and calculates the cost to close all gaps. Export analysis for budget presentations.'
      },
      {
        title: 'Pre-Submission Checker',
        content: 'Comprehensive validation of all submission requirements. Ensures you have complete data, proper evaluations, and all required documentation before final submission.'
      },
      {
        title: 'Submission Checklist',
        content: 'Track your progress through the entire reporting process from data gathering to final submission. Ensures you don\'t miss any critical steps.'
      }
    ]
  },
  {
    id: 'common-issues',
    title: 'Common Issues & Troubleshooting',
    icon: CheckCircle,
    content: 'Solutions to frequently encountered problems in pay equity reporting.',
    subsections: [
      {
        title: 'My jurisdiction fails the Statistical Analysis Test',
        content: 'This usually means female-dominated job classes are systematically underpaid compared to male-dominated classes of similar value. Use the Gap Analysis tool to identify which specific jobs are causing the issue. Focus on raising salaries for underpaid female-dominated classes.'
      },
      {
        title: 'My jurisdiction fails the Salary Range Test',
        content: 'This means it takes significantly longer for one gender to reach maximum salary. Review your step progression systems. Ensure female and male-dominated classes have similar advancement timelines.'
      },
      {
        title: 'My jurisdiction fails the Exceptional Service Pay Test',
        content: 'This indicates opportunities for extra pay (longevity, certifications, etc.) aren\'t distributed equitably. Either expand ESP opportunities to female-dominated classes or reduce them for male-dominated classes to achieve balance.'
      },
      {
        title: 'I don\'t have enough male-dominated classes',
        content: 'If you have 3 or fewer male-dominated classes, you cannot use the standard statistical tests. Contact MMB for guidance on alternative analysis methods.'
      },
      {
        title: 'I found errors after submitting',
        content: 'Contact MMB immediately at payequity.mmb@state.mn.us to discuss submitting a corrected report. Don\'t wait until next year to fix significant errors.'
      },
      {
        title: 'I can\'t afford to fix all issues immediately',
        content: 'Submit an implementation plan showing how you\'ll achieve compliance over multiple years. Be realistic but show good faith effort. Budget for equity adjustments in your next fiscal cycle.'
      }
    ]
  },
  {
    id: 'data-maintenance',
    title: 'Annual Data Maintenance Best Practices',
    icon: CheckCircle,
    content: 'Maintaining accurate, up-to-date pay equity data is crucial for efficient reporting and compliance. Following these best practices will save time and ensure data quality year after year.',
    subsections: [
      {
        title: 'Best Practice Tip: Refresh Your Data Every Year',
        content: 'Even if you are not required to file a pay equity report in a given year, you should still refresh your data annually. This practice ensures:\n\n• Your job classifications remain current and accurate\n• Salary information reflects actual compensation\n• You can quickly respond if reporting requirements change\n• Historical data is preserved for trend analysis\n• Data quality issues are caught early, not at deadline time\n• Staff turnover doesn\'t result in lost institutional knowledge\n\nThink of annual data maintenance as preventive care for your pay equity program.'
      },
      {
        title: 'When to Update Your Data',
        content: 'Establish a regular schedule for updating pay equity data:\n\n• Annually at year-end: Gather current year-end data even if not filing\n• After union negotiations: Update salary ranges when new contracts are ratified\n• When positions change: Update job evaluations when duties significantly change\n• After organizational restructuring: Review and update all affected classifications\n• During budget cycles: Align pay equity reviews with budget planning\n• Quarterly reviews: Check for new positions, retirements, or major changes\n\nSet calendar reminders to ensure data maintenance doesn\'t get overlooked.'
      },
      {
        title: 'Maintaining Job Classification Data',
        content: 'Keep your job classifications current and accurate:\n\n• Review all job descriptions annually for accuracy\n• Update classifications when duties or responsibilities change significantly\n• Re-evaluate points if job requirements have evolved\n• Document reasons for any classification or point changes\n• Maintain consistency in evaluation methodology across years\n• Archive old job descriptions when positions are eliminated\n• Create new classifications promptly when new positions are added\n• Ensure gender composition is updated as employees change positions\n\nAccurate job classifications are the foundation of pay equity compliance.'
      },
      {
        title: 'When to Update Salary Information',
        content: 'Salary data should be refreshed in these situations:\n\n• Annually: Update all salary ranges at year-end (typically December 31st)\n• After cost-of-living adjustments (COLA): Update minimum and maximum salaries\n• When union contracts are ratified: Update affected classifications immediately\n• After pay equity adjustments: Document implemented salary increases\n• When pay scales change: Update ranges for all affected job classes\n• After promotions or reclassifications: Ensure proper salary placement\n• Following budget approvals: Update ranges approved in new fiscal year\n\nKeeping salary data current ensures compliance testing reflects reality.'
      },
      {
        title: 'Annual Data Audit Recommendations',
        content: 'Conduct an annual data audit even when not filing a report:\n\n• Verify all employee counts are accurate by job classification\n• Confirm gender composition calculations are correct\n• Check that salary ranges match current pay scales and contracts\n• Review point values for consistency and accuracy\n• Identify any new positions that need evaluation\n• Remove eliminated positions from your active classifications\n• Verify exceptional service pay categories are current\n• Confirm total payroll calculations are accurate\n• Review prior year notes for follow-up items\n• Test data import/export processes work correctly\n\nThis annual audit takes 2-4 hours but prevents major issues when reporting deadlines approach.'
      },
      {
        title: 'Preserving Institutional Knowledge',
        content: 'Protect your organization from knowledge loss:\n\n• Document your job evaluation methodology in writing\n• Keep detailed notes explaining point assignments and rationale\n• Maintain a procedures manual for your pay equity process\n• Cross-train multiple staff members on the reporting process\n• Store all documentation in a central, accessible location\n• Archive all historical reports and supporting documentation\n• Document contacts and resources (MMB staff, consultants, etc.)\n• Create a timeline of key dates and requirements\n• Keep login credentials secure but accessible to authorized backup staff\n\nStaff turnover should not disrupt your pay equity program.'
      },
      {
        title: 'Using This System for Year-Round Maintenance',
        content: 'This pay equity system is available year-round for data maintenance:\n\n• Keep reports in "Private" draft status for ongoing updates\n• Copy last year\'s jobs and update current data\n• Run compliance tests periodically to spot emerging issues\n• Use the Gap Analysis tool to monitor equity trends\n• Track salary adjustment implementation progress\n• Store notes and documentation within report notes\n• Export updated reports for internal budget discussions\n• Generate compliance certificates for internal records\n\nDon\'t wait until January to discover problems that could have been addressed months earlier.'
      },
      {
        title: 'Benefits of Proactive Maintenance',
        content: 'Organizations that maintain data year-round experience:\n\n• Faster report preparation (days instead of weeks)\n• Higher data accuracy and fewer errors\n• Earlier identification of compliance issues\n• More time to plan and budget for equity adjustments\n• Reduced stress during reporting season\n• Better understanding of pay equity trends over time\n• Easier transition when staff members leave or change roles\n• More confidence in compliance testing results\n• Improved relationships with MMB reviewers\n\nThe small investment in ongoing maintenance pays significant dividends.'
      }
    ]
  },
  {
    id: 'contact',
    title: 'Getting Help & Contact Information',
    icon: Phone,
    content: 'MMB Pay Equity Unit staff are available to assist with questions and provide technical guidance.',
    subsections: [
      {
        title: 'Contact the MMB Pay Equity Unit',
        content: 'For questions about pay equity reporting, compliance issues, or technical guidance:\n\nEmail: payequity.mmb@state.mn.us\nPhone: 651-259-3824\n\nOffice Hours: Monday-Friday, 8:00 AM - 4:30 PM Central Time'
      },
      {
        title: 'What MMB Can Help With',
        content: '• Interpretation of compliance test results\n• Guidance on implementation plans\n• Questions about job evaluation\n• Technical issues with reporting\n• Deadline extensions (in rare cases)\n• General pay equity law questions'
      },
      {
        title: 'What to Prepare Before Calling',
        content: '• Your jurisdiction name and ID\n• Report year in question\n• Specific question or issue\n• Any error messages or test results\n• Relevant job classification details'
      }
    ],
    links: [
      { text: 'MMB Pay Equity Website', url: 'https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/' },
      { text: 'Email MMB Pay Equity Unit', url: 'mailto:payequity.mmb@state.mn.us' }
    ]
  }
];

export function ComprehensiveHelpGuide({ onClose }: ComprehensiveHelpGuideProps) {
  const [selectedSection, setSelectedSection] = useState<string>(helpSections[0].id);

  const currentSection = helpSections.find(s => s.id === selectedSection);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#003865] to-[#004d7a] rounded-lg flex items-center justify-center">
                <Book className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Comprehensive Help Guide</h2>
                <p className="text-sm text-gray-600">Complete guide to Minnesota pay equity reporting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-gray-200 overflow-y-auto bg-gray-50">
            <nav className="p-4 space-y-1">
              {helpSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedSection === section.id
                        ? 'bg-[#003865] text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {currentSection && (
              <div className="max-w-3xl">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{currentSection.title}</h2>
                  <p className="text-gray-700 leading-relaxed">{currentSection.content}</p>
                </div>

                {currentSection.subsections && (
                  <div className="space-y-6">
                    {currentSection.subsections.map((subsection, idx) => (
                      <div key={idx} className="border-l-4 border-[#78BE21] pl-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{subsection.title}</h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{subsection.content}</p>
                        {subsection.links && subsection.links.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {subsection.links.map((link, linkIdx) => (
                              <a
                                key={linkIdx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium text-sm"
                              >
                                <ExternalLink className="w-4 h-4" />
                                {link.text}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSection.links && currentSection.links.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Related Resources
                    </h4>
                    <div className="space-y-2">
                      {currentSection.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-700 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          {link.text}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSection === 'getting-started' && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-[#003865] to-[#004d7a] text-white rounded-lg">
                    <h3 className="text-xl font-bold mb-3">Quick Start</h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Review official documents (especially submission instructions)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Start gathering employee data early</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Evaluate all jobs using State Job Match system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        <span>Enter data into this system carefully</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">5.</span>
                        <span>Run compliance tests and analyze results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">6.</span>
                        <span>Address any compliance issues</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">7.</span>
                        <span>Run pre-submission checker</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">8.</span>
                        <span>Submit by January 31st</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <a
                href="mailto:payequity.mmb@state.mn.us"
                className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium"
              >
                <Mail className="w-4 h-4" />
                payequity.mmb@state.mn.us
              </a>
              <a
                href="tel:651-259-3824"
                className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] font-medium"
              >
                <Phone className="w-4 h-4" />
                651-259-3824
              </a>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              Close Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
