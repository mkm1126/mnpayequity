import { Lock, Share2 } from 'lucide-react';

type InlineStatusToggleProps = {
  isShared: boolean;
  onToggle: () => void;
};

export function InlineStatusToggle({ isShared, onToggle }: InlineStatusToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex items-center rounded-full transition-colors cursor-pointer group border-2 border-gray-300 hover:border-gray-400"
      type="button"
    >
      <div className={`flex items-center transition-all duration-300 ${isShared ? 'bg-yellow-500' : 'bg-gray-500'} rounded-full`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 transition-opacity duration-300 ${!isShared ? 'opacity-100' : 'opacity-40'}`}>
          <Lock size={14} className="text-white" />
          <span className="text-xs font-medium text-white whitespace-nowrap">Private</span>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 transition-opacity duration-300 ${isShared ? 'opacity-100' : 'opacity-40'}`}>
          <Share2 size={14} className="text-white" />
          <span className="text-xs font-medium text-white whitespace-nowrap">Shared</span>
        </div>
      </div>

      <div className={`absolute top-0 bottom-0 w-[50%] bg-white rounded-full shadow-md transition-all duration-300 pointer-events-none border border-gray-300 ${
        isShared ? 'left-[50%]' : 'left-0'
      }`} />
    </button>
  );
}
