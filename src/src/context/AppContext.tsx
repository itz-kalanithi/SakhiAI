import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  LanguageCode, 
  ScreenType, 
  VoiceState, 
  Scheme, 
  SchemeApplicationData, 
  ComplaintData,
  VoiceDebugInfo
} from '../types';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../data/languages';
import { voiceService, SPEECH_LOCALE_MAP } from '../services/voiceService';
import { geminiService } from '../services/geminiService';
import { locationService, LocationData } from '../services/locationService';

interface AppContextType {
  // Navigation & Screen
  currentScreen: ScreenType;
  navigateTo: (screen: ScreenType) => void;
  goBack: () => void;
  previousScreen: ScreenType | null;

  // Language & Localization
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isLanguageIdentified: boolean;
  resetLanguageState: () => void;
  t: (key: string) => string;

  // Voice Interaction
  voiceState: VoiceState;
  transcript: string;
  assistantSpokenText: string;
  isMuted: boolean;
  toggleMute: () => void;
  startVoiceListening: (customLang?: LanguageCode) => void;
  stopVoiceListening: () => void;
  speakMessage: (text: string, onEnd?: () => void) => void;
  stopSpeech: () => void;
  handleVoiceCommand: (spokenInput: string) => Promise<void>;

  // Voice Debug Diagnostics
  voiceDebugInfo: VoiceDebugInfo;
  checkMicPermission: () => Promise<void>;

  // Location Awareness
  location: LocationData;
  requestLocation: () => Promise<void>;
  setManualLocationState: (stateName: string) => void;

  // Demo / Live Mode
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;

  // Scheme Application State
  selectedSchemeForApply: Scheme | null;
  setSelectedSchemeForApply: (scheme: Scheme | null) => void;
  applicationDraft: SchemeApplicationData;
  updateApplicationDraft: (fields: Partial<SchemeApplicationData>) => void;
  resetApplicationDraft: () => void;

  // Complaint Filing State
  complaintDraft: ComplaintData;
  updateComplaintDraft: (fields: Partial<ComplaintData>) => void;
  resetComplaintDraft: () => void;

  // Active Educational Context
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
}

const defaultApplicationDraft: SchemeApplicationData = {
  schemeId: '',
  schemeName: '',
  applicantName: '',
  age: '',
  phone: '',
  aadhaarOrRation: '',
  addressState: 'Tamil Nadu',
  district: 'Chennai',
  occupation: 'Homemaker / Daily wage worker',
  annualIncome: '₹60,000',
  bankAccount: '',
  ifscCode: '',
  status: 'draft',
};

const defaultComplaintDraft: ComplaintData = {
  id: '',
  complainantName: '',
  phone: '',
  incidentType: '',
  date: new Date().toISOString().split('T')[0],
  time: '11:00 AM',
  location: '',
  description: '',
  personsInvolved: '',
  evidence: '',
  status: 'draft',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedLang = typeof window !== 'undefined' ? localStorage.getItem('sakhiai_user_language') as LanguageCode | null : null;
  const initialIdentified = !!savedLang;
  const initialLang: LanguageCode = savedLang || 'hi';

  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialIdentified ? 'home' : 'onboarding');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([]);
  const [language, setLanguageState] = useState<LanguageCode>(initialLang);
  const [isLanguageIdentified, setIsLanguageIdentified] = useState<boolean>(initialIdentified);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [assistantSpokenText, setAssistantSpokenText] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(geminiService.getApiKey());
  
  const [location, setLocation] = useState<LocationData>(locationService.getCurrentLocation());
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState<Scheme | null>(null);
  const [applicationDraft, setApplicationDraft] = useState<SchemeApplicationData>(defaultApplicationDraft);
  const [complaintDraft, setComplaintDraft] = useState<ComplaintData>(defaultComplaintDraft);
  const [activeLessonId, setActiveLessonId] = useState<string | null>('math_market');

  // Diagnostics state for Voice Debug Panel
  const [voiceDebugInfo, setVoiceDebugInfo] = useState<VoiceDebugInfo>({
    micPermission: 'prompt',
    speechSupported: voiceService.isSpeechSupported(),
    isListening: false,
    speechRecognitionLocale: SPEECH_LOCALE_MAP[initialLang] || 'hi-IN',
    transcript: '',
    detectedLanguageCode: initialIdentified ? initialLang : null,
    detectedLanguageName: initialIdentified ? (SUPPORTED_LANGUAGES.find(l => l.code === initialLang)?.name || 'Hindi') : null,
    languageConfidence: initialIdentified ? 1.0 : null,
    detectedIntent: null,
    geminiStatus: geminiService.hasApiKey() ? 'connected' : 'fallback',
    geminiResponse: '',
    ttsStatus: 'idle',
    isLanguageIdentified: initialIdentified,
  });

  // Check initial mic permission status
  useEffect(() => {
    voiceService.checkMicPermissionStatus().then((status) => {
      setVoiceDebugInfo((prev) => ({
        ...prev,
        micPermission: status,
        speechSupported: voiceService.isSpeechSupported(),
      }));
    });
  }, []);

  const checkMicPermission = async () => {
    setVoiceDebugInfo((prev) => ({ ...prev, micPermission: 'checking' }));
    const result = await voiceService.requestMicPermission();
    setVoiceDebugInfo((prev) => ({
      ...prev,
      micPermission: result.granted ? 'granted' : 'denied',
      geminiError: result.error,
    }));
  };

  // Reset language state completely to test first-time interaction flow
  const resetLanguageState = () => {
    localStorage.removeItem('sakhiai_user_language');
    setIsLanguageIdentified(false);
    setLanguageState('hi');
    voiceService.setSpeechLocale('hi-IN');
    setTranscript('');
    setAssistantSpokenText('');
    setCurrentScreen('onboarding');
    setVoiceDebugInfo((prev) => ({
      ...prev,
      speechRecognitionLocale: 'hi-IN',
      transcript: '',
      detectedLanguageCode: null,
      detectedLanguageName: null,
      languageConfidence: null,
      detectedIntent: null,
      geminiResponse: '',
      isLanguageIdentified: false,
    }));
  };

  // Translations helper
  const t = useCallback((key: string): string => {
    return UI_TRANSLATIONS[language]?.[key] || UI_TRANSLATIONS['en']?.[key] || key;
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setIsLanguageIdentified(true);
    localStorage.setItem('sakhiai_user_language', lang);
    const locale = SPEECH_LOCALE_MAP[lang] || 'hi-IN';
    voiceService.setSpeechLocale(locale);
    const langName = SUPPORTED_LANGUAGES.find(l => l.code === lang)?.name || 'Hindi';
    setVoiceDebugInfo((prev) => ({
      ...prev,
      speechRecognitionLocale: locale,
      detectedLanguageCode: lang,
      detectedLanguageName: langName,
      isLanguageIdentified: true,
    }));
  };

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    voiceService.stopSpeaking();
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory((history) => history.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('home');
    }
    voiceService.stopSpeaking();
  };

  const previousScreen = screenHistory.length > 0 ? screenHistory[screenHistory.length - 1] : null;

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    voiceService.setMuted(nextMuted);
  };

  const toggleDemoMode = () => {
    const nextDemo = !isDemoMode;
    setIsDemoMode(nextDemo);
    geminiService.setDemoMode(nextDemo);
  };

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    geminiService.setApiKey(key);
    setVoiceDebugInfo((prev) => ({
      ...prev,
      geminiStatus: key ? 'connected' : 'fallback',
    }));
  };

  const speakMessage = useCallback((text: string, onEnd?: () => void) => {
    setAssistantSpokenText(text);
    setVoiceState('speaking');
    setVoiceDebugInfo((prev) => ({
      ...prev,
      ttsStatus: 'speaking',
      geminiResponse: text,
    }));

    voiceService.speak(
      text,
      language,
      () => {
        setVoiceState('speaking');
        setVoiceDebugInfo((prev) => ({ ...prev, ttsStatus: 'speaking' }));
      },
      () => {
        setVoiceState('idle');
        setVoiceDebugInfo((prev) => ({ ...prev, ttsStatus: 'idle' }));
        if (onEnd) onEnd();
      }
    );
  }, [language]);

  const stopSpeech = useCallback(() => {
    voiceService.stopSpeaking();
    setVoiceState('idle');
    setVoiceDebugInfo((prev) => ({ ...prev, ttsStatus: 'idle' }));
  }, []);

  const requestLocation = async () => {
    const loc = await locationService.requestLocationPermission();
    setLocation(loc);
  };

  const setManualLocationState = (stateName: string) => {
    locationService.setManualState(stateName);
    setLocation(locationService.getCurrentLocation());
  };

  // Main voice processing pipeline:
  // USER SPEAKS -> TRANSCRIBE -> DETECT LANGUAGE & INTENT VIA GEMINI -> GEMINI RESPONDS -> UPDATE UI -> TTS
  const handleVoiceCommand = async (spokenInput: string) => {
    setVoiceState('processing');
    setTranscript(spokenInput);

    setVoiceDebugInfo((prev) => ({
      ...prev,
      transcript: spokenInput,
      geminiStatus: 'calling',
    }));

    // Switch to 'thinking' state while Gemini works
    setVoiceState('thinking');

    try {
      // 1. Language Detection from the spoken text (without assuming Tamil!)
      const detection = geminiService.detectLanguageFromText(spokenInput);

      // 2. Query Gemini for Intent & Response
      const result = await geminiService.parseVoiceIntent(spokenInput, currentScreen, detection.language);

      const finalLang = result.language || detection.language;
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === finalLang)?.name || detection.languageName;
      const confidence = detection.confidence;

      // 3. Configure the application's language to the DETECTED language!
      setLanguageState(finalLang);
      setIsLanguageIdentified(true);
      localStorage.setItem('sakhiai_user_language', finalLang);
      const newLocale = SPEECH_LOCALE_MAP[finalLang] || 'hi-IN';
      voiceService.setSpeechLocale(newLocale);

      // 4. Update the diagnostics display with accurate, distinct fields!
      setVoiceDebugInfo((prev) => ({
        ...prev,
        speechRecognitionLocale: newLocale,
        detectedLanguageCode: finalLang,
        detectedLanguageName: langName,
        languageConfidence: confidence,
        detectedIntent: result.intent,
        geminiStatus: result.source === 'gemini-live' ? 'connected' : 'fallback',
        geminiResponse: result.spokenReply,
        isLanguageIdentified: true,
      }));

      // 5. Handle explicit language switch command
      if (result.intent === 'LANGUAGE_SELECT') {
        speakMessage(result.spokenReply);
        return;
      }

      // 6. If user was on onboarding, acknowledge in detected language and navigate to home
      if (currentScreen === 'onboarding') {
        speakMessage(result.spokenReply, () => {
          navigateTo('home');
        });
        return;
      }

      // 7. Execute intent navigation or action
      if (result.intent === 'NAVIGATE' && result.targetScreen) {
        speakMessage(result.spokenReply, () => {
          navigateTo(result.targetScreen!);
        });
      } else if (result.intent === 'EMERGENCY_SOS' || result.intent === 'FIND_POLICE') {
        speakMessage(result.spokenReply, () => {
          navigateTo('emergency');
        });
      } else if (result.intent === 'FILE_COMPLAINT') {
        speakMessage(result.spokenReply, () => {
          navigateTo('complaint');
        });
      } else if (result.intent === 'APPLY_SCHEME') {
        speakMessage(result.spokenReply, () => {
          navigateTo('scheme-apply');
        });
      } else if (result.intent === 'GO_BACK') {
        speakMessage(result.spokenReply, () => {
          goBack();
        });
      } else {
        speakMessage(result.spokenReply);
      }
    } catch (err: any) {
      console.warn('Voice command processing error:', err);
      setVoiceState('idle');
      setVoiceDebugInfo((prev) => ({
        ...prev,
        geminiStatus: 'error',
        geminiError: err?.message || 'Error processing speech command',
      }));
    }
  };

  const startVoiceListening = (customLang?: LanguageCode) => {
    const activeLang = customLang || language;
    setVoiceState('listening');
    setTranscript('');

    setVoiceDebugInfo((prev) => ({
      ...prev,
      isListening: true,
      transcript: '',
      speechRecognitionLocale: voiceService.getSpeechLocale(),
      geminiError: undefined,
    }));

    voiceService.startListening(
      activeLang,
      (text) => {
        setTranscript(text);
        setVoiceDebugInfo((prev) => ({
          ...prev,
          transcript: text,
        }));
      },
      (err, errMsg) => {
        console.warn('Voice listening error:', err, errMsg);
        setVoiceState('error');
        setVoiceDebugInfo((prev) => ({
          ...prev,
          isListening: false,
          geminiError: errMsg,
          micPermission: err === 'not-allowed' ? 'denied' : prev.micPermission,
        }));
        setTimeout(() => setVoiceState('idle'), 3000);
      },
      (finalText) => {
        setVoiceDebugInfo((prev) => ({
          ...prev,
          isListening: false,
        }));

        if (finalText && finalText.trim()) {
          handleVoiceCommand(finalText.trim());
        } else {
          setVoiceState('idle');
        }
      }
    );
  };

  const stopVoiceListening = () => {
    setVoiceState('processing');
    const finalResult = voiceService.stopListening();
    setVoiceDebugInfo((prev) => ({
      ...prev,
      isListening: false,
      transcript: finalResult || prev.transcript,
    }));

    if (finalResult && finalResult.trim()) {
      handleVoiceCommand(finalResult.trim());
    } else {
      setVoiceState('idle');
    }
  };

  const updateApplicationDraft = (fields: Partial<SchemeApplicationData>) => {
    setApplicationDraft((prev) => ({ ...prev, ...fields }));
  };

  const resetApplicationDraft = () => {
    setApplicationDraft({
      ...defaultApplicationDraft,
      addressState: location.state,
      district: location.district,
    });
  };

  const updateComplaintDraft = (fields: Partial<ComplaintData>) => {
    setComplaintDraft((prev) => ({ ...prev, ...fields }));
  };

  const resetComplaintDraft = () => {
    setComplaintDraft(defaultComplaintDraft);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        goBack,
        previousScreen,
        language,
        setLanguage,
        isLanguageIdentified,
        resetLanguageState,
        t,
        voiceState,
        transcript,
        assistantSpokenText,
        isMuted,
        toggleMute,
        startVoiceListening,
        stopVoiceListening,
        speakMessage,
        stopSpeech,
        handleVoiceCommand,
        voiceDebugInfo,
        checkMicPermission,
        location,
        requestLocation,
        setManualLocationState,
        isDemoMode,
        toggleDemoMode,
        geminiApiKey,
        setGeminiApiKey,
        selectedSchemeForApply,
        setSelectedSchemeForApply,
        applicationDraft,
        updateApplicationDraft,
        resetApplicationDraft,
        complaintDraft,
        updateComplaintDraft,
        resetComplaintDraft,
        activeLessonId,
        setActiveLessonId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
