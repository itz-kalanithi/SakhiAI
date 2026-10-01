import React from 'react';
import { Home, GraduationCap, Landmark, Scale, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScreenType } from '../types';

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo, t } = useApp();

  const navItems: { screen: ScreenType; label: string; icon: any }[] = [
    { screen: 'home', label: t('navHome'), icon: Home },
    { screen: 'education', label: t('navEducation'), icon: GraduationCap },
    { screen: 'schemes', label: t('navSchemes'), icon: Landmark },
    { screen: 'rights', label: t('navRights'), icon: Scale },
    { screen: 'emergency', label: t('navEmergency'), icon: AlertCircle },
  ];

  if (currentScreen === 'onboarding') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen || (item.screen === 'schemes' && currentScreen === 'scheme-apply');
          const isEmergency = item.screen === 'emergency';

          return (
            <button
              key={item.screen}
              onClick={() => navigateTo(item.screen)}
              type="button"
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all active:scale-90 ${
                isActive
                  ? isEmergency
                    ? 'text-red-600 font-bold scale-105'
                    : 'text-rose-600 font-bold scale-105'
                  : isEmergency
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${
                isActive 
                  ? isEmergency ? 'bg-red-50' : 'bg-rose-50'
                  : ''
              }`}>
                <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
