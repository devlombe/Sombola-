
import React from 'react';
import { useDisease } from '../providers/DiseaseProvider';
import Header from '../components/Header';
import PredictionListItem from '../components/PredictionListItem';
import type { Screen } from '../types';
import { ChevronLeftIcon, TrashIcon, SparklesIcon } from '../components/icons';

interface HistoryScreenProps {
  navigate: (screen: Screen, image?: string) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigate }) => {
  const { predictionHistory, clearHistory, deleteFromHistory } = useDisease();

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
            <button onClick={() => navigate('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <Header title="Analysis History" />
            {predictionHistory.length > 0 && (
                <button onClick={clearHistory} className="p-2 -mr-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                    <TrashIcon className="w-6 h-6" />
                </button>
            )}
        </div>

        <div className="space-y-4">
            {predictionHistory.length > 0 ? (
                predictionHistory.map(prediction => (
                    <PredictionListItem 
                        key={prediction.timestamp} 
                        prediction={prediction} 
                        onView={() => navigate('result', prediction.imagePath)} 
                        onDelete={() => deleteFromHistory(prediction.timestamp)}
                    />
                ))
            ) : (
                <div className="text-center p-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <SparklesIcon className="w-16 h-16 mx-auto text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Your analysis history is empty.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Scanned plants will appear here.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default HistoryScreen;
