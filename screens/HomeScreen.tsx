
import React from 'react';
import { useDisease } from '../providers/DiseaseProvider';
import FeatureCard from '../components/FeatureCard';
import RecentAnalysisCard from '../components/RecentAnalysisCard';
import Header from '../components/Header';
import type { Screen } from '../types';
import { CameraIcon, PhotoIcon, ClockIcon, BookOpenIcon, SparklesIcon } from '../components/icons';

interface HomeScreenProps {
  navigate: (screen: Screen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigate }) => {
  const { predictionHistory, supportedPlants, isLoading } = useDisease();

  return (
    <div className="space-y-6 animate-fade-in">
      <Header title="Sombola" subtitle="Plant Disease Detection" />
      
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard
          title="Scan Plant"
          icon={<CameraIcon className="w-8 h-8 text-primary-500" />}
          onClick={() => navigate('camera')}
        />
        <FeatureCard
          title="From Gallery"
          icon={<PhotoIcon className="w-8 h-8 text-primary-500" />}
          onClick={() => navigate('gallery')}
        />
        <FeatureCard
          title="History"
          icon={<ClockIcon className="w-8 h-8 text-primary-500" />}
          onClick={() => navigate('history')}
        />
        <FeatureCard
          title="Plant Guide"
          icon={<BookOpenIcon className="w-8 h-8 text-primary-500" />}
          onClick={() => navigate('guide')}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Recent Analyses</h2>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">Loading history...</div>
          ) : predictionHistory.length > 0 ? (
            predictionHistory.slice(0, 3).map(prediction => (
              <RecentAnalysisCard key={prediction.timestamp} prediction={prediction} onClick={() => navigate('result', prediction.imagePath)} />
            ))
          ) : (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <SparklesIcon className="w-12 h-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500 dark:text-gray-400">No analyses yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Start by scanning a plant!</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Supported Plants</h2>
         <div className="flex flex-wrap gap-2">
            {supportedPlants.map(plant => (
                <span key={plant} className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-primary-900 dark:text-primary-200">
                    {plant}
                </span>
            ))}
        </div>
      </div>

    </div>
  );
};

export default HomeScreen;
