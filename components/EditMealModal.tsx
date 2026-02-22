import React, { useState } from 'react';
import { AnalysisResult, Language, MealType } from '../types';
import { translations } from '../services/translations';
import { X, Save, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  item: AnalysisResult;
  language: Language;
  onSave: (updatedItem: AnalysisResult) => void;
  onClose: () => void;
}

const EditMealModal: React.FC<Props> = ({ item, language, onSave, onClose }) => {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  // Local state for form fields
  const [name, setName] = useState(item.foodItems.map(f => f.name).join(', '));
  const [calories, setCalories] = useState(item.totalCalories);
  const [protein, setProtein] = useState(item.totalMacros.protein);
  const [carbs, setCarbs] = useState(item.totalMacros.carbs);
  const [fats, setFats] = useState(item.totalMacros.fats);
  const [mealType, setMealType] = useState(item.mealType);
  
  // Date and Time handling
  const [dateStr, setDateStr] = useState(format(new Date(item.timestamp), 'yyyy-MM-dd'));
  const [timeStr, setTimeStr] = useState(format(new Date(item.timestamp), 'HH:mm'));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reconstruct timestamp
    const newTimestamp = new Date(`${dateStr}T${timeStr}`).getTime();

    // Create updated item
    // Note: We are simplifying multiple food items into one representative name edit
    // In a complex app, we might edit each item individually.
    const updatedFoodItems = [...item.foodItems];
    if (updatedFoodItems.length > 0) {
        updatedFoodItems[0] = { ...updatedFoodItems[0], name: name };
        // If there were multiple items, we only renamed the first or this is a simplification.
        // For accurate macro editing, we ideally redistribute, but here we update the totals directly on the parent object.
        // We will assume the totalMacros override the individual items for display purposes if not recalculated.
    }

    const updatedItem: AnalysisResult = {
      ...item,
      timestamp: newTimestamp,
      mealType,
      totalCalories: Number(calories),
      totalMacros: {
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats)
      },
      // If the user changed the name heavily, we update the first food item name for consistency
      foodItems: updatedFoodItems.length ? updatedFoodItems : [{ 
          name, 
          calories: Number(calories), 
          weight: 'N/A', 
          macros: { protein: Number(protein), carbs: Number(carbs), fats: Number(fats) } 
      }]
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">{t.editMeal}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.mealName}</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar size={14} /> {t.date}
                  </label>
                  <input 
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Clock size={14} /> {t.time}
                  </label>
                  <input 
                    type="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-slate-50"
                  />
               </div>
            </div>

            {/* Meal Type */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{t.selectMealType}</label>
                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                    {[MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setMealType(type)}
                            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                                mealType === type 
                                ? 'bg-white text-green-700 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {t[type.toLowerCase() as keyof typeof t] || type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calories & Macros */}
            <div className="space-y-3">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{t.totalEnergy} (kcal)</label>
                 <input 
                    type="number" 
                    value={calories} 
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-slate-800"
                  />
               </div>
               <div className="grid grid-cols-3 gap-3">
                   <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">{t.protein} (g)</label>
                       <input 
                          type="number" 
                          value={protein}
                          onChange={(e) => setProtein(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">{t.carbs} (g)</label>
                       <input 
                          type="number" 
                          value={carbs}
                          onChange={(e) => setCarbs(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-center"
                       />
                   </div>
                   <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">{t.fats} (g)</label>
                       <input 
                          type="number" 
                          value={fats}
                          onChange={(e) => setFats(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-center"
                       />
                   </div>
               </div>
            </div>
            
            <button 
                type="submit"
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center justify-center gap-2 mt-4"
            >
                <Save size={18} />
                {t.save}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMealModal;
