import React from 'react';
import { Camera, Video, VideoOff, Circle, Square } from 'lucide-react';

type CaptureMode = 'photo' | 'video';

interface CaptureButtonProps {
  mode: CaptureMode;
  isRecording: boolean;
  onModeChange: (mode: CaptureMode) => void;
  onCapture: () => void;
  disabled?: boolean;
}

export function CaptureButton({ 
  mode, 
  isRecording, 
  onModeChange, 
  onCapture, 
  disabled = false 
}: CaptureButtonProps) {
  const handleCapture = () => {
    if (mode === 'photo') {
      onCapture();
    } else {
      onCapture();
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
      {/* Mode Toggle */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full p-1 flex">
        <button
          onClick={() => onModeChange('photo')}
          className={`px-4 py-2 rounded-full transition-all ${
            mode === 'photo' 
              ? 'bg-red-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Photo mode"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          onClick={() => onModeChange('video')}
          className={`px-4 py-2 rounded-full transition-all ${
            mode === 'video' 
              ? 'bg-red-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
          aria-label="Video mode"
        >
          {isRecording ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>

      {/* Capture Button */}
      <button
        onClick={handleCapture}
        disabled={disabled}
        className={`
          w-20 h-20 rounded-full 
          flex items-center justify-center
          transition-all duration-200
          ${mode === 'video' && isRecording
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : mode === 'video'
            ? 'bg-red-500 hover:bg-red-600 hover:scale-110'
            : 'bg-white hover:bg-gray-200 hover:scale-110'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          shadow-2xl
        `}
        aria-label={mode === 'photo' ? 'Take photo' : (isRecording ? 'Stop recording' : 'Start recording')}
      >
        {mode === 'video' && isRecording ? (
          <Square className="w-8 h-8 text-white" />
        ) : mode === 'video' ? (
          <Circle className="w-16 h-16 text-white" />
        ) : (
          <div className="w-16 h-16 rounded-full border-4 border-gray-800" />
        )}
      </button>
    </div>
  );
}