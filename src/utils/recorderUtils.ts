export class DualCameraRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private combinedStream: MediaStream | null = null;
  private isPaused = false;

  constructor(private stream1: MediaStream, private stream2: MediaStream) {
    this.setupCombinedStream();
  }

  private setupCombinedStream(): void {
    const videoTrack1 = this.stream1.getVideoTracks()[0];
    const videoTrack2 = this.stream2.getVideoTracks()[0];
    const audioTrack = this.stream1.getAudioTracks()[0];

    if (videoTrack1 && videoTrack2) {
      this.combinedStream = new MediaStream([videoTrack1, videoTrack2]);
      if (audioTrack) {
        this.combinedStream.addTrack(audioTrack);
      }
    }
  }

  start(): void {
    if (!this.combinedStream) {
      throw new Error('No combined stream available');
    }

    this.chunks = [];
    
    const options = {
      mimeType: 'video/webm;codecs=vp9,opus'
    };

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }

    this.mediaRecorder = new MediaRecorder(this.combinedStream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isPaused = false;
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recorder'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  get state(): MediaRecorderState | 'inactive' {
    return this.mediaRecorder?.state || 'inactive';
  }

  get paused(): boolean {
    return this.isPaused;
  }

  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.chunks = [];
    this.isPaused = false;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

export function createDualPhoto(blob1: Blob, blob2: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img1 = new Image();
    const img2 = new Image();
    
    img1.onload = () => {
      img2.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          canvas.width = img1.width + img2.width;
          canvas.height = Math.max(img1.height, img2.height);
          
          ctx.drawImage(img1, 0, 0);
          ctx.drawImage(img2, img1.width, 0);
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(img1.width, 0);
          ctx.lineTo(img1.width, canvas.height);
          ctx.stroke();
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not create combined photo'));
            }
          }, 'image/jpeg', 0.95);
        } catch (error) {
          reject(error);
        }
      };
      
      img2.onerror = () => reject(new Error('Failed to load second image'));
      img2.src = URL.createObjectURL(blob2);
    };
    
    img1.onerror = () => reject(new Error('Failed to load first image'));
    img1.src = URL.createObjectURL(blob1);
  });
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  blob: Blob;
  url: string;
  timestamp: Date;
  filename: string;
}

export function saveToLocalStorage(item: MediaItem): void {
  const savedItems = getSavedItems();
  savedItems.push(item);
  
  // Keep only last 20 items to manage storage
  if (savedItems.length > 20) {
    savedItems.shift();
  }
  
  localStorage.setItem('dualcam_media', JSON.stringify(savedItems.map(i => ({
    id: i.id,
    type: i.type,
    timestamp: i.timestamp.toISOString(),
    filename: i.filename
  }))));
}

export function getSavedItems(): MediaItem[] {
  const saved = localStorage.getItem('dualcam_media');
  if (!saved) return [];
  
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function clearSavedItems(): void {
  localStorage.removeItem('dualcam_media');
}