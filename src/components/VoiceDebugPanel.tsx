import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Mic, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Terminal,
  Play,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageCode } from '../types';

export const VoiceDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    voiceDebugInfo, 
    checkMicPermission, 
    handleVoiceCommand, 
    startVoiceListening, 
    stopVoiceListening,
    language,
    setLanguage,
    resetLanguageState,
    voiceState,
    transcript
  } = useApp();

  const isListening = voiceDebugInfo.isListening || voiceState === 'listening';

  const testCases = [
    {
      title: 'TEST 1: Hindi Schemes',
      desc: 'Speak Hindi to detect HI and switch to hi-IN',
      text: 'मुझे सरकारी योजनाओं के बारे में जानना है',
      expectedLang: 'HI (hi-IN)',
    },
    {
      title: 'TEST 2: Tamil Schemes',
      desc: 'Speak Tamil to detect TA and switch to ta-IN',
      text: 'எனக்கு அரசாங்க திட்டங்களைப் பற்றி தெரிந்து கொள்ள வேண்டும்',
      expectedLang: 'TA (ta-IN)',
    },
    {
      title: 'TEST 3: Telugu Schemes',
      desc: 'Speak Telugu to detect TE and switch to te-IN',
      text: 'నాకు ప్రభుత్వ పథకాల గురించి తెలుసుకోవాలి',
      expectedLang: 'TE (te-IN)',
    },
    {
      title: 'TEST 4: Mixed Tamil & English',
      desc: 'Mixed words should still detect Tamil',
      text: 'எனக்கு government schemes பற்றி சொல்லுங்கள்',
      expectedLang: 'TA (ta-IN)',
    },
    {
      title: 'TEST 5: Voice Switch to Hindi',
      desc: 'Command to change language to Hindi',
      text: 'Change my language to Hindi',
      expectedLang: 'HI (hi-IN)',
    },
    {
      title: 'TEST 6: Voice Switch to Tamil',
      desc: 'Command in Tamil to switch back to Tamil',
      text: 'தமிழில் மாற்றுங்கள்',
      expectedLang: 'TA (ta-IN)',
    },
  ];

  const confidencePercent = voiceDebugInfo.languageConfidence 
    ? `${Math.round(voiceDebugInfo.languageConfidence * 100)}%` 
    : 'N/A';

  return (
    <div className="fixed top-2 right-2 z-50 max-w-sm w-full px-2 pointer-events-auto">
      {/* Floating Toggle Header */}
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/70 overflow-hidden transition-all text-xs">
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="w-full px-3 py-2 flex items-center justify-between font-mono hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isListening ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </>
              ) : voiceDebugInfo.speechSupported ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              )}
            </span>
            <span className="font-bold tracking-wider text-[11px] text-slate-100 flex items-center gap-1.5">
              <Terminal size={13} className="text-rose-400" />
              VOICE PIPELINE DIAGNOSTICS
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="uppercase font-bold text-slate-300">
              {isListening ? '🎙️ REC' : voiceState}
            </span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {/* Collapsible Diagnostics Body */}
        {isOpen && (
          <div className="p-3 border-t border-slate-800 space-y-2 max-h-[82vh] overflow-y-auto font-mono text-[11px]">
            {/* Reset Language Button */}
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-rose-900/60">
              <div>
                <span className="font-bold text-rose-300 block text-[11px]">First-Time Testing</span>
                <span className="text-[10px] text-slate-400">Clear saved language state</span>
              </div>
              <button
                onClick={resetLanguageState}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-[10px] shadow transition-all active:scale-95"
              >
                <RotateCcw size={11} />
                <span>Reset Language</span>
              </button>
            </div>

            {/* 1. Microphone Permission */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Mic Permission:</span>
              <div className="flex items-center gap-1.5">
                {voiceDebugInfo.micPermission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    <CheckCircle2 size={12} /> Granted
                  </span>
                ) : voiceDebugInfo.micPermission === 'denied' ? (
                  <span className="inline-flex items-center gap-1 text-red-400 font-bold bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                    <XCircle size={12} /> Denied
                  </span>
                ) : (
                  <button
                    onClick={checkMicPermission}
                    className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 hover:bg-amber-900/60"
                  >
                    <AlertTriangle size={12} /> Allow Mic
                  </button>
                )}
              </div>
            </div>

            {/* 2. Speech Recognition API Support */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Speech API:</span>
              <span className={voiceDebugInfo.speechSupported ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {voiceDebugInfo.speechSupported ? 'Web Speech Supported' : 'Not Supported'}
              </span>
            </div>

            {/* 3. Listening State */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Listening:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold px-2 py-0.5 rounded ${
                  isListening ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' : 'text-slate-400'
                }`}>
                  {isListening ? 'Yes (Recording)' : 'No (Idle)'}
                </span>
                <button
                  onClick={() => isListening ? stopVoiceListening() : startVoiceListening()}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  {isListening ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>

            {/* 4. Speech Recognition Locale (Separated from Detected Lang!) */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Speech Recognition Locale:</span>
                <span className="text-cyan-300 font-bold text-xs">{voiceDebugInfo.speechRecognitionLocale}</span>
              </div>
              <select
                value={voiceDebugInfo.speechRecognitionLocale}
                onChange={(e) => setLanguage(e.target.value.split('-')[0] as LanguageCode)}
                className="bg-slate-800 text-white border border-slate-700 rounded px-1.5 py-0.5 text-[10px]"
              >
                <option value="hi-IN">hi-IN (Hindi)</option>
                <option value="ta-IN">ta-IN (Tamil)</option>
                <option value="te-IN">te-IN (Telugu)</option>
                <option value="en-IN">en-IN (English)</option>
                <option value="ml-IN">ml-IN (Malayalam)</option>
                <option value="kn-IN">kn-IN (Kannada)</option>
                <option value="bn-IN">bn-IN (Bengali)</option>
              </select>
            </div>

            {/* 5. Live Speech Transcript */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <Mic size={11} className="text-rose-400" />
                  Live Transcript:
                </span>
                <span className="text-[10px] text-slate-500">
                  {transcript ? `${transcript.length} chars` : 'Waiting for voice'}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg text-emerald-300 min-h-[36px] break-words border border-slate-800/80">
                {transcript ? `"${transcript}"` : <span className="text-slate-600 italic">Press microphone and speak...</span>}
              </div>
            </div>

            {/* 6. Detected Language & Confidence (Strictly from Speech / AI!) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Detected Language:</span>
                <span className="font-bold text-amber-300 text-xs">
                  {voiceDebugInfo.detectedLanguageName 
                    ? `${voiceDebugInfo.detectedLanguageName} (${voiceDebugInfo.detectedLanguageCode?.toUpperCase()})` 
                    : <span className="text-slate-500">Not detected yet</span>}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Language Confidence:</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {confidencePercent}
                </span>
              </div>
            </div>

            {/* 7. Detected Intent */}
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">User Intent:</span>
              <span className="font-bold text-amber-300 text-xs uppercase">
                {voiceDebugInfo.detectedIntent || 'None'}
              </span>
            </div>

            {/* 8. Gemini Status */}
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles size={11} className="text-rose-400" />
                  Gemini Status:
                </span>
                <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  voiceDebugInfo.geminiStatus === 'connected'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : voiceDebugInfo.geminiStatus === 'calling'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    : voiceDebugInfo.geminiStatus === 'error'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}>
                  {voiceDebugInfo.geminiStatus === 'connected' ? 'Connected (Gemini 1.5 Flash)' :
                   voiceDebugInfo.geminiStatus === 'calling' ? 'Calling Gemini...' :
                   voiceDebugInfo.geminiStatus === 'fallback' ? 'Local Multilingual AI Fallback' :
                   voiceDebugInfo.geminiStatus}
                </span>
              </div>
              {voiceDebugInfo.geminiError && (
                <p className="text-red-400 text-[10px] break-words pt-1 border-t border-slate-800">
                  {voiceDebugInfo.geminiError}
                </p>
              )}
            </div>

            {/* 9. Gemini Spoken Response */}
            {voiceDebugInfo.geminiResponse && (
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[10px]">Gemini Spoken Response:</span>
                <p className="text-rose-200 text-[11px] leading-relaxed">
                  "{voiceDebugInfo.geminiResponse}"
                </p>
              </div>
            )}

            {/* 10. TTS Audio Synthesis */}
            <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1">
                <Volume2 size={11} className="text-rose-400" />
                TTS Speech:
              </span>
              <span className={`font-bold ${voiceDebugInfo.ttsStatus === 'speaking' ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`}>
                {voiceDebugInfo.ttsStatus === 'speaking' ? 'Speaking Aloud...' : 'Idle'}
              </span>
            </div>

            {/* 1-Click Verification Test Cases */}
            <div className="pt-1.5 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                ⚡ Exact Test Cases:
              </span>
              <div className="space-y-1">
                {testCases.map((tc, i) => (
                  <button
                    key={i}
                    onClick={() => handleVoiceCommand(tc.text)}
                    type="button"
                    className="w-full text-left p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-between group active:scale-95"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Play size={10} className="text-emerald-400 fill-emerald-400 shrink-0 group-hover:scale-110" />
                      <div>
                        <div className="font-bold text-[10px] text-white leading-tight">{tc.title}</div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[200px]">"{tc.text}"</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-300 font-bold shrink-0 ml-1">
                      {tc.expectedLang}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
