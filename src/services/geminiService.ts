import { LanguageCode, VoiceCommandIntent, ScreenType } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { SPEECH_LOCALE_MAP } from './voiceService';

export interface GeminiApiDebugStatus {
  status: 'idle' | 'calling' | 'connected' | 'fallback' | 'error';
  lastCallTimestamp?: number;
  lastError?: string;
  lastRawResponse?: string;
  modelUsed?: string;
}

export interface LanguageDetectionResult {
  language: LanguageCode;
  languageName: string;
  speechLocale: string;
  confidence: number;
}

class GeminiService {
  private apiKey: string = '';
  private isDemoMode: boolean = false;
  private debugStatus: GeminiApiDebugStatus = {
    status: 'idle',
  };

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('sakhiai_gemini_key') || '';
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    localStorage.setItem('sakhiai_gemini_key', this.apiKey);
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  public setDemoMode(isDemo: boolean) {
    this.isDemoMode = isDemo;
  }

  public getDemoMode(): boolean {
    return this.isDemoMode;
  }

  public getDebugStatus(): GeminiApiDebugStatus {
    return this.debugStatus;
  }

  /**
   * Process raw acoustic audio directly via Gemini 1.5 Flash Multimodal API.
   * This identifies the user's spoken language directly from acoustic audio
   * without forcing any browser speech locale!
   */
  public async identifyLanguageAndIntentFromAudio(
    base64Audio: string,
    mimeType: string = 'audio/webm',
    currentScreen: ScreenType = 'home'
  ): Promise<VoiceCommandIntent> {
    if (!this.hasApiKey()) {
      throw new Error('Gemini API key not configured for audio processing.');
    }

    this.debugStatus = {
      status: 'calling',
      lastCallTimestamp: Date.now(),
      modelUsed: 'gemini-1.5-flash (multimodal audio)',
    };

    const prompt = `You are SakhiAI's voice intelligence layer for Indian women. Listen to this user audio carefully.
Current screen: "${currentScreen}"

Task:
1. Identify the spoken language from the acoustic speech:
   - 'hi' (Hindi), 'ta' (Tamil), 'te' (Telugu), 'ml' (Malayalam), 'kn' (Kannada), 'bn' (Bengali), 'en' (English).
2. Transcribe the speech accurately into its native script (Devanagari for Hindi, Tamil script for Tamil, etc.).
3. Rate your confidence from 0.0 to 1.0 (e.g. 0.95).
4. Identify user intent:
   - "LANGUAGE_SELECT": Asking to switch language (e.g. "Change my language to Hindi", "தமிழில் பேசு")
   - "NAVIGATE": Wants to see schemes, education, rights, emergency, complaint
   - "APPLY_SCHEME": Wants to apply for a scheme
   - "FILE_COMPLAINT": Wants to file a complaint
   - "SIMPLIFY_EXPLANATION": Asking for simpler explanation ("I don't understand")
   - "EXPLAIN_CONCEPT": General question, education question, math doubt
   - "EMERGENCY_SOS": Danger, distress, help
   - "FIND_POLICE": Police station, One-Stop Center
   - "GO_BACK": Back / home
   - "READ_ALOUD": Read the screen
   - "UNKNOWN": Other
5. Target screen: "home" | "education" | "schemes" | "scheme-apply" | "rights" | "emergency" | "complaint" | null.
6. Provide a warm, conversational, reassuring spoken reply in the DETECTED language under 25 words.

Respond ONLY with valid JSON in this schema:
{
  "language": "hi" | "ta" | "te" | "ml" | "kn" | "bn" | "en",
  "languageName": "Hindi" | "Tamil" | "Telugu" | "Malayalam" | "Kannada" | "Bengali" | "English",
  "speechLocale": "hi-IN" | "ta-IN" | "te-IN" | "ml-IN" | "kn-IN" | "bn-IN" | "en-IN",
  "confidence": 0.95,
  "transcript": "Exact transcribed words in native script",
  "intent": "NAVIGATE" | "LANGUAGE_SELECT" | "APPLY_SCHEME" | "FILE_COMPLAINT" | "SIMPLIFY_EXPLANATION" | "EXPLAIN_CONCEPT" | "EMERGENCY_SOS" | "FIND_POLICE" | "GO_BACK" | "READ_ALOUD" | "UNKNOWN",
  "targetScreen": "home" | "education" | "schemes" | "scheme-apply" | "rights" | "emergency" | "complaint" | null,
  "spokenReply": "Warm spoken reply under 25 words in detected language"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: base64Audio,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini Audio API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    this.debugStatus.lastRawResponse = raw;

    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const langCode: LanguageCode = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'en'].includes(parsed.language)
        ? parsed.language
        : 'hi';

      this.debugStatus = {
        status: 'connected',
        lastCallTimestamp: Date.now(),
        lastRawResponse: raw,
        modelUsed: 'gemini-1.5-flash (audio)',
      };

      return {
        intent: parsed.intent || 'NAVIGATE',
        targetScreen: parsed.targetScreen || undefined,
        language: langCode,
        spokenReply: parsed.spokenReply || this.getLocalizedResponse('default_assistant', langCode),
        source: 'gemini-live',
        rawResponse: raw,
      };
    }

    throw new Error('Could not parse Gemini audio response JSON');
  }

  /**
   * Main conversational and voice navigation intelligence.
   * Sends user speech transcript directly to Google Gemini 1.5 Flash.
   */
  public async parseVoiceIntent(
    transcript: string,
    currentScreen: ScreenType,
    currentLanguage?: LanguageCode
  ): Promise<VoiceCommandIntent> {
    const textTrimmed = transcript.trim();
    if (!textTrimmed) {
      return {
        intent: 'UNKNOWN',
        spokenReply: this.getLocalizedResponse('default_assistant', currentLanguage || 'hi'),
        source: 'local-fallback',
      };
    }

    // 1. Try Gemini API first if API key is present
    if (this.hasApiKey()) {
      try {
        this.debugStatus = {
          status: 'calling',
          lastCallTimestamp: Date.now(),
          modelUsed: 'gemini-1.5-flash',
        };

        const systemPrompt = `You are SakhiAI, a voice-first AI assistant for Indian women designed to eliminate literacy, language, and navigation barriers.
Current App Screen: "${currentScreen}"
User Spoke: "${textTrimmed}"

CRITICAL INSTRUCTIONS:
1. Identify which Indian language the user actually spoke from the transcript:
   - 'hi': Hindi (हिन्दी / Devanagari script, or spoken Hindi words like 'mujhe', 'sarkari', 'yojana', 'namaste')
   - 'ta': Tamil (தமிழ் script, or spoken Tamil words like 'enakku', 'thittam', 'vanakkam')
   - 'te': Telugu (తెలుగు script, or spoken Telugu words like 'naaku', 'pathakaalu', 'namaskaram')
   - 'ml': Malayalam (മലയാളം script)
   - 'kn': Kannada (ಕನ್ನಡ script)
   - 'bn': Bengali (বাংলা script)
   - 'en': English
   NOTE: If the user spoke mixed language (e.g. "எனக்கு government schemes பற்றி சொல்லுங்கள்"), the primary language is Tamil ('ta')! Do not classify as English just because English words appear!
2. Determine user intent:
   - "LANGUAGE_SELECT": User asks to change language (e.g. "Change my language to Hindi", "தமிழில் பேசுங்கள்", "Switch to Telugu")
   - "EMERGENCY_SOS": Danger, distress, help, danger at home, medical emergency
   - "FIND_POLICE": Nearest police station or One-Stop crisis center
   - "NAVIGATE": Wants to open/view a section
   - "APPLY_SCHEME": Wants to apply for a scheme
   - "FILE_COMPLAINT": Wants to file a complaint or report incident
   - "SIMPLIFY_EXPLANATION": User said "I don't understand" or wants simpler words
   - "EXPLAIN_CONCEPT": Asking an educational, mathematical, or rights question
   - "GO_BACK": Wants to go back, return to home, or exit
   - "READ_ALOUD": Wants the screen read aloud
   - "UNKNOWN": Other
3. Target screen:
   - "education" (math, market calculations, study)
   - "schemes" (government schemes, financial aid, loans, maternity)
   - "scheme-apply" (apply for scheme)
   - "rights" (legal rights, domestic violence, legal aid)
   - "emergency" (helpline 112/181, police, SOS)
   - "complaint" (file complaint)
   - "home" (home screen)
4. Confidence score: between 0.0 and 1.0 (e.g. 0.96).
5. Generate a warm, reassuring spoken reply in the DETECTED language under 25 words.

Output strictly valid JSON only:
{
  "language": "hi" | "ta" | "te" | "ml" | "kn" | "bn" | "en",
  "languageName": "Hindi" | "Tamil" | "Telugu" | "Malayalam" | "Kannada" | "Bengali" | "English",
  "speechLocale": "hi-IN" | "ta-IN" | "te-IN" | "ml-IN" | "kn-IN" | "bn-IN" | "en-IN",
  "confidence": 0.95,
  "intent": "NAVIGATE" | "LANGUAGE_SELECT" | "APPLY_SCHEME" | "FILE_COMPLAINT" | "SIMPLIFY_EXPLANATION" | "EXPLAIN_CONCEPT" | "EMERGENCY_SOS" | "FIND_POLICE" | "GO_BACK" | "READ_ALOUD" | "UNKNOWN",
  "targetScreen": "home" | "education" | "schemes" | "scheme-apply" | "rights" | "emergency" | "complaint" | null,
  "spokenReply": "Spoken text in detected language under 25 words"
}`;

        const raw = await this.callGeminiRaw(systemPrompt);
        this.debugStatus.lastRawResponse = raw;

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const detectedLang: LanguageCode = ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'en'].includes(parsed.language)
            ? parsed.language
            : this.detectLanguageFromText(textTrimmed).language;

          this.debugStatus = {
            status: 'connected',
            lastCallTimestamp: Date.now(),
            lastRawResponse: raw,
            modelUsed: 'gemini-1.5-flash',
          };

          return {
            intent: parsed.intent || 'NAVIGATE',
            targetScreen: parsed.targetScreen || undefined,
            language: detectedLang,
            spokenReply: parsed.spokenReply || this.getLocalizedResponse('default_assistant', detectedLang),
            source: 'gemini-live',
            rawResponse: raw,
          };
        }
      } catch (err: any) {
        console.warn('Gemini live API call failed, falling back to local multilingual AI:', err);
        this.debugStatus = {
          status: 'error',
          lastError: err?.message || 'Network or API error',
          lastCallTimestamp: Date.now(),
        };
      }
    } else {
      this.debugStatus = {
        status: 'fallback',
        lastError: 'No API Key configured. Using local multilingual AI fallback.',
      };
    }

    // 2. Local Multilingual AI Fallback
    return this.parseVoiceIntentLocally(textTrimmed, currentScreen, currentLanguage);
  }

  /**
   * High-accuracy cross-script phonetic vocabulary and pattern language detector.
   * Crucially: DOES NOT BLINDLY DEFAULT TO ANY PRESET SCRIPT OR LOCALE!
   * Accurately detects Hindi even if Chrome transcribed it into Tamil letters (ta-IN locale),
   * and detects Tamil even if Chrome transcribed it into Devanagari letters (hi-IN locale),
   * and handles Latin, Telugu, Malayalam, Kannada, Bengali, and English dynamically.
   */
  public detectLanguageFromText(text: string): LanguageDetectionResult {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Explicit Language Switch Requests
    if (lower.includes('hindi') || lower.includes('हिंदी')) {
      return { language: 'hi', languageName: 'Hindi', speechLocale: 'hi-IN', confidence: 0.98 };
    }
    if (lower.includes('tamil') || lower.includes('தமிழ்')) {
      return { language: 'ta', languageName: 'Tamil', speechLocale: 'ta-IN', confidence: 0.98 };
    }
    if (lower.includes('telugu') || lower.includes('తెలుగు')) {
      return { language: 'te', languageName: 'Telugu', speechLocale: 'te-IN', confidence: 0.98 };
    }
    if (lower.includes('malayalam') || lower.includes('മലയാളം')) {
      return { language: 'ml', languageName: 'Malayalam', speechLocale: 'ml-IN', confidence: 0.98 };
    }
    if (lower.includes('kannada') || lower.includes('ಕನ್ನಡ')) {
      return { language: 'kn', languageName: 'Kannada', speechLocale: 'kn-IN', confidence: 0.98 };
    }
    if (lower.includes('bengali') || lower.includes('বাংলা')) {
      return { language: 'bn', languageName: 'Bengali', speechLocale: 'bn-IN', confidence: 0.98 };
    }
    if (lower.includes('english')) {
      return { language: 'en', languageName: 'English', speechLocale: 'en-IN', confidence: 0.98 };
    }

    // Vocabulary definition sets for cross-script recognition
    const HINDI_SET = new Set([
      'मुझे', 'मुझको', 'मेरा', 'मेरी', 'मेरे', 'हम', 'हमें', 'हमारा', 'क्या', 'क्यों', 'कैसे', 'कब', 'कहाँ', 
      'योजना', 'योजनाएं', 'योजनाओं', 'सरकारी', 'सरकार', 'मदद', 'बचाओ', 'बताओ', 'बताइये', 'जानना', 'जाननी', 
      'सीखना', 'गणित', 'शिक्षा', 'अधिकार', 'कानून', 'शिकायत', 'पुलिस', 'काम', 'पैसा', 'रुपये', 'नमस्ते', 
      'है', 'हैं', 'था', 'थी', 'होगा', 'चाहिए', 'नहीं', 'बारे', 'में', 'और', 'की', 'का', 'के', 'को', 'से',
      // Tamil-transliterated Hindi (when Chrome uses ta-IN locale for Hindi speech)
      'முஜே', 'முஜ்கோ', 'மேரா', 'மேரி', 'மேரே', 'சர்காரி', 'சர்கார்', 'யோஜனா', 'யோஜனாயேன்', 'ஜான்னா', 
      'பதாவோ', 'பதாயியே', 'சிக்ஷா', 'கணீத்', 'அதிகார்', 'ஷிகாயத்', 'மதத்', 'பச்சாவோ', 'ஹை', 'நஹி', 'சாஹியே', 'பாரே', 'மே',
      // Telugu-transliterated Hindi
      'ముఝే', 'మేరా', 'సర్కారీ', 'యోజనా', 'బతావో', 'జానా', 'హై',
      // Latin Hindi
      'mujhe', 'mujhko', 'mera', 'meri', 'mere', 'kya', 'kyon', 'kaise', 'kahan', 'yojana', 'yojanaen', 
      'yojanayein', 'yojna', 'sarkari', 'sarkar', 'madad', 'bachao', 'batao', 'janna', 'ganit', 'shiksha', 
      'adhikar', 'kanoon', 'shikayat', 'chahiye', 'nahi', 'namaste', 'bare', 'mein', 'hai', 'hain'
    ]);

    const TAMIL_SET = new Set([
      'எனக்கு', 'என்', 'என்ன', 'எனது', 'உனக்கு', 'உங்கள்', 'உங்களுக்கு', 'நாங்கள்', 'திட்டம்', 'திட்டங்கள்', 
      'திட்டத்தை', 'அரசாங்க', 'அரசு', 'உதவி', 'காப்பாற்றுங்கள்', 'சொல்லுங்கள்', 'சொல்லு', 'தெரிய', 'தெரியும்', 
      'வேண்டும்', 'வேண்டாம்', 'கல்வி', 'கணக்கு', 'உரிமை', 'உரிமைகள்', 'சட்டம்', 'புகார்', 'ஆபத்து', 'பணம்', 
      'ரூபாய்', 'வணக்கம்', 'இல்லை', 'பற்றி', 'மற்றும்',
      // Devanagari-transliterated Tamil (when Chrome uses hi-IN locale for Tamil speech)
      'एनक्कु', 'उनक्कु', 'उङ्गल', 'थित्तम', 'थित्तङ्गल', 'तित्तम्', 'तित्तंगल', 'अरसान्ग', 'अरसु', 'उदवि', 
      'उतवि', 'काप्पात्तु', 'सोल्लुङ्ग', 'तरिय', 'वेण्डुम', 'कल्वि', 'कणक्कु', 'उरिमै', 'सत्तम', 'पुगार्', 'वणक्कम', 'इल्लै', 'पत्ति',
      // Latin Tamil
      'enakku', 'unakku', 'ungal', 'ungalukku', 'thittam', 'thittangal', 'arasaanga', 'arasu', 'uthavi', 
      'udavi', 'kaappathunga', 'sollunga', 'theriya', 'theriyum', 'vendum', 'vendaam', 'kalvi', 'kanakku', 
      'urimai', 'urimaigal', 'sattam', 'pugaar', 'vanakkam', 'illai', 'patri'
    ]);

    const TELUGU_SET = new Set([
      'నాకు', 'నా', 'మాకు', 'మీకు', 'పథకం', 'పథకాలు', 'ప్రభుత్వ', 'ప్రభుత్వం', 'సహాయం', 'కాపాడండి', 
      'చెప్పండి', 'తెలుసుకోవాలి', 'కావాలి', 'విద్య', 'గణితం', 'హక్కు', 'చట్టం', 'ఫిర్యాదు', 'డబ్బులు', 'నమస్కారం', 'గురించి',
      // Latin Telugu
      'naaku', 'maaku', 'meeku', 'pathakam', 'pathakaalu', 'prabhutva', 'prabhutvam', 'sahayam', 'kaapadandi', 
      'cheppandi', 'thelusukovali', 'telusukovali', 'kaavali', 'vidya', 'ganitham', 'hakku', 'chattam', 'firyadhu', 'namaskaram', 'gurinchi'
    ]);

    const MALAYALAM_SET = new Set([
      'എനിക്ക്', 'എന്റെ', 'നമുക്ക്', 'നിങ്ങൾക്ക്', 'പദ്ധതി', 'പദ്ധതികൾ', 'സർക്കാർ', 'സഹాయം', 'രക്ഷിക്കൂ', 
      'പറയൂ', 'അറിയണം', 'വേണം', 'വിദ്യാഭ്യാസം', 'കണക്ക്', 'നമസ്കാരം',
      'enikk', 'ente', 'namukku', 'ningalkku', 'padhathi', 'sarkar', 'sahayam', 'namaskaram'
    ]);

    const KANNADA_SET = new Set([
      'ನನಗೆ', 'ನನ್ನ', 'ನಮಗೆ', 'ನಿಮಗೆ', 'ಯೋಜನೆ', 'ಯೋಜನೆಗಳು', 'ಸರ್ಕಾರಿ', 'ಸರ್ಕಾರ', 'ಸಹಾಯ', 'ಕಾಪಾಡಿ', 
      'ಹೇಳಿ', 'ತಿಳಿಯಬೇಕು', 'ಬೇಕು', 'ಶಿಕ್ಷಣ', 'ಗಣಿತ', 'ನಮಸ್ಕಾರ',
      'nanage', 'nanna', 'namage', 'nimage', 'yojana', 'sarkari', 'sahaya', 'namaskara'
    ]);

    const BENGALI_SET = new Set([
      'আমাকে', 'আমার', 'আমাদের', 'আপনাকে', 'প্রকল্প', 'যোজনা', 'সরকারি', 'সরকার', 'সাহায্য', 'বাঁচাও', 
      'বলুন', 'জানতে', 'চাই', 'শিক্ষা', 'অঙ্ক', 'নমস্কার',
      'amake', 'amar', 'amader', 'prokolpo', 'jojona', 'sorkari', 'sahajjo', 'nomoshkar'
    ]);

    const ENGLISH_SET = new Set([
      'i', 'want', 'to', 'know', 'about', 'government', 'schemes', 'scheme', 'education', 'learn', 'math', 
      'mathematics', 'rights', 'emergency', 'help', 'complaint', 'file', 'tell', 'me', 'please', 'hello', 
      'change', 'switch', 'language', 'open', 'show'
    ]);

    // Tokenize text into words
    const words = lower.replace(/[,.!?।_#*~`]/g, ' ').split(/\s+/).filter(Boolean);
    let hi = 0, ta = 0, te = 0, ml = 0, kn = 0, bn = 0, en = 0;

    for (const w of words) {
      if (HINDI_SET.has(w)) hi += 10;
      if (TAMIL_SET.has(w)) ta += 10;
      if (TELUGU_SET.has(w)) te += 10;
      if (MALAYALAM_SET.has(w)) ml += 10;
      if (KANNADA_SET.has(w)) kn += 10;
      if (BENGALI_SET.has(w)) bn += 10;
      if (ENGLISH_SET.has(w)) en += 2;
    }

    // Script boost if no strong cross-script vocabulary conflict was found
    if (hi === 0 && ta === 0 && te === 0 && ml === 0 && kn === 0 && bn === 0) {
      if (/[\u0900-\u097F]/.test(trimmed)) hi += 5;
      else if (/[\u0B80-\u0BFF]/.test(trimmed)) ta += 5;
      else if (/[\u0C00-\u0C7F]/.test(trimmed)) te += 5;
      else if (/[\u0D00-\u0D7F]/.test(trimmed)) ml += 5;
      else if (/[\u0C80-\u0CFF]/.test(trimmed)) kn += 5;
      else if (/[\u0980-\u09FF]/.test(trimmed)) bn += 5;
      else if (/[a-zA-Z]/.test(trimmed)) en += 4;
    }

    const scores: Record<LanguageCode, number> = { hi, ta, te, ml, kn, bn, en };
    let bestLang: LanguageCode = 'hi';
    let maxScore = -1;

    for (const [code, score] of Object.entries(scores) as [LanguageCode, number][]) {
      if (score > maxScore) {
        maxScore = score;
        bestLang = code;
      }
    }

    const langNames: Record<LanguageCode, string> = {
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      ml: 'Malayalam',
      kn: 'Kannada',
      bn: 'Bengali',
      en: 'English',
    };

    const conf = Math.min(0.98, Math.max(0.65, 0.70 + Math.max(0, maxScore) * 0.03));
    return {
      language: bestLang,
      languageName: langNames[bestLang],
      speechLocale: SPEECH_LOCALE_MAP[bestLang] || 'hi-IN',
      confidence: conf,
    };
  }

  /**
   * Local Multilingual Intent Resolver
   */
  private parseVoiceIntentLocally(
    transcript: string,
    currentScreen: ScreenType,
    currentLanguage?: LanguageCode
  ): VoiceCommandIntent {
    const textLower = transcript.toLowerCase().trim();
    const detection = this.detectLanguageFromText(transcript);
    const targetLang = detection.language;

    // 1. Explicit Language Switch Requests
    if (
      textLower.includes('change my language') ||
      textLower.includes('switch to') ||
      textLower.includes('change language') ||
      textLower.includes('भाषा बदलो') ||
      textLower.includes('மொழியை மாற்று') ||
      textLower.includes('భాష మార్చు')
    ) {
      const ackMessages: Record<LanguageCode, string> = {
        hi: 'नमस्ते! मैंने भाषा हिंदी चुन ली है। अब मैं हिंदी में बात करूँगी।',
        ta: 'வணக்கம்! நான் தமிழுக்கு மாறிவிட்டேன். இனி தமிழில் பேசுவேன்.',
        te: 'నమస్కారం! నేను తెలుగుకు మారాను. ఇకపై తెలుగులో మాట్లాడుతాను.',
        ml: 'നമസ്കാരം! ഞാൻ മലയാളത്തിലേക്ക് മാറി.',
        kn: 'ನಮಸ್ಕಾರ! ನಾನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಿದ್ದೇನೆ.',
        bn: 'নমস্কার! আমি বাংলায় পরিবর্তন করেছি।',
        en: 'Hello! I have switched the application language to English.',
      };

      return {
        intent: 'LANGUAGE_SELECT',
        language: targetLang,
        spokenReply: ackMessages[targetLang] || ackMessages['en'],
        source: 'local-fallback',
      };
    }

    // 2. Emergency distress triggers
    if (
      textLower.includes('help') ||
      textLower.includes('உதவி') ||
      textLower.includes('காப்பாற்று') ||
      textLower.includes('சகாயம்') ||
      textLower.includes('ஆபத்து') ||
      textLower.includes('मदद') ||
      textLower.includes('बचाओ') ||
      textLower.includes('खतरा') ||
      textLower.includes('சகாய') ||
      textLower.includes('సహాయం') ||
      textLower.includes('కాపాడండి') ||
      textLower.includes('emergency') ||
      textLower.includes('danger') ||
      textLower.includes('police') ||
      textLower.includes('போலீஸ்') ||
      textLower.includes('పోలీస్')
    ) {
      if (textLower.includes('station') || textLower.includes('நிலையம்') || textLower.includes('స్టేషన్') || textLower.includes('थाना')) {
        return {
          intent: 'FIND_POLICE',
          targetScreen: 'emergency',
          language: targetLang,
          spokenReply: this.getLocalizedResponse('finding_police', targetLang),
          source: 'local-fallback',
        };
      }
      return {
        intent: 'EMERGENCY_SOS',
        targetScreen: 'emergency',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('emergency_alert', targetLang),
        source: 'local-fallback',
      };
    }

    // 3. Navigation Intent Triggers: Schemes
    if (
      textLower.includes('scheme') ||
      textLower.includes('திட்டம்') ||
      textLower.includes('திட்டங்கள்') ||
      textLower.includes('పథకాలు') ||
      textLower.includes('योजना') ||
      textLower.includes('योजनाएं') ||
      textLower.includes('सरकारी') ||
      textLower.includes('மகப்பேறு') ||
      textLower.includes('பணம்') ||
      textLower.includes('மானிய')
    ) {
      if (textLower.includes('apply') || textLower.includes('விண்ணப்ப') || textLower.includes('आवेदन') || textLower.includes('దరఖాస్తు')) {
        return {
          intent: 'APPLY_SCHEME',
          targetScreen: 'scheme-apply',
          language: targetLang,
          spokenReply: this.getLocalizedResponse('apply_scheme', targetLang),
          source: 'local-fallback',
        };
      }
      return {
        intent: 'NAVIGATE',
        targetScreen: 'schemes',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('nav_schemes', targetLang),
        source: 'local-fallback',
      };
    }

    // 4. Navigation Intent Triggers: Education
    if (
      textLower.includes('education') ||
      textLower.includes('கல்வி') ||
      textLower.includes('படிப்பு') ||
      textLower.includes('கற்க') ||
      textLower.includes('teach me') ||
      textLower.includes('learn') ||
      textLower.includes('math') ||
      textLower.includes('கணிதம்') ||
      textLower.includes('గణితం') ||
      textLower.includes('गणित') ||
      textLower.includes('विद्य') ||
      textLower.includes('ಶಿಕ್ಷಣ') ||
      textLower.includes('শিক্ষা')
    ) {
      return {
        intent: 'NAVIGATE',
        targetScreen: 'education',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('nav_education', targetLang),
        source: 'local-fallback',
      };
    }

    // 5. Navigation Intent Triggers: Rights & Legal Help
    if (
      textLower.includes('right') ||
      textLower.includes('rights') ||
      textLower.includes('சட்டம்') ||
      textLower.includes('உரிமை') ||
      textLower.includes('உரிமைகள்') ||
      textLower.includes('வன்முறை') ||
      textLower.includes('மிரட்டல்') ||
      textLower.includes('చట్టం') ||
      textLower.includes('హక్కులు') ||
      textLower.includes('अधिकार') ||
      textLower.includes('कानून') ||
      textLower.includes('আইন') ||
      textLower.includes('ಹಕ್ಕುಗಳು')
    ) {
      return {
        intent: 'NAVIGATE',
        targetScreen: 'rights',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('nav_rights', targetLang),
        source: 'local-fallback',
      };
    }

    // 6. Complaint Filing
    if (
      textLower.includes('complaint') ||
      textLower.includes('புகார்') ||
      textLower.includes('மனு') ||
      textLower.includes('शिकायत') ||
      textLower.includes('फरियाद') ||
      textLower.includes('ఫిర్యాదు') ||
      textLower.includes('ದೂರು') ||
      textLower.includes('অভিযোগ')
    ) {
      return {
        intent: 'FILE_COMPLAINT',
        targetScreen: 'complaint',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('nav_complaint', targetLang),
        source: 'local-fallback',
      };
    }

    // 7. Navigation: Go back / Home
    if (
      textLower.includes('go back') ||
      textLower.includes('பின்செல்') ||
      textLower.includes('வெளியே வா') ||
      textLower.includes('வெளியேறு') ||
      textLower.includes('వెనక్కి') ||
      textLower.includes('वापस') ||
      textLower.includes('होम') ||
      textLower.includes('home')
    ) {
      return {
        intent: 'GO_BACK',
        targetScreen: 'home',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('going_home', targetLang),
        source: 'local-fallback',
      };
    }

    // 8. Simpler explanation request
    if (
      textLower.includes('simpler') ||
      textLower.includes("don't understand") ||
      textLower.includes('dont understand') ||
      textLower.includes('புரியவில்லை') ||
      textLower.includes('எளிதாக') ||
      textLower.includes('அర్థం కాలేదు') ||
      textLower.includes('समझ नहीं आया') ||
      textLower.includes('सरल')
    ) {
      return {
        intent: 'SIMPLIFY_EXPLANATION',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('simplifying', targetLang),
        source: 'local-fallback',
      };
    }

    // 9. Read aloud request
    if (
      textLower.includes('read') ||
      textLower.includes('வாசி') ||
      textLower.includes('படி') ||
      textLower.includes('చదువు') ||
      textLower.includes('सुनाओ') ||
      textLower.includes('বলুন')
    ) {
      return {
        intent: 'READ_ALOUD',
        language: targetLang,
        spokenReply: this.getLocalizedResponse('reading', targetLang),
        source: 'local-fallback',
      };
    }

    // 10. Contextual general reply
    return {
      intent: 'EXPLAIN_CONCEPT',
      language: targetLang,
      spokenReply: this.getLocalizedResponse('understood_query', targetLang),
      source: 'local-fallback',
    };
  }

  /**
   * Explain an educational concept in simple conversational language
   */
  public async explainConcept(
    concept: string,
    isSimplerMode: boolean,
    lang: LanguageCode
  ): Promise<string> {
    if (this.hasApiKey()) {
      try {
        const simplicity = isSimplerMode
          ? 'Use extremely simple analogies suitable for a woman from a rural background who cannot read or do complex calculations. Use everyday household, vegetable market or cooking examples. Under 4 sentences.'
          : 'Explain clearly, practically, and warmly for practical everyday knowledge. Under 5 sentences.';

        const prompt = `You are SakhiAI, speaking to an Indian woman.
Concept to explain: "${concept}".
Language: Respond entirely in ${SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.name || 'English'}.
${simplicity}`;

        return await this.callGeminiRaw(prompt);
      } catch (e) {
        console.warn('Gemini explainConcept failed, using contextual fallback:', e);
      }
    }

    return this.getLocalizedResponse('explaining_concept_fallback', lang);
  }

  /**
   * Call Gemini REST API directly
   */
  private async callGeminiRaw(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error('No Gemini API Key provided');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || '';
  }

  public getLocalizedResponse(type: string, lang: LanguageCode): string {
    const responses: Record<string, Record<LanguageCode, string>> = {
      finding_police: {
        hi: 'नजदीकी महिला पुलिस थाना और सखी वन स्टॉप सेंटर की जानकारी दिखा रही हूँ।',
        ta: 'அருகிலுள்ள மகளிர் காவல் நிலையம் மற்றும் சகி மைய தகவல்களை திரையிடுகிறேன்.',
        te: 'సమీప పోలీస్ స్టేషన్ వివరాలు చూపిస్తున్నాను.',
        ml: 'അടുത്തുള്ള പോലീസ് സ്റ്റേഷന്റെ വിവരങ്ങൾ ലഭ്യമാക്കുന്നു.',
        kn: 'ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆಯ ವಿವರಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.',
        bn: 'নিকটবর্তী থানা ও সখী কেন্দ্রের তথ্য দেখাচ্ছি।',
        en: 'Showing nearest police station and Sakhi One-Stop Crisis Center details.',
      },
      emergency_alert: {
        hi: 'घबराएं नहीं, आपातकालीन सहायता खुली है। तुरंत 112 या 181 पर कॉल करने के लिए तैयार रहें।',
        ta: 'பயப்படாதீர்கள். அவசர உதவிப் பக்கத்திற்கு சென்றுள்ளோம். 112 அல்லது 181-ஐ அழைக்க தயாராக இருங்கள்.',
        te: 'భయపడకండి. అత్యవసర పేజీని తెరిచాను. 112 లేదా 181 కు కాల్ చేయండి.',
        ml: 'ഭയപ്പെടേണ്ടതില്ല. അടിയന്തര സഹായ പേജ് തുറന്നിരിക്കുന്നു.',
        kn: 'ಭಯಪಡಬೇಡಿ, ತುರ್ತು ಸಹಾಯ ಪುಟವನ್ನು ತೆರೆದಿದ್ದೇನೆ.',
        bn: 'ভয় পাবেন না, জরুরি সহায়তা পেজে নিয়ে এসেছি।',
        en: 'Do not panic. I have opened Emergency SOS. Helplines 112 and 181 are ready to dial.',
      },
      nav_education: {
        hi: 'शिक्षा अनुभाग खोल रही हूँ। गणित, बाजार का हिसाब और खरीदारी सुरक्षा सीखें।',
        ta: 'கல்விப் பிரிவை திறக்கிறேன். அன்றாட கணிதம் மற்றும் சந்தை கணக்குகளை எளிதாக கற்கலாம்.',
        te: 'విద్య విభాగాన్ని తెరుస్తున్నాను. మార్కెట్ లెక్కలు మరియు డిస్కౌంట్ నేర్చుకోండి.',
        ml: 'വിദ്യാഭ്യാസ വിഭാഗം തുറക്കുന്നു.',
        kn: 'ಶಿಕ್ಷಣ ವಿಭಾಗವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
        bn: 'শিক্ষা বিভাগ খুলছি। বাজারে কেনাকাটার হিসাব সহজে শিখুন।',
        en: 'Opening Education. Learn everyday market calculations and discount arithmetic.',
      },
      nav_schemes: {
        hi: 'सरकारी योजनाएं खोल रही हूँ। यहां आप मातृत्व, बचत और व्यापार ऋण संबंधी योजनाओं को देख सकती हैं।',
        ta: 'அரசு திட்டங்கள் பிரிவை திறக்கிறேன். மகப்பேறு, சேமிப்பு, தொழில் கடன் என பல திட்டங்களை பார்க்கலாம்.',
        te: 'ప్రభుత్వ పథకాల పేజీని తెరుస్తున్నాను.',
        ml: 'സർക്കാർ പദ്ധതികൾ കാണിക്കുന്നു.',
        kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ವಿಭಾಗವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
        bn: 'সরকারি প্রকল্প বিভাগ খুলছি।',
        en: 'Opening Government Schemes. Let us explore benefits for maternity, savings, and entrepreneurship.',
      },
      nav_rights: {
        hi: 'कानूनी अधिकार अनुभाग खोल रही हूँ। अपनी समस्या बताएं, कानून के अनुसार हल समझेंगे।',
        ta: 'சட்ட உரிமைகள் பிரிவை திறக்கிறேன். உங்கள் பிரச்சனையை கூறுங்கள், சட்டப்படி தீர்வு காண்போம்.',
        te: 'చట్టపరమైన హక్కుల పేజీకి తీసుకెళ్తున్నాను.',
        ml: 'നിയമപരമായ അവകാശങ്ങൾ പരിശോധിക്കാം.',
        kn: 'ಕಾನೂನು ಹಕ್ಕುಗಳ ವಿಭಾಗವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
        bn: 'আইনি অধিকার বিভাগ খুলছি।',
        en: 'Opening Know Your Rights. Explain your situation, and I will share legal protections.',
      },
      nav_complaint: {
        hi: 'शिकायत दर्ज करने का अनुभाग खोल रही हूँ। मेरे प्रश्नों का आवाज से उत्तर दें।',
        ta: 'புகார் அளிக்கும் பிரிவிற்கு செல்கிறோம். நான் கேட்கும் கேள்விகளுக்கு குரல் மூலம் பதில் அளியுங்கள்.',
        te: 'ఫిర్యాదు దాఖలు పేజీని తెరుస్తున్నాను.',
        ml: 'പരാതി നൽകാനുള്ള പേജ് തുറക്കുന്നു.',
        kn: 'ದೂರು ದಾಖಲಿಸುವ ಪುಟಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.',
        bn: 'অভিযোগ দায়ের বিভাগে যাচ্ছি।',
        en: 'Opening Complaint Filing. Please answer my questions by speaking aloud.',
      },
      apply_scheme: {
        hi: 'आवेदन प्रक्रिया शुरू कर रही हूँ। कृपया पूछे गए विवरण बोलकर बताइए।',
        ta: 'விண்ணப்பப் படிவத்தை தொடங்குகிறேன். உங்கள் விவரங்களை குரல் மூலம் என்னிடம் கூறுங்கள்.',
        te: 'దరఖాస్తు ఫారమ్‌ను ప్రారంభిస్తున్నాను.',
        ml: 'അപേക്ഷ ആരംഭിക്കുന്നു.',
        kn: 'ಅರ್ಜಿ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತಿದ್ದೇನೆ.',
        bn: 'আবেদন প্রক্রিয়া শুরু করছি।',
        en: 'Starting application. I will ask you questions to fill the form step-by-step.',
      },
      going_home: {
        hi: 'मुख्य पृष्ठ पर वापस जा रहे हैं।',
        ta: 'முகப்பிற்கு செல்கிறோம்.',
        te: 'హోమ్ పేజీకి వెళ్తున్నాం.',
        ml: 'ഹോമിലേക്ക് പോകുന്നു.',
        kn: 'ಮುಖಪುಟಕ್ಕೆ ಮರಳುತ್ತಿದ್ದೇವೆ.',
        bn: 'হোম পেজে ফিরে যাচ্ছি।',
        en: 'Returning to Home screen.',
      },
      simplifying: {
        hi: 'चिंता मत कीजिए, मैं इसे बहुत आसान घरेलू उदाहरण के साथ समझाती हूँ।',
        ta: 'கவலைப்படாதீர்கள், இதனை மிக எளிமையான முறையில் கூறுகிறேன்.',
        te: 'సులభమైన ఉదాహరణతో వివరిస్తాను.',
        ml: 'ലളിതമായി പറഞ്ഞുതരാം.',
        kn: 'ಸುಲಭವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ.',
        bn: 'সহজ উদাহরণ দিয়ে বুঝিয়ে বলছি।',
        en: 'No worries at all, let me explain this in very simple everyday words.',
      },
      reading: {
        hi: 'स्क्रीन पर लिखी जानकारी बोलकर सुना रही हूँ।',
        ta: 'திரையில் உள்ளதை வாசித்து காட்டுகிறேன், கவனியுங்கள்.',
        te: 'చదివి వినిపిస్తున్నాను, వినండి.',
        ml: 'വായിച്ചു കേൾപ്പിക്കാം.',
        kn: 'ಓದಿ ಹೇಳುತ್ತಿದ್ದೇನೆ, ಆಲಿಸಿ.',
        bn: 'পড়ে শোনাচ্ছি, শুনুন।',
        en: 'Reading the screen aloud for you.',
      },
      understood_query: {
        hi: 'मैंने समझ लिया। आपकी मदद के लिए सखी सदैव तैयार है।',
        ta: 'புரிந்துகொண்டேன். உங்கள் உதவிக்கு சகி எப்போதும் தயாராக இருக்கிறேன்.',
        te: 'అర్థమైంది. మీకు సహాయం చేయడానికి నేను సిద్ధంగా ఉన్నాను.',
        ml: 'മനസ്സിലായി. സഹായിക്കാൻ ഞാൻ തയ്യാറാണ്.',
        kn: 'ಅರ್ಥವಾಯಿತು. ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಸದಾ ಸಿದ್ಧ.',
        bn: 'বুঝতে পেরেছি। আপনাকে সাহায্য করতে আমি প্রস্তুত।',
        en: 'Understood. SakhiAI is here to guide and assist you.',
      },
      default_assistant: {
        hi: 'नमस्ते, बताइए मैं आपकी क्या सहायता करूँ?',
        ta: 'வணக்கம், நான் உங்களுக்கு என்ன உதவி செய்ய வேண்டும் என்று கூறுங்கள்.',
        te: 'నమస్కారం, మీకు ఎలాంటి సహాయం కావాలో చెప్పండి.',
        ml: 'നിങ്ങൾക്ക് എന്ത് സഹായമാണ് വേണ്ടതെന്ന് പറയൂ.',
        kn: 'ನಿಮಗೆ ಏನು ಸಹಾಯ ಬೇಕು ತಿಳಿಸಿ.',
        bn: 'বলুন আমি আপনাকে কীভাবে সাহায্য করতে পারি।',
        en: 'Hello, please tell me how I can assist you today.',
      },
      explaining_concept_fallback: {
        hi: 'मैं इस विषय को आसान भाषा में समझा रही हूँ। ध्यान से सुनिए।',
        ta: 'இந்த பாடத்தை எளிய முறையில் விளக்குகிறேன். கேளுங்கள்.',
        te: 'ఈ పాఠాన్ని సులభంగా వివరిస్తాను.',
        ml: 'ഇത് ലളിതമായി വിശദീകരിക്കാം.',
        kn: 'ಇದನ್ನು ಸುಲಭವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ.',
        bn: 'সহজভাবে বুঝিয়ে বলছি।',
        en: 'Explaining this concept in simple everyday terms.',
      },
    };

    return responses[type]?.[lang] || responses[type]?.['en'] || 'Understood.';
  }
}

export const geminiService = new GeminiService();
