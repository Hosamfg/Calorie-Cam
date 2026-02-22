import React from 'react';
import { Language } from '../types';
import { translations } from '../services/translations';

interface Props {
  calories: number;
  goal: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  language: Language;
}

const TodaySummaryCard: React.FC<Props> = ({ calories, goal, macros, language }) => {
  const t = translations[language];
  const diff = goal - calories;
  const absDiff = Math.abs(diff);
  const isSurplus = diff < 0;
  
  // Status Logic
  let statusText = '';
  let statusColor = '';
  let statusBg = '';

  if (Math.abs(diff) < 50) {
    statusText = t.statusPerfect;
    statusColor = 'text-green-700';
    statusBg = 'bg-green-100';
  } else if (isSurplus) {
    statusText = t.statusSurplus.replace('{amount}', absDiff.toString());
    statusColor = 'text-red-700';
    statusBg = 'bg-red-50';
  } else {
    statusText = t.statusDeficit.replace('{amount}', absDiff.toString());
    statusColor = 'text-green-700';
    statusBg = 'bg-green-50';
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-2">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-slate-500 font-semibold text-xs uppercase tracking-wider">{t.todaySummary}</h2>
          <div className="text-xl mt-1 font-bold text-slate-800">
             {calories} <span className="text-slate-400 font-normal text-sm">/ {goal} {t.kcal}</span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusBg} ${statusColor}`}>
          {statusText}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
           <div className="text-xs text-slate-500 font-medium mb-1">{t.protein}</div>
           <div className="font-bold text-blue-600 text-lg">{Math.round(macros.protein)}g</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
           <div className="text-xs text-slate-500 font-medium mb-1">{t.carbs}</div>
           <div className="font-bold text-orange-600 text-lg">{Math.round(macros.carbs)}g</div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center">
           <div className="text-xs text-slate-500 font-medium mb-1">{t.fats}</div>
           <div className="font-bold text-yellow-600 text-lg">{Math.round(macros.fats)}g</div>
        </div>
      </div>
    </div>
  );
};

export default TodaySummaryCard;
