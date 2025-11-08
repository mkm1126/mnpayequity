import { useState } from 'react';
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
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: {
      container: 'w-14 h-7',
      slider: 'w-5 h-5',
      icon: 'w-3 h-3',
      translate: 'translate-x-7'
    },
    md: {
      container: 'w-16 h-8',
      slider: 'w-6 h-6',
      icon: 'w-3.5 h-3.5',
      translate: 'translate-x-8'
    },
    lg: {
      container: 'w-20 h-10',
      slider: 'w-8 h-8',
      icon: 'w-4 h-4',
      translate: 'translate-x-10'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="relative inline-block">
      <button
        onClick={onToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
        className={`
          relative ${classes.container} rounded-full transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isShared
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }
        `}
        type="button"
        aria-label={isShared ? 'Change to Private' : 'Share Report'}
      >
        <span
          className={`
            absolute left-1 top-1 ${classes.slider} rounded-full bg-white shadow-md
            transition-transform duration-300 ease-in-out flex items-center justify-center
            ${isShared ? classes.translate : 'translate-x-0'}
          `}
        >
          {isShared ? (
            <Share2 className={`${classes.icon} text-yellow-600`} />
          ) : (
            <Lock className={`${classes.icon} text-gray-600`} />
          )}
        </span>
      </button>

      {showTooltip && (
        <div
          className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none"
          style={{ minWidth: '200px' }}
        >
          <div className="font-semibold mb-1">
            {isShared ? 'Shared with State' : 'Private (MMB Only)'}
          </div>
          <div className="text-xs text-gray-300">
            {isShared
              ? 'State Pay Equity Coordinators can view this report. Click to make private.'
              : 'Only your jurisdiction can view this report. Click to share with State coordinators.'
            }
          </div>
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #111827'
            }}
          />
        </div>
      )}
    </div>
  );
}
