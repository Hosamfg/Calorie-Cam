
import React from 'react';
import { AnalysisResult, Language } from '../types';
import { translations } from '../services/translations';
import { Trash2, Copy, FileText } from 'lucide-react';

interface Props {
  history: AnalysisResult[];
  language: Language;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const HistoryView: React.FC<Props> = ({ history, language, onDelete, onDuplicate }) => {
  const t = translations[language];

  // Group by date
  const groupedHistory = history.reduce((groups, item) => {
    const dateKey = new Date(item.timestamp).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, AnalysisResult[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
  };

  const getMealTypeLabel = (type: string) => {
    switch(type) {
      case 'Breakfast': return t.breakfast;
      case 'Lunch': return t.lunch;
      case 'Dinner': return t.dinner;
      case 'Snack': return t.snack;
      default: return type;
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDelete(id);
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onDuplicate(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-4">
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t.history}</h1>
      </div>

      <div className="space-y-6 px-4">
        {sortedDates.length === 0 ? (
           <div className="text-center py-12 text-slate-400">
             <p>{t.noMeals}</p>
           </div>
        ) : (
          sortedDates.map((dateKey) => {
            const items = groupedHistory[dateKey];
            const dailyTotal = items.reduce((sum, i) => sum + i.totalCalories, 0);

            return (
              <div key={dateKey}>
                <div className="flex justify-between items-center px-2 mb-2">
                  <h3 className="font-semibold text-slate-700">{formatDate(dateKey)}</h3>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {dailyTotal} {t.kcal}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
                       <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                          {item.imageUrl ? (
                              <img src={item.imageUrl} alt="Food" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <FileText size={20} />
                              </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">
                            {getMealTypeLabel(item.mealType)}
                          </div>
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                          <h4 className="font-semibold text-slate-800 truncate">{item.foodItems.map(f => f.name).join(', ')}</h4>
                          <div className="flex gap-3 mt-1 text-xs text-slate-500">
                             <span>P: {Math.round(item.totalMacros.protein)}g</span>
                             <span>C: {Math.round(item.totalMacros.carbs)}g</span>
                             <span>F: {Math.round(item.totalMacros.fats)}g</span>
                          </div>
                      </div>
                      <div className="flex flex-col justify-between items-end py-1 gap-2">
                          <span className="font-bold text-green-600 text-sm">{item.totalCalories}</span>
                          <div className="flex gap-1">
                             <button 
                                onClick={(e) => handleDuplicate(e, item.id)}
                                className="text-slate-400 hover:text-blue-500 p-1"
                                aria-label={t.duplicate}
                              >
                                <Copy size={16} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(e, item.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                aria-label={t.delete}
                              >
                                <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryView;
