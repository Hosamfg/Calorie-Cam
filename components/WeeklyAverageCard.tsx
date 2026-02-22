import React from 'react';
import { AnalysisResult, Language } from '../types';
import { translations } from '../services/translations';
import { isSameDay, subDays } from 'date-fns';

interface Props {
  history: AnalysisResult[];
  goal: number;
  language: Language;
  date: Date; // Use selected date instead of today
}

const WeeklyAverageCard: React.FC<Props> = ({ history, goal, language, date }) => {
  const t = translations[language];

  // Calculate stats for the last 7 days ending at `date`
  let totalCalories = 0;
  let daysWithData = 0;

  for (let i = 0; i < 7; i++) {
    const d = subDays(date, i);
    const dayMeals = history.filter(h => isSameDay(new Date(h.timestamp), d));
    
    if (dayMeals.length > 0) {
      const dayTotal = dayMeals.reduce((sum, h) => sum + h.totalCalories, 0);
      totalCalories += dayTotal;
      daysWithData++;
    }
  }
  
  // Avoid division by zero
  const average = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
  const isGood = average > 0 && average <= goal;

  // Percentage for the bar
  const percentage = Math.min(100, (average / goal) * 100);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
      <div className="flex justify-between items-center mb-3">
         <h2 className="font-bold text-slate-800">{t.weeklyAverage}</h2>
         {average > 0 && (
           <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isGood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isGood ? t.goodProgress : t.aboveGoal}
           </span>
         )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-3">
         <span className="text-4xl font-extrabold text-slate-900">{average}</span>
         <span className="text-slate-500 font-medium">{t.perDay}</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
             className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-green-500' : 'bg-red-500'}`} 
             style={{ width: `${percentage}%` }}
          />
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400 font-medium">
          <span>0</span>
          <span>{t.goal}: {goal}</span>
      </div>
    </div>
  );
};

export default WeeklyAverageCard;
