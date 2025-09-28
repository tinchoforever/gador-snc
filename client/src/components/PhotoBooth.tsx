import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Download } from 'lucide-react';

interface PhotoBoothProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function PhotoBooth({ onComplete, onCancel }: PhotoBoothProps) {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    requestCameraPermission();
    return () => {
      stopCamera();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1920, height: 1080 }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasPermission(true);
        setIsActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access and try again.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(10);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCounting(false);
          takePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const url = canvas.toDataURL('image/jpeg', 0.95);
    setPhotoUrl(url);
    setPhotoTaken(true);
    
    // Auto-download the photo
    const link = document.createElement('a');
    link.href = url;
    link.download = `gador_anniversary_photo_${Date.now()}.jpg`;
    link.click();
    
    console.log('Photo captured and downloaded');
  };

  const handleComplete = () => {
    stopCamera();
    onComplete?.();
  };

  const handleCancel = () => {
    stopCamera();
    onCancel?.();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md mx-4">
          <h3 className="text-red-300 text-xl font-semibold mb-4">Camera Error</h3>
          <p className="text-red-200 mb-6">{error}</p>
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-photo">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50" data-testid="photo-booth">
      {/* Video preview */}
      {isActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Countdown overlay */}
      {isCounting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div 
              className="text-9xl font-bold text-white mb-4 animate-pulse"
              style={{
                textShadow: '0 0 50px hsl(178, 100%, 33%), 0 0 100px hsl(178, 100%, 33%)',
                color: 'hsl(178, 100%, 33%)'
              }}
            >
              {countdown}
            </div>
            <p className="text-white text-2xl font-semibold">Get ready...</p>
          </div>
        </div>
      )}
      
      {/* Photo taken overlay */}
      {photoTaken && photoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="mb-6">
              <img 
                src={photoUrl} 
                alt="Captured photo" 
                className="max-w-md max-h-80 object-contain border-4 border-teal-400 rounded-lg shadow-2xl"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="default"
                onClick={handleComplete}
                data-testid="button-complete-photo"
              >
                <Download className="w-4 h-4 mr-2" />
                Photo Saved!
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      {isActive && !isCounting && !photoTaken && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-4">
            <Button 
              size="lg"
              onClick={startCountdown}
              className="px-8 py-4 text-lg"
              data-testid="button-start-countdown"
            >
              <Camera className="w-6 h-6 mr-3" />
              Take Photo
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="px-8 py-4 text-lg"
              data-testid="button-cancel-photo"
            >
              <X className="w-6 h-6 mr-3" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}