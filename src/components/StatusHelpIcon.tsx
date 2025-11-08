import { useState } from 'react';

export function StatusHelpIcon() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#78BE20] text-white hover:bg-[#6ba91c] transition-colors cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
      >
        <span className="text-xs font-bold">?</span>
      </button>

      {showTooltip && (
        <div
          className="absolute left-0 top-full mt-2 z-50 w-80 p-4 bg-white rounded-lg shadow-xl border-2 border-[#78BE20]"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-[#003865] text-sm">Report Status Guide</h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-20 flex-shrink-0 mt-0.5">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium text-[10px]">Private</span>
                </div>
                <p className="text-gray-600">Only your jurisdiction can view this report.</p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-20 flex-shrink-0 mt-0.5">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium text-[10px]">Shared</span>
                </div>
                <p className="text-gray-600">State coordinators can view this report for assistance.</p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-20 flex-shrink-0 mt-0.5">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium text-[10px]">Submitted</span>
                </div>
                <p className="text-gray-600">Report has been officially submitted to MMB.</p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-20 flex-shrink-0 mt-0.5">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium text-[10px]">In Compliance</span>
                </div>
                <p className="text-gray-600">Report meets all pay equity requirements.</p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-20 flex-shrink-0 mt-0.5">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium text-[10px]">Out of Compliance</span>
                </div>
                <p className="text-gray-600">Requires implementation plan to achieve compliance.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 italic">
                Click the slider to toggle between Private and Shared for draft reports.
              </p>
            </div>
          </div>

          <div className="absolute left-3 bottom-full mb-[-2px] w-0 h-0 border-8 border-transparent border-b-[#78BE20]"></div>
        </div>
      )}
    </div>
  );
}
