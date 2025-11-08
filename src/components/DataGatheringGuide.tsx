import { useState } from 'react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { ArrowLeft, Download, CheckSquare, Square, FileText, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';

type DataGatheringGuideProps = {
  onBack: () => void;
};

type ChecklistItem = {
  category: string;
  items: string[];
};

const checklistData: ChecklistItem[] = [
  {
    category: 'Employee Information',
    items: [
      'Complete list of all job classifications',
      'Number of male employees in each job class',
      'Number of female employees in each job class',
      'Number of non-binary employees in each job class',
      'Employee eligibility verification (67+ days/year and 14+ hours/week)',
    ],
  },
  {
    category: 'Salary and Compensation Data',
    items: [
      'Minimum salary/wage for each job class',
      'Maximum salary/wage for each job class',
      'Number of years or steps to reach maximum salary',
      'Any exceptional service pay categories and amounts',
      'Additional cash compensation (overtime, stipends, etc.)',
      'Total annual payroll for the previous calendar year',
    ],
  },
  {
    category: 'Job Evaluation Points',
    items: [
      'Job evaluation system documentation',
      'Point values for each job classification',
      'Skill requirements assessment',
      'Effort requirements assessment',
      'Responsibility requirements assessment',
      'Working conditions assessment',
    ],
  },
  {
    category: 'Benefits Information',
    items: [
      'Health insurance benefits by job class',
      'Dental insurance benefits by job class',
      'Life insurance benefits by job class',
      'Retirement/pension contributions by job class',
      'Other benefits (vision, disability, etc.)',
      'Cash value of benefits if included in salary calculations',
    ],
  },
  {
    category: 'Administrative Information',
    items: [
      'Name of governing body that will approve the report',
      'Name and title of chief elected official',
      'Location where official notice will be posted',
      'Previous year report data (if copying jobs)',
      'Contact information for responsible staff',
    ],
  },
];

export function DataGatheringGuide({ onBack }: DataGatheringGuideProps) {
  useScrollToTop();

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (item: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(item)) {
      newChecked.delete(item);
    } else {
      newChecked.add(item);
    }
    setCheckedItems(newChecked);
  };

  const totalItems = checklistData.reduce((sum, cat) => sum + cat.items.length, 0);
  const completionPercentage = Math.round((checkedItems.size / totalItems) * 100);

  const downloadWorksheet = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pay Equity Data Gathering Worksheet', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Use this checklist to gather all required information before starting your report.', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    checklistData.forEach((category) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(category.category, 15, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      category.items.forEach((item) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.rect(18, yPos - 3, 3, 3);
        doc.text(item, 25, yPos);
        yPos += 6;
      });

      yPos += 5;
    });

    doc.save('Pay_Equity_Data_Gathering_Worksheet.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={downloadWorksheet}
          className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Worksheet
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Gathering Guide</h1>
          <p className="text-gray-600">
            Before you begin your pay equity report, gather all the necessary information using this comprehensive checklist.
          </p>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Progress Tracker</h3>
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-blue-800 mb-1">
                  <span>Completion: {checkedItems.size} of {totalItems} items</span>
                  <span className="font-semibold">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-blue-700">
                Check off items as you gather them to track your progress.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {checklistData.map((category, catIndex) => (
            <div key={catIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
              </div>
              <div className="p-6 space-y-3">
                {category.items.map((item, itemIndex) => (
                  <label
                    key={itemIndex}
                    className="flex items-start gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {checkedItems.has(item) ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </button>
                    <span
                      className={`text-sm ${
                        checkedItems.has(item)
                          ? 'text-gray-500 line-through'
                          : 'text-gray-700'
                      }`}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-900 mb-3">Important Employee Eligibility Criteria</h3>
          <div className="space-y-2 text-sm text-amber-800">
            <p>
              <strong>Regular Employees:</strong> Must work at least 67 days per year AND at least 14 hours per week on average
            </p>
            <p>
              <strong>Student Employees:</strong> Must work at least 100 days per year AND at least 14 hours per week on average
            </p>
            <p className="mt-3 pt-3 border-t border-amber-300">
              Only include employees who meet these minimum requirements in your job classifications.
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-green-900 text-lg mb-1">Best Practice Tip: Annual Data Maintenance</h3>
              <p className="text-green-800 font-semibold text-sm">Refresh your data every year, even if you don't need to file a report</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-green-900 bg-white bg-opacity-60 rounded-lg p-4">
            <div>
              <h4 className="font-semibold mb-2">Why maintain data annually?</h4>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Job classifications and salary information remain current and accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>You can quickly respond if reporting requirements change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Data quality issues are caught early, not at deadline time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Staff turnover doesn't result in lost institutional knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Historical data is preserved for trend analysis and planning</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-green-200">
              <h4 className="font-semibold mb-2">When to update your data:</h4>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Annually in November/December:</strong> Gather year-end data even if not filing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>After union negotiations:</strong> Update salary ranges when contracts are ratified</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>When positions change:</strong> Update job evaluations when duties significantly change</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>During budget cycles:</strong> Align pay equity reviews with budget planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span><strong>Quarterly reviews:</strong> Check for new positions, retirements, or major changes</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-green-200">
              <h4 className="font-semibold mb-2">Annual audit recommendations:</h4>
              <ul className="space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Verify all employee counts and gender composition are accurate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Confirm salary ranges match current pay scales and contracts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Review point values for consistency across all classifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Identify new positions that need evaluation and remove eliminated ones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Run compliance tests periodically to spot emerging issues early</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-xs text-green-900 italic">
                <strong>Pro Tip:</strong> This system is available year-round for data maintenance. Keep reports in "Private" draft status for ongoing updates, and run compliance tests periodically. The small investment in ongoing maintenance pays significant dividends when reporting season arrives.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Additional Resources</h3>
          <div className="space-y-2">
            <a
              href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Minnesota Management & Budget Pay Equity Information</span>
            </a>
            <a
              href="https://mn.gov/mmb/employee-relations/labor-relations/pay-equity/local-government/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Local Government Pay Equity Act Guidelines</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
