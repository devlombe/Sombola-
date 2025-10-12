
import React from 'react';
import type { PredictionResult } from '../types';

interface RecentAnalysisCardProps {
  prediction: PredictionResult;
  onClick: () => void;
}

const RecentAnalysisCard: React.FC<RecentAnalysisCardProps> = ({ prediction, onClick }) => {
  const { imagePath, diseaseInfo, timestamp, isHealthy } = prediction;
  const date = new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <button onClick={onClick} className="w-full flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <img src={imagePath} alt="Analyzed plant" className="w-16 h-16 rounded-md object-cover" />
      <div className="flex-1 ml-4 text-left">
        <p className="font-bold text-gray-800 dark:text-white">{diseaseInfo.farmer_name}</p>
        <p className={`text-sm font-medium ${isHealthy ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {isHealthy ? 'Healthy' : 'Disease Detected'}
        </p>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
    </button>
  );
};

export default RecentAnalysisCard;
