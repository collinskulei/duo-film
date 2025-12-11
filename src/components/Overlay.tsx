import React from 'react';
import { AlertCircle, Loader2, Camera, Video, Pause } from 'lucide-react';

interface OverlayProps {
  isVisible: boolean;
  type: 'recording' | 'paused' | 'capturing' | 'error' | 'permission';
  message?: string;
  onRetry?: () => void;
}

export function Overlay({ isVisible, type, message, onRetry }: OverlayProps) {
  if (!isVisible) return null;

  const getOverlayContent = () => {
    switch (type) {
      case 'recording':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <p className="text-white font-medium">Recording video...</p>
          </div>
        );
      
      case 'paused':
        return (
          <div className="flex items-center space-x-3">
            <Pause className="w-6 h-6 text-yellow-500" />
            <p className="text-white font-medium">Recording paused</p>
          </div>
        );
      
      case 'capturing':
        return (
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-white animate-pulse" />
            <p className="text-white font-medium">Capturing photo...</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-2">
              {message || 'Something went wrong'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        );
      
      case 'permission':
        return (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-2">
              Camera & Microphone access required
            </p>
            <p className="text-gray-300 text-sm mb-4">
              {message || 'Please allow camera and microphone access to use DualCam Film'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Request Permission
              </button>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-30 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl p-6 max-w-sm mx-4">
        {getOverlayContent()}
      </div>
    </div>
  );
}