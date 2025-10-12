
import React, { useState } from 'react';
import { useDisease } from '../providers/DiseaseProvider';
import Header from '../components/Header';
import DiseaseCard from '../components/DiseaseCard';
import type { Screen } from '../types';
import { ChevronLeftIcon } from '../components/icons';

interface PlantGuideScreenProps {
  navigate: (screen: Screen) => void;
}

const PlantGuideScreen: React.FC<PlantGuideScreenProps> = ({ navigate }) => {
  const { supportedPlants, getDiseasesByPlantType } = useDisease();
  const [activeTab, setActiveTab] = useState(supportedPlants[0] || '');

  const diseases = getDiseasesByPlantType(activeTab);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
         <button onClick={() => navigate('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
             <ChevronLeftIcon className="w-6 h-6" />
         </button>
         <div className="flex-grow">
            <Header title="Plant Guide" subtitle="Learn about plant diseases" center={true}/>
         </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {supportedPlants.map(plant => (
            <button
              key={plant}
              onClick={() => setActiveTab(plant)}
              className={`${
                activeTab === plant
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {plant}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {diseases.map(disease => (
          <DiseaseCard key={disease.farmer_name} disease={disease} />
        ))}
      </div>
    </div>
  );
};

export default PlantGuideScreen;
