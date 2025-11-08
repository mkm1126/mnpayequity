import { Lock, Share2 } from 'lucide-react';

type PrivateSharedToggleProps = {
  isShared: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function PrivateSharedToggle({
  isShared,
  onToggle,
  disabled = false,
  size = 'md'
}: PrivateSharedToggleProps) {
  const sizeConfig = {
    sm: {
      container: 'h-6 w-12',
      slider: 'h-5 w-5',
      translate: 'translate-x-6',
      icon: 11,
      label: 'text-xs',
      gap: 'gap-2'
    },
    md: {
      container: 'h-7 w-14',
      slider: 'h-6 w-6',
      translate: 'translate-x-[2rem]',
      icon: 12,
      label: 'text-xs',
      gap: 'gap-3'
    },
    lg: {
      container: 'h-8 w-16',
      slider: 'h-7 w-7',
      translate: 'translate-x-[2.25rem]',
      icon: 14,
      label: 'text-sm',
      gap: 'gap-3'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.gap}`}>
      <span className={`${config.label} font-medium text-gray-600 whitespace-nowrap`}>Private</span>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex items-center ${config.container} rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isShared
            ? 'bg-green-500 focus:ring-green-500'
            : 'bg-gray-300 focus:ring-gray-400'
        }`}
        type="button"
        aria-checked={isShared}
        role="switch"
        aria-label={isShared ? 'Change to Private' : 'Share Report'}
      >
        <span
          className={`inline-flex items-center justify-center ${config.slider} transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
            isShared ? config.translate : 'translate-x-0.5'
          }`}
        >
          {isShared ? (
            <Share2 size={config.icon} className="text-green-600" />
          ) : (
            <Lock size={config.icon} className="text-gray-600" />
          )}
        </span>
      </button>
      <span className={`${config.label} font-medium text-gray-600 whitespace-nowrap`}>Shared</span>
    </div>
  );
}
