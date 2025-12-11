import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { getCameraStream, stopStream, switchCamera, capturePhoto } from '../utils/cameraUtils';

interface CameraFeedProps {
  facingMode: 'user' | 'environment';
  isActive: boolean;
  label: string;
  onStreamReady: (stream: MediaStream) => void;
  onCameraSwitch: (newMode: 'user' | 'environment') => void;
  onCaptureRequest?: (captureFn: () => Promise<Blob>) => void;
  includeAudio?: boolean;
  className?: string;
}

export function CameraFeed({ 
  facingMode, 
  isActive, 
  label, 
  onStreamReady, 
  onCameraSwitch,
  onCaptureRequest,
  includeAudio = true,
  className = ''
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        stream = await getCameraStream(facingMode, includeAudio);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        onStreamReady(stream);
        setIsLoading(false);
      } catch (err) {
        setError('Camera not available');
        setIsLoading(false);
        console.error('Camera initialization error:', err);
      }
    };

    if (isActive) {
      initializeCamera();
    }

    return () => {
      stopStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [facingMode, isActive, onStreamReady, includeAudio]);

  const handleSwitchCamera = async () => {
    const newMode = await switchCamera(facingMode);
    onCameraSwitch(newMode);
  };

  const handleCapture = async (): Promise<Blob> => {
    if (!videoRef.current) {
      throw new Error('Video element not available');
    }
    return capturePhoto(videoRef.current);
  };

  useEffect(() => {
    if (onCaptureRequest) {
      onCaptureRequest(handleCapture);
    }
  }, [onCaptureRequest]);

  return (
    <div className={`relative bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Loading camera...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center px-4">
            <Camera className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      <div className="absolute top-4 left-4">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-full px-3 py-1">
          <p className="text-white text-xs font-medium">{label}</p>
        </div>
      </div>
      
      <button
        onClick={handleSwitchCamera}
        className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-70 transition-all"
        aria-label="Switch camera"
      >
        <RefreshCw className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}