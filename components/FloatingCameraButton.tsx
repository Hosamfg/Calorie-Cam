import React from 'react';
import { Camera } from 'lucide-react';

interface Props {
  onClick: () => void;
}

const FloatingCameraButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[90px] left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white w-16 h-16 rounded-full shadow-2xl shadow-slate-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ring-4 ring-white"
      aria-label="Open Camera"
    >
      <Camera size={28} className="text-green-400" />
    </button>
  );
};

export default FloatingCameraButton;
