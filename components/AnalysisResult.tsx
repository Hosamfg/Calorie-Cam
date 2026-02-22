import React, { useState } from 'react';
import { AnalysisResult as AnalysisResultType, Language, MealType } from '../types';
import { translations } from '../services/translations';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, Check, Coffee, Sun, Moon, Apple } from 'lucide-react';

interface Props {
  result: AnalysisResultType;
  language: Language;
  onSave: (mealType: MealType) => void;
  onDiscard: () => void;
}

const AnalysisResult: React.FC<Props> = ({ result, language, onSave, onDiscard }) => {
  const t = translations[language];
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.Lunch);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Unhealthy': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'Healthy': return <CheckCircle size={18} />;
      case 'Moderate': return <AlertTriangle size={18} />;
      case 'Unhealthy': return <XCircle size={18} />;
      default: return null;
    }
  };

  const translateHealth = (rating: string) => {
      if (rating === 'Healthy') return t.healthy;
      if (rating === 'Moderate') return t.moderate;
      if (rating === 'Unhealthy') return t.unhealthy;
      return rating;
  };

  const mealTypes = [
    { type: MealType.Breakfast, icon: Coffee, label: t.breakfast },
    { type: MealType.Lunch, icon: Sun, label: t.lunch },
    { type: MealType.Dinner, icon: Moon, label: t.dinner },
    { type: MealType.Snack, icon: Apple, label: t.snack },
  ];

  return (
    <div className="fixed inset-0 bg-slate-50 z-40 overflow-y-auto pb-24">
      {/* Header Image or Placeholder */}
      <div className="relative h-64 w-full bg-slate-200">
        {result.imageUrl ? (
           <img src={result.imageUrl} alt="Analyzed food" className="w-full h-full object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200">
               <Apple size={64} />
           </div>
        )}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
             <button onClick={onDiscard} className="text-white font-medium flex items-center gap-1">
                <ChevronDown size={20} /> {t.back}
             </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{result.totalCalories} <span className="text-sm font-normal text-slate-500">kcal</span></h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t.totalEnergy}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-sm font-semibold ${getRatingColor(result.healthRating)}`}>
                    {getRatingIcon(result.healthRating)}
                    {translateHealth(result.healthRating)}
                </div>
            </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Meal Type Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3">{t.selectMealType}</h3>
            <div className="grid grid-cols-4 gap-2">
                {mealTypes.map((m) => (
                    <button
                        key={m.type}
                        onClick={() => setSelectedMealType(m.type)}
                        className={`flex flex-col items-center p-3 rounded-xl border transition ${
                            selectedMealType === m.type 
                            ? 'bg-green-50 border-green-500 text-green-700' 
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <m.icon size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">{m.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
             <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                <div className="text-blue-500 font-bold text-lg">{result.totalMacros.protein}g</div>
                <div className="text-xs text-slate-400 font-medium uppercase">{t.protein}</div>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                <div className="text-orange-500 font-bold text-lg">{result.totalMacros.carbs}g</div>
                <div className="text-xs text-slate-400 font-medium uppercase">{t.carbs}</div>
             </div>
             <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                <div className="text-yellow-500 font-bold text-lg">{result.totalMacros.fats}g</div>
                <div className="text-xs text-slate-400 font-medium uppercase">{t.fats}</div>
             </div>
        </div>

        {/* Food Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4">{t.detectedItems}</h3>
            <div className="space-y-4">
                {result.foodItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                        <div>
                            <p className="font-medium text-slate-700">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.weight}</p>
                        </div>
                        <div className="text-end">
                             <p className="font-semibold text-slate-800">{item.calories}</p>
                             <p className="text-xs text-slate-400">kcal</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Suggestion */}
        <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Check size={18} /> {t.aiSuggestion}
            </h3>
            <p className="text-green-700 text-sm leading-relaxed">
                {result.suggestions}
            </p>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3">
        <button onClick={onDiscard} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">
            {t.discard}
        </button>
        <button onClick={() => onSave(selectedMealType)} className="flex-1 py-3.5 rounded-xl bg-green-600 text-white font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition">
            {t.saveEntry}
        </button>
      </div>
    </div>
  );
};

export default AnalysisResult;
