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
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <button
        onClick={onEnterJobs}
        disabled={!hasJurisdiction}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
      >
        <FileText size={18} />
        Enter Jobs / View Reports
      </button>
    </div>
  );
}
