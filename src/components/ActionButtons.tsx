import { FileText } from 'lucide-react';

interface ActionButtonsProps {
  onEnterJobs: () => void;
  hasJurisdiction: boolean;
}

export function ActionButtons({
  onEnterJobs,
  hasJurisdiction,
}: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={onEnterJobs}
        disabled={!hasJurisdiction}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
      >
        <FileText size={24} />
        Enter Jobs / View Reports
      </button>
    </div>
  );
}
