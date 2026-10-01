import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type VoiceErrorCode = 
  | 'not-allowed' 
  | 'no-speech' 
  | 'network' 
  | 'audio-capture' 
  | 'not-supported' 
  | 'unknown';

export const SPEECH_LOCALE_MAP: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  en: 'en-IN',
};

class VoiceService {
  private recognition: any = null;
  private isListeningActive: boolean = false;
  private audioCtx: AudioContext | null = null;
  private animFrameId: number | null = null;
  private isMuted: boolean = false;
  private sessionCommittedText: string = '';
  private currentInterimText: string = '';
  private accumulatedText: string = '';
  private recognitionFinalText: string = '';
  private currentLanguage: LanguageCode = 'hi';
  private currentSpeechLocale: string = 'hi-IN';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private ttsTimeoutId: any = null;
  private activeAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private audioQueue: string[] = [];
  private currentLangPlaying: LanguageCode = 'hi';
  private onEndTtsCallback: (() => void) | null = null;
  private onStartTtsCallback: (() => void) | null = null;
  private isTtsPlayingActive: boolean = false;
  
  // MediaRecorder audio capture
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private capturedBlob: Blob | null = null;
  private recorderStream: MediaStream | null = null;

  // Callbacks
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((err: VoiceErrorCode, message: string) => void) | null = null;
  private onEndCallback: ((finalText: string) => void) | null = null;
  private onAudioLevelCallback: ((level: number) => void) | null = null;

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => {
        try {
          this.cachedVoices = window.speechSynthesis.getVoices();
        } catch (e) {
          // ignore
        }
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }

  public isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isTtsSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeaking();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public setSpeechLocale(locale: string) {
    this.currentSpeechLocale = locale;
    if (this.recognition && this.isListeningActive) {
      this.recognition.lang = locale;
    }
  }

  public getSpeechLocale(): string {
    return this.currentSpeechLocale || SPEECH_LOCALE_MAP[this.currentLanguage] || 'hi-IN';
  }

  public setSpeechLanguage(lang: LanguageCode) {
    this.currentLanguage = lang;
    this.currentSpeechLocale = SPEECH_LOCALE_MAP[lang] || 'hi-IN';
    if (this.recognition && this.isListeningActive) {
      this.recognition.lang = this.currentSpeechLocale;
    }
  }

  public setAudioLevelCallback(cb: ((level: number) => void) | null) {
    this.onAudioLevelCallback = cb;
  }

  /**
   * Check permission status without opening microphone stream
   */
  public async checkMicPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      try {
        const res = await navigator.permissions.query({ name: 'microphone' as any });
        return res.state as 'granted' | 'denied' | 'prompt';
      } catch (e) {
        // Query not supported for microphone on some browsers
      }
    }
    return 'prompt';
  }

  /**
   * Request native browser microphone permission.
   */
  public async requestMicPermission(): Promise<{ granted: boolean; error?: string }> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { granted: false, error: 'Your browser does not support audio recording.' };
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop all tracks to release hardware lock
      stream.getTracks().forEach((track) => track.stop());
      return { granted: true };
    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      let msg = 'Microphone permission denied. Please allow microphone access in your browser bar.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Microphone access is blocked. Click the lock/camera icon in your address bar to Allow.';
      }
      return { granted: false, error: msg };
    }
  }

  /**
   * Accessible gentle audio feedback tones
   */
  public playAudioTone(type: 'listen_start' | 'listen_stop' | 'success' | 'alert') {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'listen_start') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'listen_stop') {
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // AudioContext may require gesture or be suspended, ignore
    }
  }

  private startLevelAnimation() {
    let phase = 0;
    const animate = () => {
      if (!this.isListeningActive) {
        if (this.onAudioLevelCallback) this.onAudioLevelCallback(0);
        return;
      }
      phase += 0.15;
      const level = Math.round(35 + Math.sin(phase) * 25 + Math.sin(phase * 2.3) * 15);
      if (this.onAudioLevelCallback) {
        this.onAudioLevelCallback(level);
      }
      this.animFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private stopLevelAnimation() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.onAudioLevelCallback) {
      this.onAudioLevelCallback(0);
    }
  }

  /**
   * Start recording voice continuously until user explicitly calls stopListening().
   */
  public async startListening(
    langCode: LanguageCode,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: VoiceErrorCode, message: string) => void,
    onEnd: (finalText: string) => void
  ) {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      onError('not-supported', 'Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    this.stopSpeaking();

    // 1. Prompt / verify microphone hardware access
    const perm = await this.requestMicPermission();
    if (!perm.granted) {
      onError('not-allowed', perm.error || 'Microphone access is blocked.');
      return;
    }

    this.playAudioTone('listen_start');

    this.currentLanguage = langCode;
    this.currentSpeechLocale = SPEECH_LOCALE_MAP[langCode] || this.currentSpeechLocale || 'hi-IN';
    this.sessionCommittedText = '';
    this.currentInterimText = '';
    this.accumulatedText = '';
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;
    this.isListeningActive = true;

    // IMPORTANT: Do not open a second microphone stream here.
    // SpeechRecognition owns the microphone while listening. Opening MediaRecorder
    // at the same time can make Chrome/Edge report audio-capture or not-allowed.

    this.startLevelAnimation();
    this.createAndStartRecognition();
  }

  private async startMediaRecorder() {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recorderStream = stream;
      this.audioChunks = [];
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: mime });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
      };
      this.mediaRecorder.start(250);
    } catch (e) {
      // Audio recorder stream failed, speech recognition will still work
    }
  }

  private stopMediaRecorder(): Blob | null {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
      const mime = this.mediaRecorder.mimeType || 'audio/webm';
      this.capturedBlob = new Blob(this.audioChunks, { type: mime });
    }
    if (this.recorderStream) {
      this.recorderStream.getTracks().forEach((t) => t.stop());
      this.recorderStream = null;
    }
    return this.capturedBlob;
  }

  public getLastAudioBlob(): Blob | null {
    return this.capturedBlob;
  }

  public async getLastAudioBase64(): Promise<{ base64: string; mimeType: string } | null> {
    if (!this.capturedBlob || this.capturedBlob.size === 0) return null;
    const blob = this.capturedBlob;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        const base64 = res.split(',')[1];
        resolve({ base64, mimeType: blob.type || 'audio/webm' });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  }

  private createAndStartRecognition() {
    if (!this.isListeningActive) return;

    try {
      if (this.recognition) {
        try {
          this.recognition.onstart = null;
          this.recognition.onresult = null;
          this.recognition.onerror = null;
          this.recognition.onend = null;
          this.recognition.abort();
        } catch (e) {}
        this.recognition = null;
      }

      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      // Use the current dynamically configured speech recognition locale
      const locale = this.getSpeechLocale();
      this.recognition.lang = locale;

      this.recognition.onstart = () => {
        // Recognition engine is officially listening
      };

      this.recognition.onresult = (event: any) => {
        let currentInterim = '';

        // Only process results that changed. event.results contains older
        // final results too, so re-reading the whole collection would duplicate
        // the user's words every time a new result arrives.
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            this.recognitionFinalText += `${item[0].transcript.trim()} `;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        const parts = [
          this.sessionCommittedText,
          this.recognitionFinalText.trim(),
          currentInterim.trim()
        ].filter(Boolean);

        const fullTranscript = parts.join(' ').replace(/\s+/g, ' ').trim();
        this.accumulatedText = fullTranscript;
        this.currentInterimText = currentInterim;

        if (this.onResultCallback) {
          this.onResultCallback(fullTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition event error:', event.error);

        if (event.error === 'no-speech') {
          // Chrome triggers no-speech after 5-8s of silence.
          // In continuous mode, do NOT abort! onend will restart it smoothly.
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        let userMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') {
          userMsg = 'Microphone permission blocked. Please allow microphone access in your browser.';
          this.isListeningActive = false;
        } else if (event.error === 'audio-capture') {
          userMsg = 'Microphone is busy or unavailable. Check if another app is using the mic.';
          this.isListeningActive = false;
        } else if (event.error === 'network') {
          userMsg = 'Speech network error. Google speech recognition server is unreachable.';
        }

        if (this.onErrorCallback) {
          this.onErrorCallback(event.error as VoiceErrorCode, userMsg);
        }
      };

      this.recognition.onend = () => {
        if (this.accumulatedText) {
          this.sessionCommittedText = this.accumulatedText;
        }

        // Auto-restart smoothly after 100ms if user hasn't tapped stop
        if (this.isListeningActive) {
          setTimeout(() => {
            if (this.isListeningActive) {
              this.createAndStartRecognition();
            }
          }, 100);
          return;
        }

        this.stopLevelAnimation();
        this.playAudioTone('listen_stop');

        if (this.onEndCallback) {
          this.onEndCallback(this.accumulatedText.trim());
        }
      };

      this.recognition.start();
    } catch (e: any) {
      console.warn('Recognition start exception:', e);
      if (this.isListeningActive) {
        setTimeout(() => {
          if (this.isListeningActive) {
            this.createAndStartRecognition();
          }
        }, 200);
      }
    }
  }

  /**
   * Explicitly stop recording when user clicks the voice button
   */
  public stopListening(): string {
    const finalResult = this.accumulatedText.trim();
    this.isListeningActive = false;
    this.stopLevelAnimation();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        try {
          this.recognition.abort();
        } catch (err) {}
      }
    } else if (this.onEndCallback) {
      // No recognition object exists, so finish the session ourselves.
      const cb = this.onEndCallback;
      this.onEndCallback = null;
      cb(finalResult);
    }

    this.playAudioTone('listen_stop');

    return finalResult;
  }

  /**
   * Split text into speech chunks that fits Google TTS ~150-180 character limit
   */
  private chunkTextForTts(text: string, maxLen: number = 150): string[] {
    if (text.length <= maxLen) return [text];
    const sentences = text.match(/[^.!?।\n,]+[.!?।\n,]+|[^.!?।\n,]+/g) || [text];
    const chunks: string[] = [];
    let cur = '';
    for (const s of sentences) {
      if ((cur + ' ' + s).trim().length <= maxLen) {
        cur = (cur + ' ' + s).trim();
      } else {
        if (cur) chunks.push(cur);
        if (s.length > maxLen) {
          const words = s.split(/\s+/);
          let wcur = '';
          for (const w of words) {
            if ((wcur + ' ' + w).trim().length <= maxLen) {
              wcur = (wcur + ' ' + w).trim();
            } else {
              if (wcur) chunks.push(wcur);
              wcur = w;
            }
          }
          cur = wcur;
        } else {
          cur = s.trim();
        }
      }
    }
    if (cur) chunks.push(cur);
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Play next chunk from the audio queue
   */
  private async playNextTtsChunk(isFirst: boolean = false) {
    if (!this.isTtsPlayingActive) return;

    if (this.audioQueue.length === 0) {
      this.isTtsPlayingActive = false;
      if (this.onEndTtsCallback) {
        const cb = this.onEndTtsCallback;
        this.onEndTtsCallback = null;
        cb();
      }
      return;
    }

    const nextChunk = this.audioQueue.shift()!;
    const lang = this.currentLangPlaying;

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(nextChunk)}`;
      const response = await fetch(url, { referrerPolicy: 'no-referrer' });

      if (!response.ok) {
        throw new Error(`Google TTS status: ${response.status}`);
      }

      const blob = await response.blob();
      if (!this.isTtsPlayingActive) return;

      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
        this.currentObjectUrl = null;
      }

      const objUrl = URL.createObjectURL(blob);
      this.currentObjectUrl = objUrl;

      const audio = new Audio(objUrl);
      this.activeAudio = audio;

      audio.onplay = () => {
        if (isFirst && this.onStartTtsCallback) {
          const cb = this.onStartTtsCallback;
          this.onStartTtsCallback = null;
          cb();
        }
      };

      audio.onended = () => {
        if (this.currentObjectUrl) {
          URL.revokeObjectURL(this.currentObjectUrl);
          this.currentObjectUrl = null;
        }
        this.activeAudio = null;
        this.playNextTtsChunk(false);
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error, falling back to speech synthesis for chunk:', e);
        this.fallbackSpeechSynthesisChunk(nextChunk, lang, isFirst, () => {
          this.playNextTtsChunk(false);
        });
      };

      await audio.play();
    } catch (err) {
      console.warn('Google TTS fetch error, falling back to speech synthesis:', err);
      this.fallbackSpeechSynthesisChunk(nextChunk, lang, isFirst, () => {
        this.playNextTtsChunk(false);
      });
    }
  }

  /**
   * Browser SpeechSynthesis fallback if network TTS fails
   */
  private fallbackSpeechSynthesisChunk(
    chunk: string,
    langCode: LanguageCode,
    isFirst: boolean,
    onDone: () => void
  ) {
    if (!this.isTtsSupported() || !this.isTtsPlayingActive) {
      onDone();
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = SPEECH_LOCALE_MAP[langCode] || 'hi-IN';
      utterance.rate = 0.95;

      if (this.cachedVoices.length === 0) {
        this.cachedVoices = window.speechSynthesis.getVoices();
      }
      const langLower = utterance.lang.toLowerCase().replace('_', '-');
      const langPrefix = langCode.toLowerCase();
      const match = this.cachedVoices.find(v => {
        const vl = v.lang.toLowerCase().replace('_', '-');
        return vl === langLower || vl.startsWith(langPrefix);
      });
      if (match) utterance.voice = match;

      utterance.onstart = () => {
        if (isFirst && this.onStartTtsCallback) {
          const cb = this.onStartTtsCallback;
          this.onStartTtsCallback = null;
          cb();
        }
      };
      utterance.onend = () => onDone();
      utterance.onerror = () => onDone();

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      onDone();
    }
  }

  /**
   * Speak text in chosen language (with full native audio streaming for all 7 languages)
   */
  public speak(
    text: string,
    langCode: LanguageCode,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    const currencyWords: Record<LanguageCode, string> = {
      hi: ' रुपये ',
      ta: ' ரூபாய் ',
      te: ' రూపాయలు ',
      ml: ' രൂപ ',
      kn: ' ರೂಪಾಯಿ ',
      bn: ' টাকা ',
      en: ' rupees ',
    };

    // Clean text for natural speech synthesis
    const cleanText = text
      .replace(/[*_#`~[\]()]/g, '')
      .replace(/₹\s*(\d+)/g, (_, n) => `${n}${currencyWords[langCode] || ' रुपये '}`)
      .replace(/₹/g, currencyWords[langCode] || ' रुपये ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    this.isTtsPlayingActive = true;
    this.currentLangPlaying = langCode;
    this.onStartTtsCallback = onStart || null;
    this.onEndTtsCallback = onEnd || null;
    this.audioQueue = this.chunkTextForTts(cleanText);

    this.playNextTtsChunk(true);
  }

  public stopSpeaking() {
    this.isTtsPlayingActive = false;
    this.audioQueue = [];

    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.src = '';
      } catch (e) {}
      this.activeAudio = null;
    }

    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch (e) {}
      this.currentObjectUrl = null;
    }

    if (this.isTtsSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    if (this.ttsTimeoutId) {
      clearTimeout(this.ttsTimeoutId);
      this.ttsTimeoutId = null;
    }

    if (this.onEndTtsCallback) {
      const cb = this.onEndTtsCallback;
      this.onEndTtsCallback = null;
      cb();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.cachedVoices;
  }
}

export const voiceService = new VoiceService();
