import React, { useRef } from 'react';
import { Language } from '../types';
import { translations } from '../services/translations';
import { Camera, Plus, Image as ImageIcon } from 'lucide-react';

interface Props {
  onScan: () => void;
  onManual: () => void;
  onImageUpload: (imageSrc: string) => void;
  language: Language;
}

const QuickActions: React.FC<Props> = ({ onScan, onManual, onImageUpload, language }) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Scan Button */}
        <button
          onClick={onScan}
          className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg shadow-slate-200 flex flex-col items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-transform duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
            <Camera size={24} className="text-green-400" />
          </div>
          <span className="font-bold text-sm">{t.scanMeal}</span>
        </button>

        {/* Add/Upload Group */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onManual}
            className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-slate-50 transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Plus size={18} />
            </div>
            <span className="font-semibold text-slate-700 text-sm">{t.addMeal}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-center gap-3 hover:bg-slate-50 transition active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ImageIcon size={18} />
            </div>
            <span className="font-semibold text-slate-700 text-sm">{t.uploadImage}</span>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
