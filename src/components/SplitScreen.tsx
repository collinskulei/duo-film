import React from 'react';

interface SplitScreenProps {
  leftChild: React.ReactNode;
  rightChild: React.ReactNode;
}

export function SplitScreen({ leftChild, rightChild }: SplitScreenProps) {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen bg-gray-900">
      <div className="flex-1 relative">
        {leftChild}
      </div>
      <div className="w-px bg-gray-800" />
      <div className="flex-1 relative">
        {rightChild}
      </div>
    </div>
  );
}