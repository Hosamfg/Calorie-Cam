
import React, { useState, useMemo } from 'react';
import { UserProfile, Language, WeightEntry, MeasurementsEntry } from '../types';
import { translations } from '../services/translations';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Ruler, Activity, Info, User } from 'lucide-react';

interface Props {
  profile: UserProfile;
  weightHistory: WeightEntry[];
  measurementsHistory: MeasurementsEntry[];
  language: Language;
  onSaveWeight: (entry: WeightEntry) => void;
  onSaveMeasurements: (entry: MeasurementsEntry) => void;
  selectedDate: Date;
}

const BodyView: React.FC<Props> = ({ profile, weightHistory, measurementsHistory, language, onSaveWeight, onSaveMeasurements, selectedDate }) => {
  const t = translations[language];
  const isRTL = language === 'ar';
  
  // Forms state
  const [weightInput, setWeightInput] = useState<string>(profile.weight.toString());
  const [weightDate, setWeightDate] = useState<string>(format(selectedDate, 'yyyy-MM-dd'));
  
  const [waistInput, setWaistInput] = useState<string>('');
  const [hipInput, setHipInput] = useState<string>('');
  const [chestInput, setChestInput] = useState<string>('');
  const [measDate, setMeasDate] = useState<string>(format(selectedDate, 'yyyy-MM-dd'));

  // --- Calculations ---

  const currentWeight = weightHistory.length > 0 ? weightHistory[0].weightKg : profile.weight;
  
  // BMI
  const heightM = profile.height / 100;
  const bmi = heightM > 0 ? (currentWeight / (heightM * heightM)).toFixed(1) : 'N/A';
  
  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: t.underweight, color: 'text-blue-600 bg-blue-50' };
    if (val < 25) return { label: t.normalWeight, color: 'text-green-600 bg-green-50' };
    if (val < 30) return { label: t.overweight, color: 'text-orange-600 bg-orange-50' };
    return { label: t.obese, color: 'text-red-600 bg-red-50' };
  };
  
  const bmiVal = parseFloat(bmi);
  const bmiCat = !isNaN(bmiVal) ? getBMICategory(bmiVal) : { label: '', color: '' };

  // Body Shape
  const latestMeas = measurementsHistory.length > 0 ? measurementsHistory[0] : null;
  
  const getBodyShape = (m: MeasurementsEntry) => {
    const waist = m.waistCm;
    const hip = m.hipCm;
    const chest = m.chestCm || hip; // Fallback if chest not provided

    // Simple Heuristics
    if ((hip - waist >= 20) && (chest - waist >= 20)) return t.shapeHourglass;
    if ((hip - waist >= 20) && (chest - waist < 20)) return t.shapePear;
    if (waist > hip) return t.shapeApple;
    if ((chest - waist >= 20) && (chest > hip)) return t.shapeInvertedTriangle;
    return t.shapeRectangle;
  };
  
  const currentShape = latestMeas ? getBodyShape(latestMeas) : '-';

  // --- Handlers ---
  
  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightInput) return;
    onSaveWeight({
      id: crypto.randomUUID(),
      date: weightDate,
      weightKg: parseFloat(weightInput)
    });
    alert(t.save);
  };

  const handleSaveMeas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waistInput || !hipInput) return;
    onSaveMeasurements({
      id: crypto.randomUUID(),
      date: measDate,
      waistCm: parseFloat(waistInput),
      hipCm: parseFloat(hipInput),
      chestCm: chestInput ? parseFloat(chestInput) : undefined
    });
    setWaistInput(''); setHipInput(''); setChestInput('');
    alert(t.save);
  };

  // --- Charts Data ---
  
  const weightChartData = useMemo(() => {
    return [...weightHistory].reverse().map(w => ({
      date: format(new Date(w.date), 'dd/MM'),
      weight: w.weightKg
    }));
  }, [weightHistory]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.body}</h1>
      
      {/* 1. BMI Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4 flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-slate-500 font-semibold text-xs uppercase tracking-wider mb-1">{t.currentBMI}</h2>
          <div className="text-4xl font-extrabold text-slate-800">{bmi}</div>
          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${bmiCat.color}`}>
             {bmiCat.label}
          </div>
        </div>
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-200">
           <Activity size={48} />
        </div>
      </div>

      {/* 2. Body Shape Card */}
      {latestMeas && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg mb-6 text-white relative overflow-hidden">
           <div className="relative z-10">
              <h2 className="text-white/80 font-semibold text-xs uppercase tracking-wider mb-2">{t.bodyShape}</h2>
              <div className="text-2xl font-bold flex items-center gap-2">
                 <User size={24} /> {currentShape}
              </div>
              <p className="text-xs text-white/70 mt-2">
                 {t.waist}: {latestMeas.waistCm} • {t.hip}: {latestMeas.hipCm}
              </p>
           </div>
           <User size={120} className="absolute -bottom-4 -right-4 text-white/10" />
        </div>
      )}

      {/* 3. Weight Input */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
         <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Scale size={18} className="text-green-600" /> {t.addWeight}
         </h2>
         <form onSubmit={handleSaveWeight} className="space-y-3">
             <input 
               type="date" 
               value={weightDate} 
               onChange={e => setWeightDate(e.target.value)}
               className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-green-500"
             />
             <div className="flex gap-3">
                <input 
                   type="number" 
                   value={weightInput}
                   onChange={e => setWeightInput(e.target.value)}
                   placeholder="0.0"
                   step="0.1"
                   className="flex-1 p-3 bg-slate-50 rounded-xl text-lg font-bold outline-none focus:ring-1 focus:ring-green-500"
                />
                <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-bold text-sm">
                   {t.save}
                </button>
             </div>
         </form>
      </div>

      {/* 4. Measurements Input */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
         <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Ruler size={18} className="text-blue-600" /> {t.addMeasurements}
         </h2>
         <form onSubmit={handleSaveMeas} className="space-y-3">
             <input 
               type="date" 
               value={measDate} 
               onChange={e => setMeasDate(e.target.value)}
               className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-1 focus:ring-green-500"
             />
             <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="text-xs text-slate-400 font-medium ml-1">{t.waist}</label>
                    <input 
                      type="number" 
                      value={waistInput} onChange={e => setWaistInput(e.target.value)}
                      placeholder="cm"
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-slate-400 font-medium ml-1">{t.hip}</label>
                    <input 
                      type="number" 
                      value={hipInput} onChange={e => setHipInput(e.target.value)}
                      placeholder="cm"
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-slate-400 font-medium ml-1">{t.chest} ({t.saveMeasurements.includes('Optional') ? 'Opt' : ''})</label>
                    <input 
                      type="number" 
                      value={chestInput} onChange={e => setChestInput(e.target.value)}
                      placeholder="cm"
                      className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    />
                 </div>
             </div>
             <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm mt-2">
                 {t.saveMeasurements}
             </button>
         </form>
      </div>

      {/* 5. Weight Chart */}
      {weightChartData.length > 1 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
            <h2 className="font-bold text-slate-800 mb-4">{t.weightTrend}</h2>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData}>
                      <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={3} dot={{r: 4, fill: '#16a34a'}} activeDot={{r: 6}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
};

export default BodyView;
