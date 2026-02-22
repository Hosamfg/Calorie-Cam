import React, { useState } from 'react';
import { UserProfile, Gender, Goal, Language } from '../types';
import { saveProfile } from '../services/storageService';
import { translations } from '../services/translations';
import { Calculator, ChevronRight, ChevronLeft, User } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
  language: Language;
}

const ProfileSetup: React.FC<Props> = ({ onComplete, language }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: Gender.Male,
    goal: Goal.Maintain,
  });

  const t = translations[language];
  const isRTL = language === 'ar';

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTDEE = (data: Partial<UserProfile>): number => {
    const w = data.weight || 70;
    const h = data.height || 170;
    const a = data.age || 25;
    let bmr = 10 * w + 6.25 * h - 5 * a;
    
    if (data.gender === Gender.Male) {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    let tdee = bmr * 1.2; 

    if (data.goal === Goal.LoseWeight) return Math.round(tdee - 500);
    if (data.goal === Goal.GainMuscle) return Math.round(tdee + 300);
    return Math.round(tdee);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const finalProfile = {
        ...formData,
        tdee: calculateTDEE(formData),
        language: language
      } as UserProfile;
      
      saveProfile(finalProfile);
      onComplete(finalProfile);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <User size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t.letsKnowYou}</h1>
          <p className="text-slate-500 mt-2">{t.detailsRequest}</p>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.firstName}</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-start"
                placeholder={language === 'ar' ? 'مثل: أحمد' : 'e.g. Alex'}
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.gender}</label>
              <div className="grid grid-cols-2 gap-3">
                {[Gender.Male, Gender.Female].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleChange('gender', g)}
                    className={`p-3 rounded-xl border text-sm font-medium transition ${
                      formData.gender === g
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-green-400'
                    }`}
                  >
                    {g === Gender.Male ? t.male : t.female}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.age}</label>
                <input
                  type="number"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-start"
                  placeholder="25"
                  value={formData.age || ''}
                  onChange={(e) => handleChange('age', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.height}</label>
                <input
                  type="number"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-start"
                  placeholder="170"
                  value={formData.height || ''}
                  onChange={(e) => handleChange('height', parseInt(e.target.value))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.weight}</label>
                <input
                  type="number"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-start"
                  placeholder="70"
                  value={formData.weight || ''}
                  onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
             <label className="block text-sm font-medium text-slate-700 mb-1">{t.yourGoal}</label>
             <div className="space-y-3">
                {[Goal.LoseWeight, Goal.Maintain, Goal.GainMuscle].map((g) => {
                  let label = t.maintain;
                  if (g === Goal.LoseWeight) label = t.loseWeight;
                  if (g === Goal.GainMuscle) label = t.gainMuscle;

                  return (
                    <button
                      key={g}
                      onClick={() => handleChange('goal', g)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between transition ${
                        formData.goal === g
                          ? 'bg-green-50 border-green-600 ring-1 ring-green-600'
                          : 'bg-white border-slate-200 hover:border-green-400'
                      }`}
                    >
                      <span className={`font-medium ${formData.goal === g ? 'text-green-800' : 'text-slate-700'}`}>{label}</span>
                      {formData.goal === g && <Calculator size={18} className="text-green-600" />}
                    </button>
                  );
                })}
             </div>
          </div>
        )}

        <div className="mt-8 flex gap-3">
            {step > 1 && (
                <button 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-4 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition"
                >
                    {t.back}
                </button>
            )}
            <button
            onClick={handleNext}
            disabled={!formData.name && step === 1}
            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-green-200 hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
            {step === 3 ? t.finish : t.next}
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
        </div>
        
        <div className="flex justify-center mt-6 gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-green-500' : 'w-2 bg-slate-200'}`} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
