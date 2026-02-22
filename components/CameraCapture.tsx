import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Image as ImageIcon, Zap, ZapOff } from 'lucide-react';
import { translations } from '../services/translations';
import { getLanguage } from '../services/storageService';

interface Props {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  
  const language = getLanguage();
  const t = translations[language];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(t.errorCamera);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(imageSrc);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          stopCamera();
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm">
          <X size={24} />
        </button>
        <button 
          onClick={() => setFlash(!flash)} 
          className="p-2 rounded-full bg-black/20 text-white backdrop-blur-sm"
        >
          {flash ? <Zap size={24} className="fill-yellow-400 text-yellow-400" /> : <ZapOff size={24} />}
        </button>
      </div>

      {/* Main Viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {error ? (
           <div className="text-white text-center p-6">
             <p className="mb-4">{error}</p>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold"
             >
               {t.uploadImage}
             </button>
           </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-black p-8 flex justify-between items-center pb-12">
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          <ImageIcon size={24} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        <button 
          onClick={capturePhoto}
          disabled={!!error}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group"
        >
          <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition duration-150" />
        </button>

        <div className="w-14" /> {/* Spacer for centering */}
      </div>
    </div>
  );
};

export default CameraCapture;
