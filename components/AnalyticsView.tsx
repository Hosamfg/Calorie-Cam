import React, { useMemo } from 'react';
import { AnalysisResult, UserProfile, Language } from '../types';
import { translations } from '../services/translations';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WeeklyAverageCard from './WeeklyAverageCard';

interface Props {
  history: AnalysisResult[];
  profile: UserProfile;
  language: Language;
  date: Date;
}

const AnalyticsView: React.FC<Props> = ({ history, profile, language, date }) => {
  const t = translations[language];

  // 1. Macro Distribution (All time average)
  const macroData = useMemo(() => {
    if (history.length === 0) return [];
    
    const total = history.reduce((acc, item) => ({
      p: acc.p + item.totalMacros.protein,
      c: acc.c + item.totalMacros.carbs,
      f: acc.f + item.totalMacros.fats
    }), { p: 0, c: 0, f: 0 });

    const sum = total.p + total.c + total.f;
    if (sum === 0) return [];

    return [
      { name: t.protein, value: total.p, color: '#3b82f6' }, // blue-500
      { name: t.carbs, value: total.c, color: '#f97316' }, // orange-500
      { name: t.fats, value: total.f, color: '#eab308' }, // yellow-500
    ];
  }, [history, t]);

  // 2. Weekly Calories Trend
  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(date);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(d => {
        const dayStr = d.toDateString();
        const dailyCals = history
            .filter(h => new Date(h.timestamp).toDateString() === dayStr)
            .reduce((sum, h) => sum + h.totalCalories, 0);
        
        return {
            day: d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
            calories: dailyCals,
            goal: profile.tdee
        };
    });
  }, [history, profile.tdee, language, date]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.analytics}</h1>

      {/* Weekly Average Card (New Feature) */}
      <WeeklyAverageCard 
         history={history} 
         goal={profile.tdee} 
         language={language}
         date={date} // Using passed prop date as anchor for analytics view
      />

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
         <h2 className="font-bold text-slate-800 mb-4">{t.macroDistribution}</h2>
         <div className="h-64 flex items-center justify-center relative">
            {macroData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={macroData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {macroData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-slate-400">{t.noMeals}</p>
            )}
            {/* Center Legend */}
             {macroData.length > 0 && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xs text-slate-400 font-bold uppercase">{t.totalEnergy}</span>
                 </div>
             )}
         </div>
         {/* Legend below */}
         <div className="flex justify-center gap-4 mt-4">
             {macroData.map(m => (
                 <div key={m.name} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                     <span className="text-xs font-medium text-slate-600">{m.name}</span>
                 </div>
             ))}
         </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <h2 className="font-bold text-slate-800 mb-4">{t.weeklyTrend}</h2>
         <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={weeklyData}>
                     <XAxis 
                        dataKey="day" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        dy={10}
                     />
                     <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                        {weeklyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.calories > entry.goal ? '#ef4444' : '#16a34a'} />
                        ))}
                     </Bar>
                 </BarChart>
             </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
