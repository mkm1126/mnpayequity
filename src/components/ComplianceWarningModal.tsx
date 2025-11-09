import { AlertTriangle, XCircle, TrendingUp, HelpCircle, Calculator, Phone, Mail } from 'lucide-react';
import { ComplianceResult } from '../lib/complianceAnalysis';

type ComplianceWarningModalProps = {
  isOpen: boolean;
  complianceResult: ComplianceResult;
  onClose: () => void;
  onContinueSubmit: () => void;
  onNavigateToWhatIf: () => void;
  onNavigateToTroubleshooting: () => void;
};

export function ComplianceWarningModal({
  isOpen,
  complianceResult,
  onClose,
  onContinueSubmit,
  onNavigateToWhatIf,
  onNavigateToTroubleshooting,
}: ComplianceWarningModalProps) {
  if (!isOpen) return null;

  const failedTests = [];

  if (complianceResult.statisticalTest && complianceResult.statisticalTest.underpaymentRatio > 80) {
    failedTests.push({
      name: 'Statistical Analysis Test',
      issue: `${complianceResult.statisticalTest.underpaymentRatio.toFixed(1)}% of underpayment concentrated in female-dominated classes`,
      threshold: 'Must be 80% or less',
    });
  }

  if (complianceResult.salaryRangeTest && !complianceResult.salaryRangeTest.passed) {
    failedTests.push({
      name: 'Salary Range Test',
      issue: `${complianceResult.salaryRangeTest.failingClasses} job class(es) failing`,
      threshold: 'All female-dominated classes must meet minimum salary requirements',
    });
  }

  if (complianceResult.exceptionalServiceTest && !complianceResult.exceptionalServiceTest.passed) {
    failedTests.push({
      name: 'Exceptional Service Pay Test',
      issue: `${complianceResult.exceptionalServiceTest.failingClasses} job class(es) failing`,
      threshold: 'Maximum salary must not exceed minimum by more than permitted ratio',
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Compliance Warning</h2>
                <p className="text-sm text-gray-600 mt-1">Your report is currently failing compliance</p>
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

        <div className="p-6 space-y-6">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  You are about to submit a Pay Equity Report that is failing compliance
                </h3>
                <p className="text-red-800 text-sm">
                  Your jurisdiction has not passed all required pay equity tests. Review the failed tests below
                  and consider making corrections before submission.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Failed Compliance Tests
            </h3>

            <div className="space-y-3">
              {failedTests.map((test, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-1">{test.name}</div>
                  <div className="text-sm text-red-700 mb-1">
                    <span className="font-medium">Issue:</span> {test.issue}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Required:</span> {test.threshold}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-2">What This Means</h3>
            <p className="text-amber-800 text-sm mb-3">
              Your jurisdiction is currently out of compliance with Minnesota's Local Government Pay Equity Act.
              You can still submit this report, but you must include an Implementation Plan detailing how and
              when you will achieve compliance.
            </p>
            <p className="text-amber-800 text-sm">
              Alternatively, you can make salary adjustments now to achieve immediate compliance, which may
              be easier than managing a multi-year implementation plan.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              How to Get in Compliance
            </h3>

            <div className="space-y-3">
              <button
                onClick={onNavigateToWhatIf}
                className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">Use the What-If Calculator</div>
                    <div className="text-sm text-blue-800">
                      Model salary adjustments to see what changes would bring you into compliance.
                      This tool helps you explore different scenarios and their costs.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={onNavigateToTroubleshooting}
                className="w-full bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900 mb-1">View Troubleshooting Guide</div>
                    <div className="text-sm text-green-800">
                      Get detailed recommendations for addressing each type of compliance failure.
                      Learn specific strategies for your situation.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-blue-800 text-sm mb-3">
              The Minnesota Management & Budget Pay Equity Unit is available to assist you with achieving compliance.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Mail className="w-4 h-4" />
                <a href="mailto:payequity@state.mn.us" className="underline hover:text-blue-900">
                  payequity@state.mn.us
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Phone className="w-4 h-4" />
                <span>(651) 201-8000</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">If You Continue with Submission</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>You must complete and submit an Implementation Plan</li>
              <li>The plan must show how you will achieve compliance over time</li>
              <li>You will need to demonstrate good faith effort toward compliance</li>
              <li>Budget for equity adjustments in your next fiscal cycle</li>
              <li>Annual progress reports may be required</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Review and Fix Issues
            </button>
            <button
              onClick={onContinueSubmit}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Continue with Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
