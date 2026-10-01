import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  ExternalLink,
  Mic,
  Square,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { VERIFIED_SCHEMES } from '../data/schemes';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';

export const SchemeApplyScreen: React.FC = () => {
  const { 
    goBack, 
    navigateTo, 
    selectedSchemeForApply, 
    applicationDraft, 
    updateApplicationDraft, 
    resetApplicationDraft,
    speakMessage,
    isDemoMode,
    t,
    language 
  } = useApp();

  const scheme = selectedSchemeForApply || VERIFIED_SCHEMES[0];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentVoiceAnswer, setCurrentVoiceAnswer] = useState<string>('');
  const [isListeningInput, setIsListeningInput] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  const LOCALIZED_QUESTIONS: Record<LanguageCode, {
    field: string;
    text: string;
    spoken: string;
    placeholder: string;
  }[]> = {
    ta: [
      {
        field: 'applicantName',
        text: 'உங்கள் முழுப் பெயர் என்ன?',
        spoken: 'வணக்கம், விண்ணப்பத்தை பூர்த்தி செய்ய உதவுவேன். உங்கள் முழுப் பெயர் என்ன?',
        placeholder: 'உதாரணம்: கவிதா முருகன்',
      },
      {
        field: 'age',
        text: 'உங்கள் வயது அல்லது பிறந்த தேதி என்ன?',
        spoken: 'உங்கள் வயது என்ன என்று கூறுங்கள்.',
        placeholder: 'உதாரணம்: 26 வயது',
      },
      {
        field: 'phone',
        text: 'தகவல் பெற உங்கள் அலைபேசி எண் என்ன?',
        spoken: 'தகவல் மற்றும் குறுஞ்செய்தி பெற உங்கள் தொலைபேசி எண் என்ன?',
        placeholder: 'உதாரணம்: 9876543210',
      },
      {
        field: 'aadhaarOrRation',
        text: 'உங்கள் ஆதார் அல்லது ரேஷன் அட்டை எண் என்ன?',
        spoken: 'உங்கள் ஆதார் அல்லது ரேஷன் அட்டை எண்ணை கூறுங்கள்.',
        placeholder: 'உதாரணம்: 4567 8901 2345',
      },
      {
        field: 'bankAccount',
        text: 'அரசு நிதி உதவி வர உங்கள் வங்கி கணக்கு எண் என்ன?',
        spoken: 'அரசு நிதி உதவி நேரடியாக வங்கிக்கு வர உங்கள் கணக்கு எண் என்ன?',
        placeholder: 'உதாரணம்: 10987654321, இந்தியன் வங்கி',
      },
    ],
    hi: [
      {
        field: 'applicantName',
        text: 'आपका पूरा नाम क्या है?',
        spoken: 'नमस्ते, आवेदन पत्र भरने के लिए आपका पूरा नाम बताइए।',
        placeholder: 'उदा: सुनीता देवी',
      },
      {
        field: 'age',
        text: 'आपकी आयु या जन्मतिथि क्या है?',
        spoken: 'आपकी आयु कितनी है बताइए।',
        placeholder: 'उदा: 28 वर्ष',
      },
      {
        field: 'phone',
        text: 'आपका मोबाइल नंबर क्या है?',
        spoken: 'सूचना प्राप्त करने हेतु मोबाइल नंबर बताएं।',
        placeholder: 'उदा: 9876543210',
      },
      {
        field: 'aadhaarOrRation',
        text: 'आपका आधार कार्ड या राशन कार्ड नंबर क्या है?',
        spoken: 'आधार या राशन कार्ड नंबर बताइए।',
        placeholder: 'उदा: 4567 8901 2345',
      },
      {
        field: 'bankAccount',
        text: 'सहायता राशि प्राप्त करने हेतु बैंक खाता संख्या क्या है?',
        spoken: 'अपना बैंक खाता नंबर और बैंक का नाम बताएं।',
        placeholder: 'उदा: भारतीय स्टेट बैंक, खाता संख्या',
      },
    ],
    te: [
      {
        field: 'applicantName',
        text: 'మీ పూర్తి పేరు ఏమిటి?',
        spoken: 'నమస్కారం, దరఖాస్తు కోసం మీ పూర్తి పేరు చెప్పండి.',
        placeholder: 'ఉదా: కవిత',
      },
      {
        field: 'age',
        text: 'మీ వయస్సు ఎంత?',
        spoken: 'మీ వయస్సు ఎంత చెప్పండి.',
        placeholder: 'ఉదా: 25 సంవత్సరాలు',
      },
      {
        field: 'phone',
        text: 'మీ మొబైల్ నంబర్ ఏమిటి?',
        spoken: 'సమాచారం కోసం మీ ఫోన్ నంబర్ చెప్పండి.',
        placeholder: 'ఉదా: 9876543210',
      },
      {
        field: 'aadhaarOrRation',
        text: 'మీ ఆధార్ లేదా రేషన్ కార్డు నంబర్?',
        spoken: 'ఆధార్ లేదా రేషన్ కార్డు వివరాలు చెప్పండి.',
        placeholder: 'ఉదా: ఆధార్ నంబర్',
      },
      {
        field: 'bankAccount',
        text: 'మీ బ్యాంక్ ఖాతా సంఖ్య ఏమిటి?',
        spoken: 'డబ్బులు జమ కావడానికి బ్యాంక్ ఖాతా చెప్పండి.',
        placeholder: 'ఉదా: స్టేట్ బ్యాంక్ అకౌంట్',
      },
    ],
    en: [
      {
        field: 'applicantName',
        text: 'What is your full name?',
        spoken: 'Hello, I will assist you with the application. What is your full name?',
        placeholder: 'e.g. Kavitha Murugan',
      },
      {
        field: 'age',
        text: 'What is your age or date of birth?',
        spoken: 'What is your age or date of birth?',
        placeholder: 'e.g. 26 years',
      },
      {
        field: 'phone',
        text: 'What is your mobile number for updates?',
        spoken: 'What is your mobile phone number?',
        placeholder: 'e.g. 9876543210',
      },
      {
        field: 'aadhaarOrRation',
        text: 'What is your Aadhaar or Ration Card number?',
        spoken: 'What is your Aadhaar or Ration card number?',
        placeholder: 'e.g. 4567 8901 2345',
      },
      {
        field: 'bankAccount',
        text: 'What is your bank account number for direct benefits?',
        spoken: 'What is your bank account number for direct money transfer?',
        placeholder: 'e.g. 10987654321, State Bank of India',
      },
    ],
    ml: [],
    kn: [],
    bn: [],
  };

  const questions = LOCALIZED_QUESTIONS[language]?.length 
    ? LOCALIZED_QUESTIONS[language] 
    : (LOCALIZED_QUESTIONS['ta'] || LOCALIZED_QUESTIONS['en']);

  // Speak prompt whenever step changes
  useEffect(() => {
    if (currentStep < questions.length) {
      speakMessage(questions[currentStep].spoken);
    } else if (currentStep === questions.length) {
      const reviewText = language === 'ta'
        ? `விண்ணப்ப விவரங்கள் தயார். விண்ணப்பதாரர்: ${applicationDraft.applicantName || 'கவிதா'}. சமர்ப்பிக்க உறுதி செய்யவும்.`
        : 'Your application details have been collected and verified. Would you like to submit or proceed to the official government portal?';
      speakMessage(reviewText);
    }
  }, [currentStep, language]);

  // Continuous Voice Recording toggle for answering questions
  const handleToggleCardVoice = () => {
    if (isListeningInput) {
      const finalText = voiceService.stopListening();
      setIsListeningInput(false);
      const val = finalText || currentVoiceAnswer;
      if (val.trim()) {
        setCurrentVoiceAnswer(val.trim());
      }
    } else {
      setIsListeningInput(true);
      setCurrentVoiceAnswer('');
      voiceService.startListening(
        language,
        (currentTranscript) => {
          setCurrentVoiceAnswer(currentTranscript);
        },
        (err) => {
          console.warn('Voice recording error:', err);
          setIsListeningInput(false);
        },
        (finalResult) => {
          setIsListeningInput(false);
          if (finalResult && finalResult.trim()) {
            setCurrentVoiceAnswer(finalResult.trim());
          }
        }
      );
    }
  };

  const handleNextStep = (valueToSave?: string) => {
    const val = (valueToSave || currentVoiceAnswer).trim();
    if (!val) return;

    if (isListeningInput) {
      voiceService.stopListening();
      setIsListeningInput(false);
    }

    const currentQ = questions[currentStep];
    updateApplicationDraft({
      [currentQ.field]: val,
    });
    setCurrentVoiceAnswer('');
    setCurrentStep((prev) => prev + 1);
  };

  const handleConfirmSubmit = () => {
    setIsSubmitting(true);
    const waitingText = language === 'ta'
      ? 'விண்ணப்பம் தயாரிக்கப்படுகிறது. தயவுசெய்து காத்திருக்கவும்...'
      : 'Submitting your application draft. Please wait...';
    speakMessage(waitingText);

    setTimeout(() => {
      setIsSubmitting(false);
      setHasConfirmed(true);
      const generatedRef = `SAKHI-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceNumber(generatedRef);
      updateApplicationDraft({
        status: isDemoMode ? 'submitted_simulation' : 'handed_off_portal',
        applicationRefNo: generatedRef,
        submittedAt: new Date().toLocaleString(),
      });

      const completionMessage = language === 'ta'
        ? `விண்ணப்ப வரைவு வெற்றிகரமாக தயாரிக்கப்பட்டது. உங்கள் குறிப்பு எண்: ${generatedRef}. இதனை அரசு இணையதளத்தில் இறுதி செய்யலாம்.`
        : isDemoMode
        ? `Application draft prepared successfully. Your simulation reference number is ${generatedRef}.`
        : `Your application information has been formatted. Please proceed to the official portal to finalize.`;
      speakMessage(completionMessage);
    }, 1500);
  };

  return (
    <div className="pb-32 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
          <span>{t('goBack')}</span>
        </button>
        <div className="flex items-center gap-1 bg-rose-50 text-rose-800 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
          <FileText size={15} />
          <span>{language === 'ta' ? 'குரல் வழி விண்ணப்பம்' : 'Voice-Guided Form'}</span>
        </div>
      </div>

      {/* Target Scheme Banner */}
      <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm flex items-center justify-between gap-3">
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
            {language === 'ta' ? 'விண்ணப்பிக்கும் திட்டம்' : 'Applying for'}
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-0.5 leading-snug">
            {scheme.nativeName[language] || scheme.nativeName['en']}
          </h3>
          <p className="text-xs text-slate-500">{scheme.ministry}</p>
        </div>
        <SpeakButton
          textToSpeak={`${scheme.nativeName[language] || scheme.name} திட்டத்திற்கு விண்ணப்பிக்கும் குரல் படிவம்.`}
          size="sm"
        />
      </div>

      {/* Step Progression Indicators */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex items-center justify-between">
        {questions.map((q, idx) => (
          <div key={idx} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                idx < currentStep
                  ? 'bg-emerald-500 text-white'
                  : idx === currentStep
                  ? 'bg-rose-600 text-white ring-4 ring-rose-200'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            {idx < questions.length - 1 && (
              <div
                className={`w-4 sm:w-6 h-1 mx-1 rounded ${
                  idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Question Box */}
      {currentStep < questions.length && !hasConfirmed && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="text-xs font-bold text-rose-600 uppercase">
                {language === 'ta' ? `படிநிலை ${currentStep + 1} / ${questions.length}` : `Step ${currentStep + 1} of ${questions.length}`}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 leading-snug">
                {questions[currentStep].text}
              </h4>
            </div>
            <SpeakButton textToSpeak={questions[currentStep].spoken} size="md" />
          </div>

          <div className="space-y-3 pt-2">
            <div className="relative">
              <input
                type="text"
                value={currentVoiceAnswer}
                onChange={(e) => setCurrentVoiceAnswer(e.target.value)}
                placeholder={questions[currentStep].placeholder}
                className="w-full text-xs sm:text-sm px-4 py-3.5 pr-12 rounded-2xl border-2 border-rose-200 focus:outline-none focus:border-rose-500 font-medium shadow-inner"
              />

              {/* Direct Continuous Mic Recording Button */}
              <button
                onClick={handleToggleCardVoice}
                type="button"
                className={`absolute right-2 top-2 w-9 h-9 rounded-xl flex items-center justify-center transition-transform active:scale-90 shadow-sm ${
                  isListeningInput
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                title={isListeningInput ? 'Tap to finish recording' : 'Tap to speak your answer'}
              >
                {isListeningInput ? (
                  <Square size={15} className="fill-white" />
                ) : (
                  <Mic size={17} />
                )}
              </button>
            </div>

            {/* Recording Feedback Hint */}
            {isListeningInput && (
              <div className="bg-red-600/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>
                  {language === 'ta'
                    ? 'கேட்கிறேன்... பேசி முடித்ததும் சிவப்பு பொத்தானை மீண்டும் அழுத்தவும்.'
                    : 'Listening continuously... tap the button when finished.'}
                </span>
              </div>
            )}

            <button
              onClick={() => handleNextStep()}
              type="button"
              disabled={!currentVoiceAnswer.trim() && !isListeningInput}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{language === 'ta' ? 'உறுதி செய்து அடுத்த படிக்கு செல்' : 'Confirm & Next'}</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Review Screen (Localized) */}
      {currentStep >= questions.length && !hasConfirmed && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
                <CheckCircle size={14} /> {language === 'ta' ? 'விவரங்கள் பெறப்பட்டன' : 'Information Collected'}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {language === 'ta' ? 'விண்ணப்பத்தை சரிபார்க்கவும்' : 'Review Your Application'}
              </h4>
            </div>
            <SpeakButton
              textToSpeak={
                language === 'ta'
                  ? `விண்ணப்பம் தயார். பெயர்: ${applicationDraft.applicantName || 'கவிதா'}. சமர்ப்பிக்க உறுதி செய்யவும்.`
                  : `Application ready for review. Applicant: ${applicationDraft.applicantName}.`
              }
              size="md"
            />
          </div>

          <div className="space-y-2 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'விண்ணப்பதாரர் பெயர்:' : 'Applicant Name:'}</span>
              <span className="font-bold text-slate-900">{applicationDraft.applicantName || 'பதிவாகவில்லை'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'வயது:' : 'Age:'}</span>
              <span className="font-bold text-slate-900">{applicationDraft.age || '24'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'தொலைபேசி எண்:' : 'Mobile Phone:'}</span>
              <span className="font-bold text-slate-900">{applicationDraft.phone || '9876543210'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'ஆதார் / ரேஷன் எண்:' : 'ID (Aadhaar/Ration):'}</span>
              <span className="font-bold text-slate-900">{applicationDraft.aadhaarOrRation || 'XXXX-XXXX-1234'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'வங்கி கணக்கு:' : 'Bank Account:'}</span>
              <span className="font-bold text-slate-900">{applicationDraft.bankAccount || 'ஸ்டேட் பேங்க் ஆஃப் இந்தியா'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'மாநிலம் / மாவட்டம்:' : 'State / Region:'}</span>
              <span className="font-bold text-slate-900">{applicationDraft.addressState}</span>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>{language === 'ta' ? 'நேரடி உறுதிமொழி:' : 'Explicit Confirmation:'}</strong>{' '}
              {language === 'ta'
                ? 'உங்கள் நேரடி அனுமதி இன்றி எந்தவொரு விண்ணப்பமும் சமர்ப்பிக்கப்படாது. நீங்கள் எப்போது வேண்டுமானாலும் தகவல்களை மாற்றலாம்.'
                : 'No personal application is submitted without your direct permission.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setCurrentStep(0)}
              type="button"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
            >
              {language === 'ta' ? 'திருத்துக' : 'Edit Details'}
            </button>

            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              type="button"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckCircle size={16} />
              <span>{isSubmitting ? (language === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying...') : (language === 'ta' ? 'விண்ணப்பத்தை உறுதி செய்' : 'Yes, Submit Application')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Official Portal Handoff */}
      {hasConfirmed && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle size={36} />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              {language === 'ta' ? 'விண்ணப்ப வரைவு தயாராகிவிட்டது' : (isDemoMode ? 'Application Draft Created' : 'Ready for Government Portal')}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              {language === 'ta' ? 'விண்ணப்ப டோக்கன் குறிப்பு எண்:' : 'Reference Token:'}{' '}
              <span className="font-mono font-bold text-rose-600">{referenceNumber}</span>
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 text-xs text-blue-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>{language === 'ta' ? 'அதிகாரப்பூர்வ அரசு இணையதளத்தில் முடிக்கவும்' : 'Transparent Submission Process'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'ta'
                ? 'உங்கள் தகவல்கள் அனைத்தும் அரசுத் துறையின் விதிமுறைகளின்படி தொகுக்கப்பட்டுவிட்டன. பயோமெட்ரிக் / நேரடி சரிபார்ப்பை முடிக்க அதிகாரப்பூர்வ அரசு இணையதளத்திற்கு செல்லவும்.'
                : 'Application Prepared. To complete biometric or official authentication, continue to the verified government portal.'}
            </p>
            <div className="pt-1">
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <span>{language === 'ta' ? 'அரசு இணையதளத்தை திறக்க' : 'Open'} {scheme.officialUrl.replace('https://', '')}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                resetApplicationDraft();
                setCurrentStep(0);
                setHasConfirmed(false);
              }}
              type="button"
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw size={14} />
              <span>{language === 'ta' ? 'புதிய படிவம்' : 'New Form'}</span>
            </button>

            <button
              onClick={() => navigateTo('home')}
              type="button"
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl transition-colors"
            >
              {language === 'ta' ? 'முகப்புக்கு திரும்புக' : 'Return Home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
