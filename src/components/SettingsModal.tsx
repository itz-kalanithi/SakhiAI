import React, { useState } from 'react';
import { X, Key, ShieldCheck, Info, Sparkles, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { geminiApiKey, setGeminiApiKey, isDemoMode, toggleDemoMode, location } = useApp();
  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(inputKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">SakhiAI Settings</h3>
              <p className="text-xs text-slate-500">Gemini AI & Environment Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Gemini API Key Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key size={14} className="text-rose-600" />
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Supports Gemini 1.5/2.0 Flash. If left empty, SakhiAI automatically uses intelligent built-in multilingual conversational fallbacks so testing never fails.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
            >
              {savedSuccess ? <Check size={14} /> : null}
              {savedSuccess ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </form>

        {/* Demo Mode Toggle */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">Demo Simulation Mode</span>
              <p className="text-[11px] text-slate-500">
                Simulates real-world government form submissions and FIR generation safely without external credentials.
              </p>
            </div>
            <button
              onClick={toggleDemoMode}
              type="button"
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isDemoMode ? 'bg-rose-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isDemoMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Device Information */}
        <div className="bg-blue-50/60 rounded-2xl p-3 border border-blue-100 text-xs text-blue-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-blue-800">
            <ShieldCheck size={15} />
            <span>Privacy & Device Status</span>
          </div>
          <p className="text-[11px] text-blue-700">
            Current Region: <span className="font-semibold">{location.state} ({location.district})</span>
          </p>
          <p className="text-[11px] text-blue-700">
            GPS Status: <span className="font-semibold">{location.isPermissionGranted ? 'GPS Active' : 'Manual / Approximate'}</span>
          </p>
          <p className="text-[11px] text-blue-600 italic pt-1 border-t border-blue-200/50">
            SakhiAI strictly preserves user privacy. No audio is ever stored on external disks.
          </p>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
