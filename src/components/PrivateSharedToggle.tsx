import { useState, useRef } from 'react';
import { Lock, Share2, HelpCircle } from 'lucide-react';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<number>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  const sizeConfig = {
    sm: {
      container: 'h-6 w-12',
      slider: 'h-5 w-5',
      translate: 'translate-x-6',
      icon: 11,
      label: 'text-xs',
      gap: 'gap-2',
      helpIcon: 14
    },
    md: {
      container: 'h-7 w-14',
      slider: 'h-6 w-6',
      translate: 'translate-x-[2rem]',
      icon: 12,
      label: 'text-xs',
      gap: 'gap-3',
      helpIcon: 16
    },
    lg: {
      container: 'h-8 w-16',
      slider: 'h-7 w-7',
      translate: 'translate-x-[2.25rem]',
      icon: 14,
      label: 'text-sm',
      gap: 'gap-3',
      helpIcon: 18
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center ${config.gap} relative`}>
      <span className={`${config.label} font-medium text-gray-600 whitespace-nowrap`}>Private</span>
      <button
        ref={buttonRef}
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
      <button
        ref={helpRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-[#78BE21] hover:text-[#5a8f19] transition-colors focus:outline-none"
        type="button"
        aria-label="Help"
      >
        <HelpCircle size={config.helpIcon} />
      </button>

      {showTooltip && (
        <div
          className="fixed z-[9999] w-72 p-3 bg-white rounded-lg shadow-2xl border-2 border-gray-300 pointer-events-auto"
          style={{
            left: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().left - 110}px` : '0',
            top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().bottom + 8}px` : '0',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              {isShared ? 'Shared with State' : 'Private'}
            </p>
            <p className="text-xs text-gray-600">
              {isShared
                ? 'State Pay Equity Coordinators can view this report. Click to make private.'
                : 'Only your jurisdiction can view this report. Click to share with State coordinators.'
              }
            </p>
          </div>
          <div
            className="absolute w-0 h-0 border-8 border-transparent border-b-gray-300"
            style={{
              left: '50%',
              top: '-16px',
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>
      )}
    </div>
  );
}
