import { AlertCircle, CheckCircle, X } from 'lucide-react';

type NotificationModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
};

export function NotificationModal({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const config = {
    info: {
      icon: AlertCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-800',
      buttonColor: 'bg-[#003865] hover:bg-[#004d7a]',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
      titleColor: 'text-green-900',
      messageColor: 'text-green-800',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-[#A6192E]',
      iconBg: 'bg-red-100',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800',
      buttonColor: 'bg-[#A6192E] hover:bg-[#8A1526]',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${currentConfig.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${currentConfig.iconColor}`} />
            </div>
            <div className="flex-1">
              {title && (
                <h3 className={`text-lg font-semibold ${currentConfig.titleColor} mb-2`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm ${currentConfig.messageColor}`}>
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className={`w-full px-4 py-2 ${currentConfig.buttonColor} text-white rounded-lg transition-colors font-medium`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
