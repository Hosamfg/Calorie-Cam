import React, { useState } from 'react';
import { Language, MealType } from '../types';
import { translations } from '../services/translations';
import { analyzeFoodText } from '../services/geminiService';
import { Loader2, ArrowLeft, Send } from 'lucide-react';

interface Props {
  language: Language;
  onAnalysisComplete: (data: any) => void;
  onCancel: () => void;
}

const ManualEntry: React.FC<Props> = ({ language, onAnalysisComplete, onCancel }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[language];
  const isRTL = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeFoodText(description, language);
      onAnalysisComplete(result);
    } catch (error) {
      console.error(error);
      alert(t.failedAnalysis);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center p-4 border-b border-slate-100">
        <button onClick={onCancel} className="p-2 -mx-2 text-slate-600">
          <ArrowLeft size={24} className={isRTL ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-xl font-bold mx-4">{t.manualEntry}</h1>
      </div>

      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t.describeFood}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.enterFoodDesc}
              className="w-full p-4 border border-slate-200 rounded-2xl h-40 focus:ring-2 focus:ring-green-500 outline-none text-lg resize-none bg-slate-50"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Send size={20} className={isRTL ? 'rotate-180' : ''} />
                {t.estimate}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualEntry;
