import React, { useState, useEffect, useRef } from 'react';
import { CameraFeed } from './components/CameraFeed';
import { SplitScreen } from './components/SplitScreen';
import { CaptureControls } from './components/CaptureControls';
import { Gallery } from './components/Gallery';
import { Overlay } from './components/Overlay';
import { DualCameraRecorder, downloadBlob, generateTimestamp, createDualPhoto, MediaItem, saveToLocalStorage, getSavedItems, clearSavedItems } from './utils/recorderUtils';
import { Image as ImageIcon } from 'lucide-react';

type CaptureMode = 'photo' | 'video';
type RecordingState = 'idle' | 'recording' | 'paused';

function App() {
  const [frontCameraMode, setFrontCameraMode] = useState<'user' | 'environment'>('user');
  const [backCameraMode, setBackCameraMode] = useState<'user' | 'environment'>('environment');
  const [frontStream, setFrontStream] = useState<MediaStream | null>(null);
  const [backStream, setBackStream] = useState<MediaStream | null>(null);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('photo');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [overlay, setOverlay] = useState<{ type: 'recording' | 'paused' | 'capturing' | 'error' | 'permission'; message?: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const recorderRef = useRef<DualCameraRecorder | null>(null);
  const frontCaptureRef = useRef<(() => Promise<Blob>) | null>(null);
  const backCaptureRef = useRef<(() => Promise<Blob>) | null>(null);

  useEffect(() => {
    // Load saved items from localStorage
    const saved = getSavedItems();
    setMediaItems(saved);
  }, []);

  useEffect(() => {
    // Check for camera support on mount
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setOverlay({ type: 'error', message: 'Camera API not supported in this browser' });
      return;
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Initialize recorder when both streams are ready
    if (frontStream && backStream && !recorderRef.current) {
      try {
        recorderRef.current = new DualCameraRecorder(frontStream, backStream);
      } catch (error) {
        console.error('Failed to initialize recorder:', error);
        setOverlay({ type: 'error', message: 'Failed to initialize recorder' });
      }
    }

    return () => {
      if (recorderRef.current) {
        recorderRef.current.cleanup();
        recorderRef.current = null;
      }
    };
  }, [frontStream, backStream]);

  const handleCapture = async () => {
    if (captureMode === 'photo') {
      await capturePhoto();
    } else {
      await handleVideoCapture();
    }
  };

  const capturePhoto = async () => {
    if (!frontCaptureRef.current || !backCaptureRef.current) {
      setOverlay({ type: 'error', message: 'Cameras not ready' });
      return;
    }

    try {
      setOverlay({ type: 'capturing' });
      
      const [frontBlob, backBlob] = await Promise.all([
        frontCaptureRef.current(),
        backCaptureRef.current()
      ]);

      const combinedPhoto = await createDualPhoto(frontBlob, backBlob);
      const filename = `DualCam_Photo_${generateTimestamp()}.jpg`;
      const url = URL.createObjectURL(combinedPhoto);
      
      const mediaItem: MediaItem = {
        id: `photo_${Date.now()}`,
        type: 'photo',
        blob: combinedPhoto,
        url,
        timestamp: new Date(),
        filename
      };

      setMediaItems(prev => [mediaItem, ...prev]);
      saveToLocalStorage(mediaItem);
      
      setOverlay(null);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      setOverlay({ type: 'error', message: 'Failed to capture photo' });
    }
  };

  const handleVideoCapture = async () => {
    if (!recorderRef.current) {
      setOverlay({ type: 'error', message: 'Recorder not ready' });
      return;
    }

    if (recordingState === 'idle') {
      try {
        recorderRef.current.start();
        setRecordingState('recording');
        setOverlay({ type: 'recording' });
      } catch (error) {
        console.error('Failed to start recording:', error);
        setOverlay({ type: 'error', message: 'Failed to start recording' });
      }
    }
  };

  const handlePause = () => {
    if (recorderRef.current && recordingState === 'recording') {
      recorderRef.current.pause();
      setRecordingState('paused');
      setOverlay({ type: 'paused' });
    }
  };

  const handleResume = () => {
    if (recorderRef.current && recordingState === 'paused') {
      recorderRef.current.resume();
      setRecordingState('recording');
      setOverlay({ type: 'recording' });
    }
  };

  const handleStop = async () => {
    if (!recorderRef.current) return;

    try {
      setOverlay(null);
      const blob = await recorderRef.current.stop();
      const filename = `DualCam_Video_${generateTimestamp()}.webm`;
      const url = URL.createObjectURL(blob);
      
      const mediaItem: MediaItem = {
        id: `video_${Date.now()}`,
        type: 'video',
        blob,
        url,
        timestamp: new Date(),
        filename
      };

      setMediaItems(prev => [mediaItem, ...prev]);
      saveToLocalStorage(mediaItem);
      
      setRecordingState('idle');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setOverlay({ type: 'error', message: 'Failed to save recording' });
      setRecordingState('idle');
    }
  };

  const handleDownload = (item: MediaItem) => {
    downloadBlob(item.blob, item.filename);
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      // Update localStorage
      localStorage.setItem('dualcam_media', JSON.stringify(updated.map(i => ({
        id: i.id,
        type: i.type,
        timestamp: i.timestamp.toISOString(),
        filename: i.filename
      }))));
      return updated;
    });
  };

  const handleRetry = () => {
    setOverlay(null);
    window.location.reload();
  };

  if (!isInitialized) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <SplitScreen
        leftChild={
          <CameraFeed
            facingMode={frontCameraMode}
            isActive={true}
            label="Front Camera"
            onStreamReady={setFrontStream}
            onCameraSwitch={setFrontCameraMode}
            onCaptureRequest={(captureFn) => { frontCaptureRef.current = captureFn; }}
            includeAudio={captureMode === 'video'}
          />
        }
        rightChild={
          <CameraFeed
            facingMode={backCameraMode}
            isActive={true}
            label="Back Camera"
            onStreamReady={setBackStream}
            onCameraSwitch={setBackCameraMode}
            onCaptureRequest={(captureFn) => { backCaptureRef.current = captureFn; }}
            includeAudio={captureMode === 'video'}
          />
        }
      />
      
      {/* Gallery Button */}
      <button
        onClick={() => setShowGallery(true)}
        className="fixed top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-70 transition-all z-10"
        aria-label="Open gallery"
      >
        <ImageIcon className="w-5 h-5 text-white" />
        {mediaItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {mediaItems.length > 99 ? '99+' : mediaItems.length}
          </span>
        )}
      </button>
      
      <CaptureControls
        mode={captureMode}
        recordingState={recordingState}
        onModeChange={setCaptureMode}
        onCapture={handleCapture}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        disabled={!frontStream || !backStream}
      />
      
      <Overlay
        isVisible={!!overlay}
        type={overlay?.type || 'error'}
        message={overlay?.message}
        onRetry={handleRetry}
      />

      {/* Gallery Modal */}
      {showGallery && (
        <Gallery
          items={mediaItems}
          onClose={() => setShowGallery(false)}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default App;