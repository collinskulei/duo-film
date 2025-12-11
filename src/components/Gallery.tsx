import React, { useState } from 'react';
import { X, Download, Trash2, Play, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '../utils/recorderUtils';

interface GalleryProps {
  items: MediaItem[];
  onClose: () => void;
  onDownload: (item: MediaItem) => void;
  onDelete: (id: string) => void;
}

export function Gallery({ items, onClose, onDownload, onDelete }: GalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">Gallery ({items.length})</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-center">
              No media captured yet.<br />
              Start recording to see your photos and videos here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-800"
                onClick={() => setSelectedItem(item)}
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-700 flex items-center justify-center">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(item);
                      }}
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-30"
                      aria-label="Download"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 hover:bg-opacity-30"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white text-xs truncate">
                    {item.type === 'photo' ? (
                      <ImageIcon className="w-3 h-3 inline mr-1" />
                    ) : (
                      <Play className="w-3 h-3 inline mr-1" />
                    )}
                    {formatDate(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-60 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
              aria-label="Close preview"
            >
              <X className="w-8 h-8" />
            </button>
            
            {selectedItem.type === 'photo' ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.filename}
                className="max-w-full max-h-full rounded-lg"
              />
            ) : (
              <video
                src={selectedItem.url}
                controls
                className="max-w-full max-h-full rounded-lg"
              />
            )}
            
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => onDownload(selectedItem)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => {
                  onDelete(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}