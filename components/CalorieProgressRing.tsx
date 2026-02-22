import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Language } from '../types';
import { translations } from '../services/translations';

interface Props {
  consumed: number;
  goal: number;
  language: Language;
}

const CalorieProgressRing: React.FC<Props> = ({ consumed, goal, language }) => {
  const t = translations[language];
  
  // Calculate remaining, ensure non-negative for the chart
  const remaining = Math.max(0, goal - consumed);
  const isSurplus = consumed > goal;

  const data = [
    { name: 'Consumed', value: consumed, color: isSurplus ? '#ef4444' : '#16a34a' }, // Red if surplus, Green if good
    { name: 'Remaining', value: remaining, color: '#f1f5f9' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-4 relative">
      <div className="w-64 h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={80}
              outerRadius={95}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-4xl font-extrabold ${isSurplus ? 'text-red-500' : 'text-slate-800'}`}>
            {consumed}
          </span>
          <span className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wide">
            kcal
          </span>
        </div>
      </div>
      
      {/* Bottom Text */}
      <div className="mt-[-10px]">
        <span className="text-sm font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          {t.goal}: <span className="text-slate-700">{goal} kcal</span>
        </span>
      </div>
    </div>
  );
};

export default CalorieProgressRing;
