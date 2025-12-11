export interface CameraStream {
  stream: MediaStream | null;
  isActive: boolean;
  facingMode: 'user' | 'environment';
}

export async function getCameraStream(facingMode: 'user' | 'environment', includeAudio: boolean = true): Promise<MediaStream> {
  try {
    const constraints = {
      video: {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: includeAudio
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  } catch (error) {
    console.error(`Error accessing ${facingMode} camera:`, error);
    throw error;
  }
}

export function stopStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

export async function switchCamera(currentMode: 'user' | 'environment'): Promise<'user' | 'environment'> {
  return currentMode === 'user' ? 'environment' : 'user';
}

export function capturePhoto(videoElement: HTMLVideoElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw the video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not create photo blob'));
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      reject(error);
    }
  });
}