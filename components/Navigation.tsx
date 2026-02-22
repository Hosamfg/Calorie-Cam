
import React from 'react';
import { ViewState, Language } from '../types';
import { translations } from '../services/translations';
import { Home, Calendar, PieChart, Clock, User } from 'lucide-react';

interface Props {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  language: Language;
}

const Navigation: React.FC<Props> = ({ currentView, onChangeView, language }) => {
  const t = translations[language];

  const items = [
    { id: 'DASHBOARD' as ViewState, icon: Home, label: t.dashboard },
    { id: 'HISTORY' as ViewState, icon: Clock, label: t.history },
    { id: 'CALENDAR' as ViewState, icon: Calendar, label: t.calendar },
    { id: 'BODY' as ViewState, icon: User, label: t.body },
    { id: 'ANALYTICS' as ViewState, icon: PieChart, label: t.analytics },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={22} className={isActive ? 'fill-green-100' : ''} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
