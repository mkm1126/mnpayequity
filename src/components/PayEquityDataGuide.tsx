import { BookOpen, Calculator, Users, DollarSign, Award, Clock, FileSpreadsheet } from 'lucide-react';

type PayEquityDataGuideProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PayEquityDataGuide({ isOpen, onClose }: PayEquityDataGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-[#003865]" />
              <h2 className="text-2xl font-bold text-gray-900">Pay Equity Data Entry Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">About This Spreadsheet</h3>
            <p className="text-sm text-blue-800">
              Use the Excel template to organize your jurisdiction's job data for pay equity reporting. Each row represents one job classification, and each column contains specific information about that job.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Title</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The official title of the job classification as used by your jurisdiction.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Required field - cannot be empty</li>
                    <li>• Text format</li>
                    <li>• Use consistent naming conventions</li>
                    <li>• Examples: Administrative Assistant, Police Officer, Public Works Director</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Points</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The total points assigned to this job based on your jurisdiction's job evaluation system (measuring skill, effort, responsibility, and working conditions).
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Required field</li>
                    <li>• Whole number (integer)</li>
                    <li>• Must be greater than 0</li>
                    <li>• Typical range: 100-1000+ points depending on system</li>
                    <li>• Must match your approved job evaluation system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Males and Females</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The number of male and female employees in this job classification. Only count employees who meet minimum work requirements (67+ days/year and 14+ hours/week).
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                  <ul className="text-gray-700 space-y-1 mb-3">
                    <li>• Required fields</li>
                    <li>• Whole numbers (integers)</li>
                    <li>• Must be 0 or greater</li>
                    <li>• Both cannot be 0 (at least one employee required)</li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                    <p className="font-medium text-amber-900 mb-1">Gender Classification:</p>
                    <p className="text-amber-800 text-sm">
                      • Male-dominated: 70% or more male<br/>
                      • Female-dominated: 70% or more female<br/>
                      • Balanced: Neither gender is 70% or more
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Min Salary and Max Salary</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The lowest and highest monthly salary amounts for this job classification.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Required fields</li>
                      <li>• Numbers (can include decimals)</li>
                      <li>• Must be monthly amounts (not annual)</li>
                      <li>• Max salary must be greater than or equal to min salary</li>
                      <li>• For hourly employees: Convert to monthly using (Hourly Rate × Hours/Week × 52) ÷ 12</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-2 rounded mt-2">
                    <p className="font-medium text-blue-900 text-xs">Example:</p>
                    <p className="text-blue-800 text-xs">$20/hour × 40 hrs/week × 52 weeks = $41,600/year ÷ 12 = $3,467/month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Years to Max</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The number of years it takes an employee to progress from minimum to maximum salary through normal step increases.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Required field</li>
                    <li>• Number (can include decimals like 7.5)</li>
                    <li>• Must be 0 or greater</li>
                    <li>• Enter 0 if no step system exists</li>
                    <li>• Example: 10 annual steps = 10 years; 6 biennial steps = 12 years</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Years Service Pay</h3>
                <p className="text-gray-700 text-sm mb-3">
                  The number of years of service required to receive longevity or service-based pay increases beyond the regular salary range.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Optional field</li>
                    <li>• Number (can include decimals)</li>
                    <li>• Must be 0 or greater</li>
                    <li>• Enter 0 if no longevity pay exists</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Exceptional Service</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Category indicator for exceptional service pay (ESP) - additional compensation beyond regular salary for special circumstances.
                </p>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium text-gray-900 mb-1">Data Rules:</p>
                  <ul className="text-gray-700 space-y-1 mb-2">
                    <li>• Optional field</li>
                    <li>• Text format (typically a single letter or short code)</li>
                    <li>• Leave blank if no ESP applies</li>
                  </ul>
                  <p className="font-medium text-gray-900 mb-1">Common Categories:</p>
                  <ul className="text-gray-700 space-y-1">
                    <li>• A: Longevity Pay</li>
                    <li>• B: Certification/License Pay</li>
                    <li>• C: Shift Differential</li>
                    <li>• D: Bilingual Pay</li>
                    <li>• E: Education Pay</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3">Tips for Accurate Data Entry</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Verify all salary amounts are monthly, not annual</li>
              <li>✓ Ensure employee counts include only eligible employees (67+ days/year and 14+ hours/week)</li>
              <li>✓ Use consistent job evaluation points from your approved system</li>
              <li>✓ Double-check that max salary is greater than or equal to min salary</li>
              <li>✓ Review each row for accuracy before uploading</li>
              <li>✓ Keep the tab name matching your filename for easy import</li>
              <li>✓ Do not modify column headers - they must match exactly</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">Common Mistakes to Avoid</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>✗ Using annual salary instead of monthly</li>
              <li>✗ Including employees who don't meet minimum work requirements</li>
              <li>✗ Leaving required fields empty</li>
              <li>✗ Entering text in number fields</li>
              <li>✗ Having max salary lower than min salary</li>
              <li>✗ Modifying or deleting column headers</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
