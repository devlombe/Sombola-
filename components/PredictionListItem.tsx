
import React from 'react';
import type { PredictionResult } from '../types';
import { TrashIcon } from './icons';

interface PredictionListItemProps {
  prediction: PredictionResult;
  onView: () => void;
  onDelete: () => void;
}

const PredictionListItem: React.FC<PredictionListItemProps> = ({ prediction, onView, onDelete }) => {
  const { imagePath, diseaseInfo, timestamp, isHealthy } = prediction;
  const date = new Date(timestamp).toLocaleString();

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
      <img src={imagePath} alt="Analyzed plant" className="w-20 h-20 rounded-md object-cover" />
      <div className="flex-1 mx-4 cursor-pointer" onClick={onView}>
        <p className="font-bold text-gray-800 dark:text-white">{diseaseInfo.farmer_name}</p>
        <p className={`text-sm font-medium ${isHealthy ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
          {prediction.plantType} - {isHealthy ? 'Healthy' : 'Diseased'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }} 
        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default PredictionListItem;
