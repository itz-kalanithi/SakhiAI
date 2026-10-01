import React, { useState } from 'react';
import { 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Settings, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageCode } from '../types';
import { AVAILABLE_STATES } from '../services/locationService';

export const Header: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { 
    language, 
    setLanguage, 
    location, 
    requestLocation, 
    setManualLocationState,
    navigateTo, 
    isMuted, 
    toggleMute,
    isDemoMode,
    toggleDemoMode,
    speakMessage,
  } = useApp();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setLanguage(langCode);
    setShowLangMenu(false);
    const selected = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    if (selected) {
      speakMessage(selected.greetingText);
    }
  };

  const handleSelectState = (stateName: string) => {
    setManualLocationState(stateName);
    setShowLocationMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 px-3 sm:px-4 py-2.5 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        {/* Logo and Tagline */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-200">
            <span className="font-bold text-lg">स</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Sakhi<span className="text-rose-600">AI</span>
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
                {currentLangObj.nativeName}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none">
              Voice Navigation Layer
            </p>
          </div>
        </div>

        {/* Action icons & controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick SOS Shortcut */}
          <button
            onClick={() => navigateTo('emergency')}
            type="button"
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95"
            title="Immediate Emergency SOS"
          >
            <AlertTriangle size={14} className="animate-bounce" />
            <span className="hidden xs:inline">SOS</span>
          </button>

          {/* Location Picker / GPS */}
          <div className="relative">
            <button
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              type="button"
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2 py-1.5 rounded-xl transition-colors"
              title="Change region / GPS"
            >
              <MapPin size={13} className={location.isPermissionGranted ? 'text-emerald-600' : 'text-slate-500'} />
              <span className="max-w-[70px] truncate text-[11px] font-medium hidden sm:inline">
                {location.state.split(' ')[0]}
              </span>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {/* Location Dropdown */}
            {showLocationMenu && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="px-2 py-1 mb-1 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Select Region</span>
                  <button 
                    onClick={requestLocation}
                    className="text-[10px] text-rose-600 hover:underline font-semibold"
                  >
                    Auto GPS
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {AVAILABLE_STATES.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleSelectState(st)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl transition-colors ${
                        location.state === st
                          ? 'bg-rose-50 text-rose-700 font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              type="button"
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-2 py-1.5 rounded-xl border border-rose-200 transition-colors"
              title="Change Language"
            >
              <Globe size={13} />
              <span className="text-[11px]">{currentLangObj.nativeName}</span>
              <ChevronDown size={11} className="text-rose-400" />
            </button>

            {/* Language Dropdown */}
            {showLangMenu && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-2xl border border-rose-100 p-1.5 z-50 animate-in fade-in">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Choose Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? 'bg-rose-600 text-white font-bold'
                        : 'hover:bg-rose-50 text-slate-700 font-medium'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className={`text-[10px] ${language === lang.code ? 'text-rose-200' : 'text-slate-400'}`}>
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Mute / Unmute */}
          <button
            onClick={toggleMute}
            type="button"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX size={17} className="text-red-500" /> : <Volume2 size={17} className="text-slate-600" />}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            type="button"
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            title="Settings & API Key"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Demo / Live Status Banner */}
      <div className="max-w-lg mx-auto mt-1 flex items-center justify-between text-[11px] px-1 text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className="font-medium">
            {isDemoMode ? 'Demo Simulation Mode (Safe for Testing)' : 'Live Gemini AI Mode'}
          </span>
        </div>
        <button
          onClick={toggleDemoMode}
          className="text-rose-700 hover:text-rose-900 font-semibold underline text-[10px]"
        >
          {isDemoMode ? 'Switch to Live' : 'Switch to Demo'}
        </button>
      </div>
    </header>
  );
};
