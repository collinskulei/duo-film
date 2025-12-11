import React from 'react';
import { Circle, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function RecordButton({ isRecording, onToggle, disabled = false }: RecordButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20
        w-20 h-20 rounded-full 
        flex items-center justify-center
        transition-all duration-200
        ${isRecording 
          ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
          : 'bg-red-500 hover:bg-red-600 hover:scale-110'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        shadow-2xl
      `}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? (
        <Square className="w-8 h-8 text-white" />
      ) : (
        <Circle className="w-16 h-16 text-white" />
      )}
    </button>
  );
}