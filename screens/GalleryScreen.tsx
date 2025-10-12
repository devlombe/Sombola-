import React, { useRef } from 'react';
import { useDisease } from '../providers/DiseaseProvider';
import type { Screen } from '../types';
import { PhotoIcon, XMarkIcon } from '../components/icons';

interface GalleryScreenProps {
  navigate: (screen: Screen, image?: string) => void;
}

const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigate }) => {
  const { predictFromImage, isLoading, error } = useDisease();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        const result = await predictFromImage(imageDataUrl);
        if (result) {
          navigate('result');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => navigate('home')} className="p-2 bg-black/50 rounded-full text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="text-center p-8">
        {isLoading && (
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-white border-t-primary-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-white text-lg">Analyzing image...</p>
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-center mb-6 p-4 bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <PhotoIcon className="w-24 h-24 text-white/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Select from Gallery</h2>
          <p className="text-white/80">Choose an image from your device to analyze</p>
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
        >
          {isLoading ? 'Processing...' : 'Choose Image'}
        </button>
        
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default GalleryScreen;
