import React from 'react';
import { AnalysisResult, UserProfile, Language } from '../types';
import { translations } from '../services/translations';
import { getDaysInMonth, startOfMonth, getDay, format, isSameDay } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Props {
  history: AnalysisResult[];
  profile: UserProfile;
  language: Language;
}

const CalendarView: React.FC<Props> = ({ history, profile, language }) => {
  const t = translations[language];
  const now = new Date();
  const currentMonth = now;
  const daysInMonth = getDaysInMonth(currentMonth);
  const startDay = startOfMonth(currentMonth);
  const startDayIndex = getDay(startDay); // 0 = Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
    const dayHistory = history.filter(h => isSameDay(new Date(h.timestamp), date));
    const totalCalories = dayHistory.reduce((sum, h) => sum + h.totalCalories, 0);
    
    let status = 'none';
    if (dayHistory.length > 0) {
      if (totalCalories <= profile.tdee) status = 'success';
      else if (totalCalories <= profile.tdee + 200) status = 'warning';
      else status = 'danger';
    }

    return { date, totalCalories, status };
  });

  // Adjust start index for Sunday start
  const blanks = Array.from({ length: startDayIndex }, (_, i) => i);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.calendar}</h1>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="text-center font-bold text-lg mb-6 text-slate-800">
           {format(currentMonth, 'MMMM yyyy', { locale: language === 'ar' ? ar : enUS })}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-slate-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
           {blanks.map(b => <div key={`blank-${b}`} />)}
           {days.map((day) => (
             <div key={day.date.toISOString()} className="aspect-square flex flex-col items-center justify-center relative rounded-xl hover:bg-slate-50 transition">
                <span className={`text-sm font-medium ${isSameDay(day.date, now) ? 'text-green-600 font-bold' : 'text-slate-700'}`}>
                  {day.date.getDate()}
                </span>
                {day.status !== 'none' && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    day.status === 'success' ? 'bg-green-500' :
                    day.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
                  }`} />
                )}
             </div>
           ))}
        </div>

        <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> {t.goal}</div>
           <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> {t.surplus}</div>
        </div>
      </div>
      
      {/* Daily Summary for Today */}
      <div className="mt-6">
        <h2 className="font-bold text-slate-800 mb-3">{t.dailyProgress}</h2>
        {/* Reuse simple stat card */}
      </div>
    </div>
  );
};

export default CalendarView;
