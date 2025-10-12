
import React, { useEffect, useState } from 'react';
import { useDisease } from '../providers/DiseaseProvider';
import Header from '../components/Header';
import SeverityIndicator from '../components/SeverityIndicator';
import ActionCard from '../components/ActionCard';
import type { Screen, PredictionResult } from '../types';
import { ChevronLeftIcon, CameraIcon, HomeIcon } from '../components/icons';

interface ResultScreenProps {
  navigate: (screen: Screen) => void;
  historyImage?: string | null;
}

const InfoSection: React.FC<{ title: string; items?: string[] }> = ({ title, items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
};


const ResultScreen: React.FC<ResultScreenProps> = ({ navigate, historyImage }) => {
  const { currentPrediction, isLoading, error } = useDisease();
  const [prediction, setPrediction] = useState<PredictionResult | null>(currentPrediction);

  useEffect(() => {
    if (historyImage) {
        const historyPrediction = JSON.parse(localStorage.getItem('predictionHistory') || '[]').find((p: PredictionResult) => p.imagePath === historyImage);
        if(historyPrediction) setPrediction(historyPrediction);
    } else {
        setPrediction(currentPrediction);
    }
  }, [historyImage, currentPrediction]);

  if (isLoading) {
    return <div className="text-center p-10">Loading results...</div>;
  }

  if (error && !prediction) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500">{error}</p>
        <button onClick={() => navigate('camera')} className="mt-4 bg-primary-500 text-white px-4 py-2 rounded">Try again</button>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center p-10">
        <p>No prediction available.</p>
        <button onClick={() => navigate('home')} className="mt-4 bg-primary-500 text-white px-4 py-2 rounded">Go Home</button>
      </div>
    );
  }

  const { diseaseInfo, imagePath, confidencePercentage, severityLevel, plantName, plantType } = prediction;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center">
        <button onClick={() => navigate('home')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-grow">
            <Header
              title={diseaseInfo.farmer_name}
              subtitle={
                diseaseInfo.technical_name || plantName || plantType
              }
              center={true}
            />
        </div>
      {/* Show crop name in analysis */}
      <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-center text-gray-700 dark:text-gray-200 text-sm font-medium">
        Crop: {plantName || plantType}
      </div>
      </div>
      
      <div className="rounded-lg overflow-hidden shadow-lg">
        <img src={imagePath} alt="Analyzed plant" className="w-full h-auto object-cover" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Confidence</span>
            <span className="font-bold text-lg text-primary-600 dark:text-primary-400">{confidencePercentage}</span>
        </div>
        <SeverityIndicator level={severityLevel} />
      </div>
      
      <div className="space-y-6">
        <ActionCard title="Description" content={diseaseInfo.simple_description} />
        <InfoSection title="What you might see" items={diseaseInfo.what_farmer_sees} />
        <InfoSection title="Immediate Actions" items={diseaseInfo.immediate_action} />
        <InfoSection title="Treatment" items={diseaseInfo.treatment} />
        <InfoSection title="Prevention Tips" items={diseaseInfo.prevention_tips} />
        {diseaseInfo.when_to_worry && <ActionCard title="When to worry" content={diseaseInfo.when_to_worry} />}
      </div>
      
      <div className="flex gap-4 pt-4">
        <button onClick={() => navigate('camera')} className="flex-1 flex items-center justify-center gap-2 bg-primary-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors">
          <CameraIcon className="w-5 h-5" />
          Scan Another
        </button>
        <button onClick={() => navigate('home')} className="flex-1 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          <HomeIcon className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
