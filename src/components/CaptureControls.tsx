import React from 'react';
import { Camera, Video, VideoOff, Pause, Play, Square, Circle } from 'lucide-react';

type CaptureMode = 'photo' | 'video';
type RecordingState = 'idle' | 'recording' | 'paused';

interface CaptureControlsProps {
  mode: CaptureMode;
  recordingState: RecordingState;
  onModeChange: (mode: CaptureMode) => void;
  onCapture: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function CaptureControls({ 
  mode, 
  recordingState, 
  onModeChange, 
  onCapture,
  onPause,
  onResume,
  onStop,
  disabled = false 
}: CaptureControlsProps) {
  const handleMainAction = () => {
    if (mode === 'photo') {
      onCapture();
    } else if (recordingState === 'idle') {
      onCapture();
    } else if (recordingState === 'recording') {
      onPause();
    } else if (recordingState === 'paused') {
      onResume();
    }
  };

  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-2 flex items-center space-x-2">
        {/* Mode Toggle */}
        <div className="flex bg-gray-700 rounded-full p-1">
          <button
            onClick={() => onModeChange('photo')}
            className={`px-3 py-2 rounded-full transition-all ${
              mode === 'photo' 
                ? 'bg-red-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Photo mode"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => onModeChange('video')}
            className={`px-3 py-2 rounded-full transition-all ${
              mode === 'video' 
                ? 'bg-red-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="Video mode"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>

        {/* Main Capture Button */}
        <button
          onClick={handleMainAction}
          disabled={disabled}
          className={`
            w-16 h-16 rounded-full 
            flex items-center justify-center
            transition-all duration-200
            ${mode === 'video' && isRecording
              ? 'bg-red-600 hover:bg-red-700' 
              : mode === 'video' && isPaused
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : mode === 'video'
              ? 'bg-red-500 hover:bg-red-600 hover:scale-110'
              : 'bg-white hover:bg-gray-200 hover:scale-110'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            shadow-lg
          `}
          aria-label={
            mode === 'photo' ? 'Take photo' : 
            isRecording ? 'Pause recording' : 
            isPaused ? 'Resume recording' : 'Start recording'
          }
        >
          {mode === 'video' && isRecording ? (
            <Pause className="w-6 h-6 text-white" />
          ) : mode === 'video' && isPaused ? (
            <Play className="w-6 h-6 text-white" />
          ) : mode === 'video' ? (
            <Circle className="w-12 h-12 text-white" />
          ) : (
            <div className="w-12 h-12 rounded-full border-4 border-gray-800" />
          )}
        </button>

        {/* Stop Button (only show when recording or paused) */}
        {(isRecording || isPaused) && (
          <button
            onClick={onStop}
            className="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 flex items-center justify-center transition-all"
            aria-label="Stop recording"
          >
            <Square className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}