import React from 'react';
import { Mic, Volume2, Sparkles, MapPin, Square, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageCode } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { 
    voiceState, 
    startVoiceListening, 
    stopVoiceListening, 
    setLanguage, 
    navigateTo, 
    speakMessage, 
    stopSpeech,
    location, 
    transcript,
    assistantSpokenText
  } = useApp();

  const initialGreeting =
    'Hello! I am SakhiAI. Please speak to me in your preferred language. नमस्ते! मैं सखीAI हूँ। अपनी भाषा में बोलिए। வணக்கம்! நான் சகிAI. உங்கள் மொழியில் பேசுங்கள்.';

  const playGreetingAudio = () => {
    speakMessage(initialGreeting);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopVoiceListening();
    } else if (isSpeaking) {
      stopSpeech();
    } else {
      startVoiceListening();
    }
  };

  const handleSelectLanguageDirectly = (lang: LanguageCode) => {
    setLanguage(lang);
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    if (selected) {
      speakMessage(selected.greetingText, () => {
        navigateTo('home');
      });
    } else {
      navigateTo('home');
    }
  };

  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isProcessing = voiceState === 'processing';
  const isThinking = voiceState === 'thinking';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50/40 flex flex-col justify-between p-4 sm:p-6 max-w-lg mx-auto">
      {/* Top contextual badge */}
      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">
          <MapPin size={13} className="text-rose-600" />
          <span>Location: <strong>{location.state}</strong></span>
        </div>
        <button
          onClick={playGreetingAudio}
          type="button"
          className="flex items-center gap-1 text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-full font-bold transition-all shadow-sm active:scale-95"
        >
          <Volume2 size={14} className={isSpeaking ? 'animate-bounce' : ''} />
          <span>Hear Voice</span>
        </button>
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-xl shadow-rose-200 mb-5 animate-float">
          <span className="font-extrabold text-3xl">स</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Sakhi<span className="text-rose-600">AI</span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-xs mb-6 font-medium leading-relaxed">
          A voice-first assistant designed for women. Speak in Hindi, Tamil, Telugu, or any language.
        </p>

        {/* Central Giant Voice Button */}
        <div className="relative mb-5">
          {/* Animated wave rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 -m-6 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
              <div className="absolute inset-0 -m-12 rounded-full bg-rose-400/15 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={handleMicClick}
            type="button"
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 ${
              isListening
                ? 'bg-rose-600 text-white ring-8 ring-rose-200 animate-pulse'
                : isSpeaking
                ? 'bg-amber-600 text-white ring-8 ring-amber-100'
                : isThinking || isProcessing
                ? 'bg-indigo-600 text-white ring-8 ring-indigo-100'
                : 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white hover:scale-105 shadow-rose-300'
            }`}
          >
            {isListening ? (
              <Square size={40} className="fill-white" />
            ) : isSpeaking ? (
              <Square size={40} className="fill-white" />
            ) : isThinking || isProcessing ? (
              <Loader2 size={44} className="animate-spin text-white" />
            ) : (
              <Mic size={48} className="animate-pulse" />
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider mt-1.5">
              {isListening 
                ? 'Listening...' 
                : isProcessing 
                ? 'Processing...' 
                : isThinking 
                ? 'Detecting Lang...' 
                : isSpeaking 
                ? 'Speaking...' 
                : 'Tap & Speak'}
            </span>
          </button>
        </div>

        {/* Live Feedback / Transcript Display on Onboarding */}
        {(transcript || assistantSpokenText || isListening || isProcessing || isThinking) && (
          <div className="bg-white/95 rounded-2xl p-3 border border-rose-200/80 shadow-md max-w-sm w-full mb-4 text-xs">
            {isListening && (
              <div className="flex items-center justify-center gap-2 text-rose-700 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span>🎙️ Listening... Speak in your language, tap to finish</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold mb-1">
                <Loader2 size={13} className="animate-spin text-amber-600" />
                <span>Processing speech...</span>
              </div>
            )}
            {isThinking && (
              <div className="flex items-center justify-center gap-2 text-indigo-700 font-semibold mb-1">
                <Sparkles size={13} className="animate-spin text-indigo-600" />
                <span>AI is detecting language...</span>
              </div>
            )}
            {transcript && (
              <p className="text-slate-800 text-center font-medium my-1">
                <span className="font-bold text-slate-900">You said: </span>
                <span className="text-rose-900 italic font-semibold">"{transcript}"</span>
              </p>
            )}
            {assistantSpokenText && (
              <p className="text-rose-950 text-center font-semibold mt-1">
                "{assistantSpokenText}"
              </p>
            )}
          </div>
        )}

        {/* Speech instruction prompt */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-rose-100 shadow-sm max-w-sm mb-6">
          <p className="text-rose-900 font-bold text-sm mb-1 flex items-center justify-center gap-1.5">
            <Sparkles size={16} className="text-rose-600" />
            “Speak anything to set your language”
          </p>
          <p className="text-slate-500 text-xs">
            Say e.g. <span className="text-slate-800 font-semibold">“योजनाएं बताओ”</span>, <span className="text-slate-800 font-semibold">“திட்டங்கள் காட்டு”</span>, or <span className="text-slate-800 font-semibold">“Hello”</span>
          </p>
        </div>

        {/* Or pick a language chip */}
        <div className="w-full max-w-md">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Or Tap Your Language
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguageDirectly(lang.code)}
                  className="p-3 rounded-2xl border bg-white border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/50 text-left transition-all active:scale-95 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm">{lang.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">{lang.code}</span>
                  </div>
                  <span className="text-xs text-rose-700 font-medium block">{lang.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
