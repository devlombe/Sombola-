
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import mlService from '../services/mlService';
import diseaseService from '../services/diseaseService';
import type { PredictionResult, DiseaseInfo } from '../types';

interface DiseaseContextType {
  currentPrediction: PredictionResult | null;
  predictionHistory: PredictionResult[];
  isLoading: boolean;
  error: string | null;
  predictFromImage: (imagePath: string) => Promise<PredictionResult | null>;
  clearHistory: () => void;
  deleteFromHistory: (timestamp: number) => void;
  getPredictionByTimestamp: (timestamp: number) => PredictionResult | undefined;
  supportedPlants: string[];
  allDiseases: DiseaseInfo[];
  getDiseasesByPlantType: (plantType: string) => DiseaseInfo[];
}

const DiseaseContext = createContext<DiseaseContextType | undefined>(undefined);

const MAX_HISTORY_SIZE = 50;

export const DiseaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionResult[]>(() => {
    try {
      const savedHistory = localStorage.getItem('predictionHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [supportedPlants, setSupportedPlants] = useState<string[]>([]);
  const [allDiseases, setAllDiseases] = useState<DiseaseInfo[]>([]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await mlService.initialize();
      setSupportedPlants(diseaseService.getSupportedPlantTypes());
      setAllDiseases(diseaseService.getAllDiseases());
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('predictionHistory', JSON.stringify(predictionHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [predictionHistory]);

  const predictFromImage = useCallback(async (imagePath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mlService.predict(imagePath);
      setCurrentPrediction(result);
      setPredictionHistory(prev => {
        const newHistory = [result, ...prev];
        return newHistory.slice(0, MAX_HISTORY_SIZE);
      });
      setIsLoading(false);
      return result;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setPredictionHistory([]);
  }, []);

  const deleteFromHistory = useCallback((timestamp: number) => {
    setPredictionHistory(prev => prev.filter(p => p.timestamp !== timestamp));
  }, []);
  
  const getPredictionByTimestamp = useCallback((timestamp: number) => {
      return predictionHistory.find(p => p.timestamp === timestamp);
  }, [predictionHistory]);

  const getDiseasesByPlantType = useCallback((plantType: string) => {
      return diseaseService.getDiseasesByPlantType(plantType);
  }, []);

  return (
    <DiseaseContext.Provider value={{
      currentPrediction,
      predictionHistory,
      isLoading,
      error,
      predictFromImage,
      clearHistory,
      deleteFromHistory,
      getPredictionByTimestamp,
      supportedPlants,
      allDiseases,
      getDiseasesByPlantType
    }}>
      {children}
    </DiseaseContext.Provider>
  );
};

export const useDisease = (): DiseaseContextType => {
  const context = useContext(DiseaseContext);
  if (context === undefined) {
    throw new Error('useDisease must be used within a DiseaseProvider');
  }
  return context;
};
