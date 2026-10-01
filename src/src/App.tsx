import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { VoiceDebugPanel } from './components/VoiceDebugPanel';
import { BottomNav } from './components/BottomNav';
import { SettingsModal } from './components/SettingsModal';

import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { EducationScreen } from './screens/EducationScreen';
import { SchemesScreen } from './screens/SchemesScreen';
import { SchemeApplyScreen } from './screens/SchemeApplyScreen';
import { RightsScreen } from './screens/RightsScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { ComplaintScreen } from './screens/ComplaintScreen';

export const MainApp: React.FC = () => {
  const { currentScreen } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen />;
      case 'home':
        return <HomeScreen />;
      case 'education':
        return <EducationScreen />;
      case 'schemes':
        return <SchemesScreen />;
      case 'scheme-apply':
        return <SchemeApplyScreen />;
      case 'rights':
        return <RightsScreen />;
      case 'emergency':
        return <EmergencyScreen />;
      case 'complaint':
        return <ComplaintScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isOnboarding = currentScreen === 'onboarding';

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile container viewport */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative flex flex-col shadow-2xl overflow-x-hidden border-x border-slate-200">
        {!isOnboarding && (
          <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        )}

        <main className="flex-1 overflow-y-auto">
          {renderScreen()}
        </main>

        <VoiceAssistantBar />
        {!isOnboarding && <BottomNav />}

        <VoiceDebugPanel />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
};
