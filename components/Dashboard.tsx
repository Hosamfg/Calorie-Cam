
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { UserProfile, AnalysisResult, Language, MealType } from '../types';
import { translations } from '../services/translations';
import { Image as ImageIcon, ChevronLeft, ChevronRight, Calendar, MoreVertical, Trash2, Edit2, Copy } from 'lucide-react';
import { format, isSameDay, addDays, isToday, isYesterday, isTomorrow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import EditMealModal from './EditMealModal';
import CalorieProgressRing from './CalorieProgressRing';
import CalorieFeedbackMessage from './CalorieFeedbackMessage';
import QuickActions from './QuickActions';
import FloatingCameraButton from './FloatingCameraButton';
import TodaySummaryCard from './TodaySummaryCard';

interface Props {
  profile: UserProfile;
  history: AnalysisResult[];
  language: Language;
  onOpenCamera: (date?: Date) => void;
  onManualEntry: (date?: Date) => void;
  onImageSelected: (imageSrc: string) => void;
  onDeleteHistoryItem: (id: string) => void;
  onUpdateHistoryItem: (item: AnalysisResult) => void;
  onDuplicateHistoryItem: (id: string, date: Date) => void;
  date: Date;
  onDateChange: (date: Date) => void;
}

const Dashboard: React.FC<Props> = ({ 
  profile, 
  history, 
  language, 
  onOpenCamera, 
  onManualEntry, 
  onImageSelected,
  onDeleteHistoryItem,
  onUpdateHistoryItem,
  onDuplicateHistoryItem,
  date,
  onDateChange
}) => {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState<AnalysisResult | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenId]);

  // --- Calculations ---

  const selectedDateHistory = useMemo(() => {
    return history.filter(item => isSameDay(new Date(item.timestamp), date));
  }, [history, date]);

  const dayStats = useMemo(() => {
    return selectedDateHistory.reduce((acc, item) => ({
      calories: acc.calories + item.totalCalories,
      protein: acc.protein + item.totalMacros.protein,
      carbs: acc.carbs + item.totalMacros.carbs,
      fats: acc.fats + item.totalMacros.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [selectedDateHistory]);

  const groupedMeals = useMemo(() => {
    const groups: Record<string, AnalysisResult[]> = {
      [MealType.Breakfast]: [],
      [MealType.Lunch]: [],
      [MealType.Dinner]: [],
      [MealType.Snack]: [],
    };
    
    selectedDateHistory.forEach(item => {
      if (groups[item.mealType]) {
        groups[item.mealType].push(item);
      } else {
        groups[item.mealType] = [item];
      }
    });
    
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.timestamp - b.timestamp);
    });

    return groups;
  }, [selectedDateHistory]);

  const mealOrder = [MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack];

  // --- Handlers ---

  const handleDateChange = (delta: number) => {
    onDateChange(addDays(date, delta));
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.valueAsDate) {
      onDateChange(e.target.valueAsDate);
    }
  };

  const formatHeaderDate = (d: Date) => {
    if (isToday(d)) return t.today;
    if (isYesterday(d)) return t.yesterday;
    if (isTomorrow(d)) return t.tomorrow;
    return format(d, 'EEE, d MMM', { locale: isRTL ? ar : enUS });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Crucial: Stop event bubbling
    if (window.confirm(t.confirmDelete)) {
      setMenuOpenId(null); // Close menu first
      onDeleteHistoryItem(id); // Execute delete
    }
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDuplicateHistoryItem(id, date);
    setMenuOpenId(null);
  };

  const handleEdit = (e: React.MouseEvent, item: AnalysisResult) => {
    e.stopPropagation();
    setEditingItem(item);
    setMenuOpenId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-[120px]">
      {/* 1. Header */}
      <div className="bg-white px-4 pt-6 pb-2 sticky top-0 z-20 shadow-sm">
        <div className="flex justify-between items-center mb-4">
           <div>
             <h1 className="text-xl font-bold text-slate-800">{t.dashboard}</h1>
           </div>
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-xs">
             {profile.name[0]}
           </div>
        </div>
        
        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-1 border border-slate-100">
           <button onClick={() => handleDateChange(-1)} className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition">
             <ChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
           </button>
           
           <div className="relative flex items-center gap-2 font-bold text-slate-700">
              <Calendar size={18} className="text-green-600" />
              <span>{formatHeaderDate(date)}</span>
              <input 
                type="date" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleDatePick}
              />
           </div>

           <button onClick={() => handleDateChange(1)} className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-xl transition">
             <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
           </button>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* 2. Today Summary Card */}
        <TodaySummaryCard 
          calories={dayStats.calories} 
          goal={profile.tdee} 
          macros={dayStats} 
          language={language}
        />

        {/* 3. Calorie Progress Ring */}
        <CalorieProgressRing 
          consumed={dayStats.calories} 
          goal={profile.tdee} 
          language={language} 
        />

        {/* 4. Feedback Message */}
        <CalorieFeedbackMessage 
          consumed={dayStats.calories} 
          goal={profile.tdee} 
          language={language} 
        />

        {/* 5. Quick Actions */}
        <div className="-mx-4">
          <QuickActions 
            onScan={() => onOpenCamera(date)}
            onManual={() => onManualEntry(date)}
            onImageUpload={onImageSelected}
            language={language}
          />
        </div>

        {/* 6. Meals List */}
        <div className="pt-2">
            {mealOrder.map(type => {
                const meals = groupedMeals[type];
                if (meals.length === 0) return null;

                return (
                  <div key={type} className="mb-6 animate-fade-in">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {t[type.toLowerCase() as keyof typeof t] || type}
                      </h3>
                      <div className="space-y-3">
                        {meals.map(item => (
                            <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 relative">
                              {/* Image */}
                              <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt="Food" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={16} />
                                    </div>
                                  )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-800 truncate text-sm">{item.foodItems.map(f => f.name).join(', ')}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {format(new Date(item.timestamp), 'h:mm a')} • {item.totalCalories} {t.kcal}
                                  </p>
                              </div>

                              {/* Menu Button */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(menuOpenId === item.id ? null : item.id);
                                }} 
                                className="p-2 text-slate-400 hover:text-slate-600"
                              >
                                  <MoreVertical size={16} />
                              </button>

                              {/* Dropdown Menu */}
                              {menuOpenId === item.id && (
                                  <div ref={menuRef} className={`absolute top-10 ${isRTL ? 'left-2' : 'right-2'} bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-1 min-w-[140px] animate-fade-in`}>
                                    <button 
                                      onClick={(e) => handleEdit(e, item)}
                                      className="w-full text-start px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                                    >
                                        <Edit2 size={14} /> {t.edit}
                                    </button>
                                    <button 
                                      onClick={(e) => handleDuplicate(e, item.id)}
                                      className="w-full text-start px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50"
                                    >
                                        <Copy size={14} /> {t.duplicate}
                                    </button>
                                    <button 
                                      onClick={(e) => handleDelete(e, item.id)}
                                      className="w-full text-start px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> {t.delete}
                                    </button>
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                  </div>
                );
            })}
            
            {selectedDateHistory.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400 font-medium text-sm">{t.noMeals}</p>
                </div>
            )}
        </div>
      </div>

      {/* 7. Floating Camera Button */}
      <FloatingCameraButton onClick={() => onOpenCamera(date)} />

      {/* --- Edit Modal --- */}
      {editingItem && (
         <EditMealModal 
            item={editingItem}
            language={language}
            onSave={(updated) => {
               onUpdateHistoryItem(updated);
               setEditingItem(null);
            }}
            onClose={() => setEditingItem(null)}
         />
      )}
    </div>
  );
};

export default Dashboard;
