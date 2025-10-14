
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDisease } from '../providers/DiseaseProvider';
import type { Screen } from '../types';
import { CameraIcon, PhotoIcon, ArrowPathIcon, BoltIcon, BoltSlashIcon, XMarkIcon } from '../components/icons';

interface CameraScreenProps {
  navigate: (screen: Screen) => void;
}

const WebCamera: React.FC<CameraScreenProps> = ({ navigate }) => {
  const { predictFromImage, isLoading, error } = useDisease();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [torch, setTorch] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check for torch capability
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      // @ts-ignore
      setHasTorch(!!capabilities.torch);

    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Could not access camera. Please check permissions and try again.");
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
      if (stream && hasTorch) {
        const track = stream.getVideoTracks()[0];
        track.applyConstraints({
            // @ts-ignore
            advanced: [{torch}]
        }).catch(e => console.error('Failed to apply torch constraint', e));
      }
  }, [torch, stream, hasTorch]);

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      const result = await predictFromImage(imageDataUrl);
      if (result) {
        navigate('result');
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        const result = await predictFromImage(imageDataUrl);
        if(result) {
            navigate('result');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => navigate('home')} className="p-2 bg-black/50 rounded-full text-white" title="Close camera">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <div className="w-16 h-16 border-4 border-white border-t-primary-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg">Analyzing...</p>
          </div>
        )}
        {cameraError && (
             <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center z-20 p-4 text-center">
                <p className="text-white mb-4">{cameraError}</p>
                <button onClick={() => startCamera(facingMode)} className="bg-primary-500 text-white px-4 py-2 rounded-lg">Retry</button>
            </div>
        )}
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
      <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent z-10">
        {error && <div className="text-red-400 text-center mb-2">{error}</div>}
        <div className="flex justify-around items-center">
      <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/20 rounded-full text-white backdrop-blur-sm" title="Upload or select image">
        <PhotoIcon className="w-7 h-7" />
      </button>
      <label htmlFor="camera-file-input" className="sr-only">Select image file</label>
      <input id="camera-file-input" type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" title="Select image file" />

      <button onClick={handleCapture} className="w-20 h-20 rounded-full bg-white border-4 border-black/20 focus:outline-none ring-4 ring-white/50 ring-offset-4 ring-offset-black" title="Capture photo">
        <CameraIcon className="w-10 h-10 text-primary-600 mx-auto" />
      </button>

      <div className="flex flex-col space-y-2">
        <button onClick={switchCamera} className="p-3 bg-white/20 rounded-full text-white backdrop-blur-sm" title="Switch camera">
          <ArrowPathIcon className="w-7 h-7" />
        </button>
        {hasTorch && (
          <button onClick={() => setTorch(!torch)} className="p-3 bg-white/20 rounded-full text-white backdrop-blur-sm" title="Toggle torch">
            {torch ? <BoltIcon className="w-7 h-7" /> : <BoltSlashIcon className="w-7 h-7" />}
          </button>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default WebCamera;
