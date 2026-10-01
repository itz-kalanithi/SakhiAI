export type LanguageCode = 'ta' | 'te' | 'hi' | 'ml' | 'kn' | 'bn' | 'en';

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechLocale: string;
  greetingText: string;
  promptText: string;
  tagline: string;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'thinking' | 'speaking' | 'error';

export interface VoiceDebugInfo {
  micPermission: 'prompt' | 'granted' | 'denied' | 'checking';
  speechSupported: boolean;
  isListening: boolean;
  speechRecognitionLocale: string;
  transcript: string;
  detectedLanguageCode: LanguageCode | null;
  detectedLanguageName: string | null;
  languageConfidence: number | null;
  detectedIntent: string | null;
  geminiStatus: 'idle' | 'calling' | 'connected' | 'fallback' | 'error';
  geminiError?: string;
  geminiResponse: string;
  ttsStatus: 'idle' | 'speaking';
  ttsVoiceName?: string;
  isLanguageIdentified: boolean;
}

export type ScreenType = 
  | 'onboarding' 
  | 'home' 
  | 'education' 
  | 'schemes' 
  | 'scheme-apply' 
  | 'rights' 
  | 'emergency' 
  | 'complaint'
  | 'settings';

export interface Scheme {
  id: string;
  name: string;
  nativeName: Record<LanguageCode, string>;
  category: 'financial' | 'maternity' | 'education' | 'livelihood' | 'safety';
  ministry: string;
  state?: string; // empty means all India / Central
  benefits: string;
  nativeBenefits: Record<LanguageCode, string>;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    gender: 'female' | 'all';
    targetGroup: string;
    maxIncome?: number; // annual in INR
    states?: string[];
  };
  requiredDocs: string[];
  officialUrl: string;
  applicationMode: 'online' | 'offline_csc' | 'bank_branch';
  isCentral: boolean;
}

export interface EducationLesson {
  id: string;
  subject: 'math' | 'science_health' | 'digital' | 'finance' | 'rights';
  subjectTitle: Record<LanguageCode, string>;
  title: Record<LanguageCode, string>;
  summary: Record<LanguageCode, string>;
  simpleExplanation: Record<LanguageCode, string>;
  detailedExplanation: Record<LanguageCode, string>;
  realLifeExample: Record<LanguageCode, string>;
  audioPrompt?: Record<LanguageCode, string>;
  audioScript?: Record<LanguageCode, string>;
  quizQuestions: {
    question: Record<LanguageCode, string>;
    options: Record<LanguageCode, string[]>;
    correctAnswerIndex: number;
    explanation: Record<LanguageCode, string>;
  }[];
}

export interface LegalRight {
  id: string;
  actName: string;
  title: Record<LanguageCode, string>;
  category: 'domestic_violence' | 'workplace' | 'criminal_fir' | 'free_legal_aid' | 'property' | 'marriage_maintenance';
  summary: Record<LanguageCode, string>;
  whatToDoSteps: Record<LanguageCode, string[]>;
  relevantAuthority: Record<LanguageCode, string>;
  helpline: string;
  officialSource: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  type: 'police_station' | 'all_women_police' | 'sakhi_one_stop_centre';
  address: string;
  distanceKm: number;
  phone: string;
  lat: number;
  lng: number;
  is24x7: boolean;
}

export interface EmergencyHelpline {
  id: string;
  number: string;
  title: Record<LanguageCode, string>;
  desc: Record<LanguageCode, string>;
  category: 'police' | 'women' | 'child' | 'legal' | 'cyber';
  badgeColor: string;
}

export interface VoiceCommandIntent {
  intent: 
    | 'NAVIGATE'
    | 'LANGUAGE_SELECT'
    | 'EXPLAIN_CONCEPT'
    | 'SIMPLIFY_EXPLANATION'
    | 'APPLY_SCHEME'
    | 'FORM_INPUT'
    | 'CONFIRM_ACTION'
    | 'CANCEL_ACTION'
    | 'FILE_COMPLAINT'
    | 'LEGAL_HELP'
    | 'EMERGENCY_SOS'
    | 'FIND_POLICE'
    | 'READ_ALOUD'
    | 'GO_BACK'
    | 'UNKNOWN';
  targetScreen?: ScreenType;
  language?: LanguageCode;
  parameters?: Record<string, any>;
  spokenReply: string;
  source?: 'gemini-live' | 'local-fallback';
  rawResponse?: string;
}

export interface ComplaintData {
  id: string;
  complainantName: string;
  phone: string;
  incidentType: string;
  date: string;
  time: string;
  location: string;
  description: string;
  personsInvolved: string;
  evidence: string;
  status: 'draft' | 'reviewed' | 'submitted_simulation' | 'handed_off_official';
  submittedAt?: string;
}

export interface SchemeApplicationData {
  schemeId: string;
  schemeName: string;
  applicantName: string;
  age: string;
  phone: string;
  aadhaarOrRation: string;
  addressState: string;
  district: string;
  occupation: string;
  annualIncome: string;
  bankAccount: string;
  ifscCode: string;
  status: 'draft' | 'ready_for_review' | 'submitted_simulation' | 'handed_off_portal';
  submittedAt?: string;
  applicationRefNo?: string;
}
