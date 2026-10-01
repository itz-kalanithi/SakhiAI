import React, { useState } from 'react';
import { Mic, Square, Sparkles, Send, Volume2, Loader2, X, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VoiceAssistantBar: React.FC = () => {
  const { 
    voiceState, 
    startVoiceListening, 
    stopVoiceListening, 
    transcript, 
    assistantSpokenText, 
    stopSpeech, 
    t, 
    language,
    handleVoiceCommand,
    currentScreen 
  } = useApp();

  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleMicClick = () => {
    setIsDismissed(false);
    if (voiceState === 'listening') {
      stopVoiceListening();
    } else if (voiceState === 'speaking') {
      stopSpeech();
    } else {
      startVoiceListening();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      handleVoiceCommand(manualText.trim());
      setManualText('');
      setShowManualInput(false);
    }
  };

  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';
  const isProcessing = voiceState === 'processing';
  const isThinking = voiceState === 'thinking';
  const hasContent = !!(transcript || assistantSpokenText || isListening || isProcessing || isThinking || isSpeaking);

  const statusText = isListening 
    ? '🎙️ Listening... speak in any language' 
    : isProcessing 
    ? '⏳ Processing speech...' 
    : isThinking 
    ? '✨ Thinking (Gemini AI)...' 
    : isSpeaking 
    ? '🔊 Speaking response...' 
    : 'Tap AI to speak';

  const isAtBottomEdge = currentScreen === 'onboarding';

  return (
    <div className={`fixed ${isAtBottomEdge ? 'bottom-5' : 'bottom-20'} right-3 sm:right-6 z-40 flex flex-col items-end pointer-events-auto`}>
      {/* Speech & Transcript Card Floating Above the Corner Button */}
      {hasContent && !isDismissed && (
        <div className="mb-3 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-3xl p-3.5 shadow-2xl border border-rose-200/80 animate-in slide-in-from-bottom-2 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-100/70 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Sparkles size={14} className="text-rose-600" />
              <span>SakhiAI Voice Layer</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase">
                {language}
              </span>
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-2">
            <span className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full text-[11px] ${
              isListening
                ? 'bg-rose-100 text-rose-800 animate-pulse'
                : isThinking
                ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                : isProcessing
                ? 'bg-amber-100 text-amber-800'
                : isSpeaking
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {isListening && <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />}
              {isThinking && <Sparkles size={12} className="animate-spin text-indigo-600" />}
              {isProcessing && <Loader2 size={12} className="animate-spin text-amber-600" />}
              {isSpeaking && <Volume2 size={12} className="animate-bounce text-emerald-600" />}
              <span>{statusText}</span>
            </span>
          </div>

          {/* Live Transcript Display */}
          {transcript && (
            <div className="mb-2 p-2 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                You said:
              </span>
              <p className="text-slate-800 font-semibold italic text-xs leading-relaxed">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Sakhi Spoken AI Response */}
          {assistantSpokenText && (
            <div className="p-2 bg-rose-50/80 rounded-xl border border-rose-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-rose-700 block mb-0.5">
                Sakhi AI:
              </span>
              <p className="text-rose-950 font-medium leading-relaxed">
                {assistantSpokenText}
              </p>
            </div>
          )}

          {/* Optional manual text input */}
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="mt-2 pt-2 border-t border-slate-100 flex gap-1.5">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type command (e.g. 'Open education')..."
                className="flex-1 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="bg-rose-600 text-white p-1.5 rounded-xl hover:bg-rose-700 flex items-center justify-center"
              >
                <Send size={13} />
              </button>
            </form>
          )}

          {/* Bottom helper actions */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
            <span>Speak in any language</span>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <button
                  onClick={stopSpeech}
                  className="font-bold text-rose-700 hover:underline"
                >
                  Stop Voice
                </button>
              )}
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="hover:text-slate-900 underline"
              >
                {showManualInput ? 'Hide' : 'Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Hero AI Voice Button at Right-Most Down Corner */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Animated Wave Rings while Recording */}
        {isListening && (
          <>
            <span className="absolute w-20 h-20 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
            <span className="absolute w-24 h-24 rounded-full bg-rose-400/20 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          onClick={handleMicClick}
          type="button"
          className={`relative z-10 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90 border-2 ${
            isListening
              ? 'bg-rose-600 text-white ring-4 ring-rose-300 border-white'
              : isSpeaking
              ? 'bg-amber-600 text-white ring-4 ring-amber-200 border-white'
              : isThinking || isProcessing
              ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 border-white'
              : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white hover:scale-105 border-white/60 shadow-rose-400/50'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start speaking with Sakhi AI'}
          title="SakhiAI Voice Assistant"
        >
          {isListening ? (
            <Square size={22} className="fill-white" />
          ) : isSpeaking ? (
            <Volume2 size={24} className="animate-bounce" />
          ) : isThinking || isProcessing ? (
            <Loader2 size={24} className="animate-spin text-white" />
          ) : (
            <>
              <Mic size={24} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
