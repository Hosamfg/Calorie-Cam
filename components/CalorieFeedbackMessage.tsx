import React from 'react';
import { Language } from '../types';
import { translations } from '../services/translations';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface Props {
  consumed: number;
  goal: number;
  language: Language;
}

const CalorieFeedbackMessage: React.FC<Props> = ({ consumed, goal, language }) => {
  const t = translations[language];
  const diff = goal - consumed;
  const absDiff = Math.abs(diff);

  // Logic to determine status
  let status: 'deficit' | 'surplus' | 'goal' = 'deficit';
  if (diff < -50) status = 'surplus'; // Exceeded by more than 50
  else if (Math.abs(diff) <= 50) status = 'goal'; // Within +/- 50 range

  let message = '';
  let colorClass = '';
  let icon = null;

  if (status === 'deficit') {
    message = t.feedbackDeficit.replace('{amount}', absDiff.toString());
    colorClass = 'bg-green-50 text-green-700 border-green-100';
    icon = <CheckCircle2 size={20} className="flex-shrink-0" />;
  } else if (status === 'surplus') {
    message = t.feedbackSurplus.replace('{amount}', absDiff.toString());
    colorClass = 'bg-red-50 text-red-700 border-red-100';
    icon = <AlertTriangle size={20} className="flex-shrink-0" />;
  } else {
    message = t.feedbackGoal;
    colorClass = 'bg-blue-50 text-blue-700 border-blue-100';
    icon = <Info size={20} className="flex-shrink-0" />;
  }

  return (
    <div className={`mx-4 mt-2 p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${colorClass}`}>
      {icon}
      <p className="text-sm font-medium leading-relaxed">
        {message}
      </p>
    </div>
  );
};

export default CalorieFeedbackMessage;
