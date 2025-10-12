
import React from 'react';
import { SeverityLevel } from '../types';

interface SeverityIndicatorProps {
  level: SeverityLevel;
}

const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({ level }) => {
  const severityStyles = {
    [SeverityLevel.Healthy]: { text: 'Healthy', color: 'bg-green-500', textColor: 'text-green-800 dark:text-green-200', bgColor: 'bg-green-100 dark:bg-green-900' },
    [SeverityLevel.Mild]: { text: 'Mild', color: 'bg-yellow-400', textColor: 'text-yellow-800 dark:text-yellow-200', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
    [SeverityLevel.Moderate]: { text: 'Moderate', color: 'bg-orange-500', textColor: 'text-orange-800 dark:text-orange-200', bgColor: 'bg-orange-100 dark:bg-orange-900' },
    [SeverityLevel.Severe]: { text: 'Severe', color: 'bg-red-600', textColor: 'text-red-800 dark:text-red-200', bgColor: 'bg-red-100 dark:bg-red-900' },
    [SeverityLevel.Unknown]: { text: 'Unknown', color: 'bg-gray-400', textColor: 'text-gray-800 dark:text-gray-200', bgColor: 'bg-gray-100 dark:bg-gray-900' },
  };

  const { text, color, textColor, bgColor } = severityStyles[level];
  const percentage = {
    [SeverityLevel.Healthy]: 'w-0',
    [SeverityLevel.Mild]: 'w-1/3',
    [SeverityLevel.Moderate]: 'w-2/3',
    [SeverityLevel.Severe]: 'w-full',
    [SeverityLevel.Unknown]: 'w-0'
  }[level];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
         <span className="font-semibold text-gray-700 dark:text-gray-300">Severity</span>
         <span className={`font-bold px-2 py-0.5 rounded-md ${textColor} ${bgColor}`}>{text}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} ${percentage} transition-all duration-500`}></div>
      </div>
    </div>
  );
};

export default SeverityIndicator;
