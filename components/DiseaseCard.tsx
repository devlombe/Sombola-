
import React from 'react';
import type { DiseaseInfo } from '../types';

interface DiseaseCardProps {
  disease: DiseaseInfo;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease }) => {
  const isHealthy = disease.farmer_name.toLowerCase().includes('healthy');

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{disease.farmer_name}</h3>
      {disease.technical_name && <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-2">{disease.technical_name}</p>}
      <p className="text-gray-600 dark:text-gray-300">{disease.simple_description}</p>
      <div className={`mt-3 inline-block px-2 py-1 text-xs font-semibold rounded-full ${isHealthy ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
        {isHealthy ? 'Healthy Condition' : 'Disease'}
      </div>
    </div>
  );
};

export default DiseaseCard;
