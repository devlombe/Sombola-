
import React, { useState, useCallback } from 'react';
import { DiseaseProvider } from './providers/DiseaseProvider';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import GalleryScreen from './screens/GalleryScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import PlantGuideScreen from './screens/PlantGuideScreen';
import type { Screen } from './types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [historyImage, setHistoryImage] = useState<string | null>(null);

  const navigate = useCallback((screen: Screen, image?: string) => {
    if (screen === 'result' && image) {
      setHistoryImage(image);
    } else {
      setHistoryImage(null);
    }
    setCurrentScreen(screen);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen navigate={navigate} />;
      case 'camera':
        return <CameraScreen navigate={navigate} />;
      case 'gallery':
        return <GalleryScreen navigate={navigate} />;
      case 'result':
        return <ResultScreen navigate={navigate} historyImage={historyImage} />;
      case 'history':
        return <HistoryScreen navigate={navigate} />;
      case 'guide':
        return <PlantGuideScreen navigate={navigate} />;
      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  return (
    <DiseaseProvider>
      <div className="min-h-screen text-gray-800 dark:text-gray-200">
        <div className="container mx-auto max-w-lg p-4 font-sans">
          {renderScreen()}
        </div>
      </div>
    </DiseaseProvider>
  );
};

export default App;
