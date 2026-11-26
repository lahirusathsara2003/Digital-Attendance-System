import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  const configs = {
    success: {
      bg: 'bg-white border-green-200 text-green-900 shadow-xl shadow-green-500/10',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />,
    },
    error: {
      bg: 'bg-white border-red-200 text-red-900 shadow-xl shadow-red-500/10',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    info: {
      bg: 'bg-white border-blue-200 text-blue-900 shadow-xl shadow-blue-500/10',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const config = configs[type] || configs.info;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-2 ${config.bg}`}
    >
      <div className="flex items-center space-x-3 pr-2">
        {config.icon}
        <span className="text-sm font-semibold leading-relaxed">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
