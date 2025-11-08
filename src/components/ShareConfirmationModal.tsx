import { Share2, Lock, AlertCircle } from 'lucide-react';

type ShareConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStatus: 'Private' | 'Shared';
};

export function ShareConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
}: ShareConfirmationModalProps) {
  if (!isOpen) return null;

  const isSharing = currentStatus === 'Private';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
        <div className={`px-6 py-5 ${isSharing ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              {isSharing ? (
                <Share2 className="w-6 h-6 text-yellow-600" />
              ) : (
                <Lock className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isSharing ? 'Share Report' : 'Make Report Private'}
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-[#003865] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium mb-2">
                {isSharing
                  ? 'Share this report with State Pay Equity Coordinators?'
                  : 'Change this report back to Private?'
                }
              </p>
              <p className="text-gray-600 text-sm">
                {isSharing
                  ? 'State coordinators will be able to view all job classifications and report data.'
                  : 'Only your jurisdiction will be able to view the report data.'}
              </p>
            </div>
          </div>

          <div className={`mt-4 px-4 py-3 rounded-lg ${isSharing ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isSharing ? 'After Sharing:' : 'After Making Private:'}
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              {isSharing ? (
                <>
                  <li>• State coordinators can view the report</li>
                  <li>• Report data becomes visible to MMB staff</li>
                  <li>• You can revert to Private at any time</li>
                </>
              ) : (
                <>
                  <li>• Report becomes visible only to you</li>
                  <li>• State coordinators will no longer see it</li>
                  <li>• You can share again at any time</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 font-medium rounded-lg transition-colors shadow-sm ${
              isSharing
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
                : 'bg-gradient-to-r from-[#003865] to-[#004a7f] text-white hover:from-[#004a7f] hover:to-[#005a94]'
            }`}
            type="button"
          >
            {isSharing ? 'Share Report' : 'Make Private'}
          </button>
        </div>
      </div>
    </div>
  );
}
