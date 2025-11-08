import { Lock, Share2 } from 'lucide-react';

type InlineStatusToggleProps = {
  isShared: boolean;
  onToggle: () => void;
};

export function InlineStatusToggle({ isShared, onToggle }: InlineStatusToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Private</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isShared
            ? 'bg-green-500 focus:ring-green-500'
            : 'bg-gray-300 focus:ring-gray-400'
        }`}
        type="button"
        aria-checked={isShared}
        role="switch"
      >
        <span
          className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            isShared ? 'translate-x-[2rem]' : 'translate-x-0.5'
          }`}
        >
          {isShared ? (
            <Share2 size={12} className="text-green-600" />
          ) : (
            <Lock size={12} className="text-gray-600" />
          )}
        </span>
      </button>
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Shared</span>
    </div>
  );
}
