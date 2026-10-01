import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  Mic, 
  Square,
  Send, 
  RotateCcw,
  Printer
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { LanguageCode } from '../types';
import { voiceService } from '../services/voiceService';

export const ComplaintScreen: React.FC = () => {
  const { 
    goBack, 
    navigateTo, 
    complaintDraft, 
    updateComplaintDraft, 
    resetComplaintDraft, 
    speakMessage,
    isDemoMode,
    t,
    language 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [isListeningInput, setIsListeningInput] = useState<boolean>(false);
  const [isProcessingSubmission, setIsProcessingSubmission] = useState<boolean>(false);
  const [hasConfirmedComplaint, setHasConfirmedComplaint] = useState<boolean>(false);
  const [complaintRefId, setComplaintRefId] = useState<string>('');

  const LOCALIZED_QUESTIONS: Record<LanguageCode, {
    field: string;
    title: string;
    spoken: string;
    placeholder: string;
  }[]> = {
    ta: [
      {
        field: 'complainantName',
        title: 'உங்கள் பெயர் மற்றும் தொலைபேசி எண் என்ன?',
        spoken: 'வணக்கம். முறைப்படியான புகார் தயாரிக்க உதவுகிறேன். உங்கள் பெயர் மற்றும் தொலைபேசி எண்ணை சொல்லுங்கள்.',
        placeholder: 'உதாரணம்: மீனா முருகன், 9876543210',
      },
      {
        field: 'incidentType',
        title: 'என்ன நடந்தது? நடந்த சம்பவத்தை விரிவாக சொல்லுங்கள்.',
        spoken: 'உங்களுக்கு என்ன நடந்தது? நடந்த சம்பவத்தை குரல் மூலம் விரிவாக விவரிக்கவும்.',
        placeholder: 'உதாரணம்: பேருந்தில் தொல்லை கொடுத்தார்கள் / அண்டை வீட்டார் மிரட்டல்',
      },
      {
        field: 'date',
        title: 'இந்த சம்பவம் எப்போது நடந்தது? (தேதி மற்றும் நேரம்)',
        spoken: 'இந்த சம்பவம் எப்போது நடந்தது? தேதி மற்றும் தோராயமான நேரத்தை சொல்லுங்கள்.',
        placeholder: 'உதாரணம்: நேற்று மாலை சுமார் 6:30 மணிக்கு',
      },
      {
        field: 'location',
        title: 'சம்பவம் எங்கு நடந்தது? (இடத்தின் முகவரி)',
        spoken: 'சம்பவம் எங்கு நடந்தது? இடத்தை தெளிவாக கூறுங்கள்.',
        placeholder: 'உதாரணம்: தாம்பரம் பேருந்து நிறுத்தம் அருகில்',
      },
      {
        field: 'personsInvolved',
        title: 'இதில் சம்பந்தப்பட்ட நபர்கள் யார்? (தெரிந்தவர்களா / அடையாளம் தெரியாதவர்களா)',
        spoken: 'இதில் ஈடுபட்ட நபர்கள் யார்? தெரிந்தவர்களா அல்லது அடையாளம் தெரியாத நபர்களா?',
        placeholder: 'உதாரணம்: கருப்பு நிற பைக் ஓட்டி வந்த அடையாளம் தெரியாத இருவர்',
      },
      {
        field: 'evidence',
        title: 'உங்களிடம் சாட்சிகள், சிசிடிவி அல்லது மெசேஜ் ஆதாரங்கள் உள்ளதா?',
        spoken: 'உங்களிடம் சாட்சிகள், சிசிடிவி அல்லது வாட்ஸ்அப் மெசேஜ் போன்ற ஆதாரங்கள் உள்ளதா?',
        placeholder: 'உதாரணம்: அருகில் உள்ள கடைக்காரர் பார்த்தார், மெசேஜ் ஆதாரம் உள்ளது',
      },
    ],
    hi: [
      {
        field: 'complainantName',
        title: 'आपका नाम और मोबाइल नंबर क्या है?',
        spoken: 'नमस्ते। औपचारिक शिकायत पत्र तैयार करने के लिए आपका नाम और मोबाइल नंबर बताएं।',
        placeholder: 'उदा: सुनीता शर्मा, 9876543210',
      },
      {
        field: 'incidentType',
        title: 'क्या घटना हुई? कृपया विस्तार से बताएं।',
        spoken: 'क्या हुआ? घटना का पूरा विवरण बोलकर बताइए।',
        placeholder: 'उदा: रास्ते में छेड़छाड़ / पड़ोसी द्वारा गाली-गलौज व धमकी',
      },
      {
        field: 'date',
        title: 'यह घटना कब हुई? (दिनांक और समय)',
        spoken: 'घटना किस तारीख और किस समय हुई?',
        placeholder: 'उदा: कल शाम लगभग 7:00 बजे',
      },
      {
        field: 'location',
        title: 'घटना किस स्थान पर हुई? (सटीक पता या क्षेत्र)',
        spoken: 'घटना का स्थान क्या था?',
        placeholder: 'उदा: मुख्य बाजार, बस स्टॉप के पास',
      },
      {
        field: 'personsInvolved',
        title: 'इसमें कौन लोग शामिल थे? (पहचान या अज्ञात)',
        spoken: 'घटना में कौन लोग शामिल थे?',
        placeholder: 'उदा: दो अज्ञात युवक',
      },
      {
        field: 'evidence',
        title: 'क्या आपके पास कोई गवाह या सबूत है?',
        spoken: 'क्या कोई गवाह, सीसीटीवी या फोन रिकॉर्डिंग मौजूद है?',
        placeholder: 'उदा: दुकानदार गवाह हैं, फोटो उपलब्ध है',
      },
    ],
    te: [
      {
        field: 'complainantName',
        title: 'మీ పేరు మరియు ఫోన్ నంబర్ ఏమిటి?',
        spoken: 'నమస్కారం. ఫిర్యాదు పత్రం కోసం మీ పేరు మరియు మొబైల్ నంబర్ చెప్పండి.',
        placeholder: 'ఉదా: లక్ష్మి, 9876543210',
      },
      {
        field: 'incidentType',
        title: 'ఏం జరిగింది? వివరంగా చెప్పండి.',
        spoken: 'ఏం జరిగిందో వివరంగా మాట్లాడండి.',
        placeholder: 'ఉదా: వేధింపులు / బెదిరింపులు',
      },
      {
        field: 'date',
        title: 'ఈ సంఘటన ఎప్పుడు జరిగింది? (తేదీ మరియు సమయం)',
        spoken: 'ఈ సంఘటన ఎప్పుడు జరిగిందో చెప్పండి.',
        placeholder: 'ఉదా: నిన్న సాయంత్రం 6 గంటలకు',
      },
      {
        field: 'location',
        title: 'సంఘటన ఎక్కడ జరిగింది?',
        spoken: 'సంఘటన జరిగిన స్థలం ఏమిటి?',
        placeholder: 'ఉదా: బస్టాండ్ సమీపంలో',
      },
      {
        field: 'personsInvolved',
        title: 'ఎవరు దీనికి బాధ్యులు?',
        spoken: 'ఎవరు పాల్గొన్నారో చెప్పండి.',
        placeholder: 'ఉదా: గుర్తుతెలియని వ్యక్తులు',
      },
      {
        field: 'evidence',
        title: 'సాక్షులు లేదా ఆధారాలు ఏమైనా ఉన్నాయా?',
        spoken: 'సాక్షులు లేదా ఆధారాలు ఉన్నాయా?',
        placeholder: 'ఉదా: సాక్షులు ఉన్నారు',
      },
    ],
    en: [
      {
        field: 'complainantName',
        title: 'What is your name and phone number?',
        spoken: 'Hello. I will help you draft an official complaint. What is your name and phone number?',
        placeholder: 'e.g. Meena, 9876543210',
      },
      {
        field: 'incidentType',
        title: 'What happened? Describe the incident.',
        spoken: 'What happened? Please describe the incident in detail.',
        placeholder: 'e.g. Harassment on public bus / threats by neighbor',
      },
      {
        field: 'date',
        title: 'When did it happen? (Date & approximate time)',
        spoken: 'When did this incident happen? Mention the date and time.',
        placeholder: 'e.g. Yesterday evening around 6:30 PM',
      },
      {
        field: 'location',
        title: 'Where did it happen? (Exact address or area)',
        spoken: 'Where did it occur? Please state the location.',
        placeholder: 'e.g. Main Road bus stop, Tambaram',
      },
      {
        field: 'personsInvolved',
        title: 'Who was involved? (Known persons or unknown suspects)',
        spoken: 'Who was involved? Known persons or unknown suspects?',
        placeholder: 'e.g. Two unidentified men on a black motorcycle',
      },
      {
        field: 'evidence',
        title: 'Do you have any witnesses, CCTV, or phone evidence?',
        spoken: 'Do you have any witnesses, CCTV, or message evidence?',
        placeholder: 'e.g. Local shopkeeper witnessed, saved WhatsApp screenshots',
      },
    ],
    ml: [],
    kn: [],
    bn: [],
  };

  const interviewQuestions = LOCALIZED_QUESTIONS[language]?.length 
    ? LOCALIZED_QUESTIONS[language] 
    : (LOCALIZED_QUESTIONS['ta'] || LOCALIZED_QUESTIONS['en']);

  // Speak prompt on step transition
  useEffect(() => {
    if (currentStep < interviewQuestions.length) {
      speakMessage(interviewQuestions[currentStep].spoken);
    } else if (currentStep === interviewQuestions.length) {
      const reviewPrompt = language === 'ta'
        ? 'புகார் விவரங்கள் தொகுக்கப்பட்டுவிட்டன. இதனை சரிபார்த்துவிட்டு சமர்ப்பிக்க உறுதி செய்யவும்.'
        : 'The incident details have been compiled into a structured complaint draft. Please review and confirm.';
      speakMessage(reviewPrompt);
    }
  }, [currentStep, language]);

  // Handle continuous recording for current question
  const handleToggleRecordAnswer = () => {
    if (isListeningInput) {
      const finalText = voiceService.stopListening();
      setIsListeningInput(false);
      const textToSave = finalText || answerInput;
      if (textToSave.trim()) {
        setAnswerInput(textToSave.trim());
      }
    } else {
      setIsListeningInput(true);
      setAnswerInput('');
      voiceService.startListening(
        language,
        (currentTranscript) => {
          setAnswerInput(currentTranscript);
        },
        (err) => {
          console.warn('Voice recording error:', err);
          setIsListeningInput(false);
        },
        (finalResult) => {
          setIsListeningInput(false);
          if (finalResult && finalResult.trim()) {
            setAnswerInput(finalResult.trim());
          }
        }
      );
    }
  };

  const handleNextInterviewStep = (val?: string) => {
    const text = (val || answerInput).trim();
    if (!text) return;

    if (isListeningInput) {
      voiceService.stopListening();
      setIsListeningInput(false);
    }

    const currentQ = interviewQuestions[currentStep];
    if (currentStep === 0) {
      updateComplaintDraft({
        complainantName: text.split(',')[0].trim(),
        phone: text.split(',')[1]?.trim() || '9876543210',
      });
    } else {
      updateComplaintDraft({
        [currentQ.field]: text,
      });
    }

    setAnswerInput('');
    setCurrentStep((prev) => prev + 1);
  };

  const handleConfirmAndProceed = () => {
    setIsProcessingSubmission(true);
    const submittingText = language === 'ta'
      ? 'முறைப்படியான புகார் கடிதம் தயாரிக்கப்படுகிறது. காத்திருக்கவும்...'
      : 'Processing your structured complaint draft...';
    speakMessage(submittingText);

    setTimeout(() => {
      setIsProcessingSubmission(false);
      setHasConfirmedComplaint(true);
      const generatedRef = `FIR-DRAFT-${Math.floor(100000 + Math.random() * 900000)}`;
      setComplaintRefId(generatedRef);
      updateComplaintDraft({
        id: generatedRef,
        status: isDemoMode ? 'submitted_simulation' : 'handed_off_official',
        submittedAt: new Date().toLocaleString(),
      });

      const message = language === 'ta'
        ? `முறைப்படியான புகார் அறிக்கை தயாரிக்கப்பட்டது. டோக்கன் எண்: ${generatedRef}. இதனை காவல் நிலையத்திலோ அல்லது மகளிர் ஆணையத்திலோ சமர்ப்பிக்கலாம்.`
        : isDemoMode
        ? `Structured complaint letter generated for simulation. Token number is ${generatedRef}.`
        : `Official complaint draft prepared. Please continue to the National Commission for Women or local police.`;
      speakMessage(message);
    }, 1500);
  };

  const handlePrintDraft = () => {
    window.print();
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
        <div className="flex items-center gap-1 bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">
          <FileText size={15} />
          <span>{language === 'ta' ? 'புகார் தயாரிப்பு' : 'Complaint Assistant'}</span>
        </div>
      </div>

      {/* Hero Banner (Localized) */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md inline-block">
              {language === 'ta' ? 'குரல் வழி புகார் நேர்காணல்' : 'AI Voice Interview'}
            </span>
            <h3 className="text-lg sm:text-xl font-black mt-1">
              {language === 'ta' ? 'குரல் வழி முறைப்படியான புகார் தயாரிப்பு' : 'Voice-Guided Complaint Drafting'}
            </h3>
            <p className="text-xs text-purple-100 font-medium leading-relaxed">
              {language === 'ta'
                ? 'சகி கேட்கும் கேள்விகளுக்கு வாய்மொழியாக பதில் சொல்லுங்கள். அது முறைப்படியான FIR வடிவத்தில் மாற்றப்படும்.'
                : 'Sakhi converts spoken statements into structured legal format for police/NCW reporting.'}
            </p>
          </div>
          <SpeakButton
            textToSpeak={
              language === 'ta'
                ? 'புகார் அளிக்கும் பிரிவு. சகி கேட்கும் கேள்விகளுக்கு குரல் மூலம் பதில் அளித்தால் அது முறைப்படியான புகார் கடிதமாக மாற்றப்படும்.'
                : 'Complaint filing assistant. Answer questions by speaking.'
            }
            size="md"
          />
        </div>
      </div>

      {/* Step Progress Indicators */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
        {interviewQuestions.map((q, idx) => (
          <div key={idx} className="flex items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                idx < currentStep
                  ? 'bg-purple-600 text-white'
                  : idx === currentStep
                  ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            {idx < interviewQuestions.length - 1 && (
              <div
                className={`w-3 sm:w-5 h-0.5 mx-1 rounded ${
                  idx < currentStep ? 'bg-purple-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Question Card with Continuous Microphone Button */}
      {currentStep < interviewQuestions.length && !hasConfirmedComplaint && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="text-xs font-bold text-purple-600 uppercase">
                {language === 'ta' ? `கேள்வி ${currentStep + 1} / ${interviewQuestions.length}` : `Question ${currentStep + 1} of ${interviewQuestions.length}`}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1 leading-snug">
                {interviewQuestions[currentStep].title}
              </h4>
            </div>
            <SpeakButton
              textToSpeak={interviewQuestions[currentStep].spoken}
              size="md"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="relative">
              <textarea
                rows={3}
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder={interviewQuestions[currentStep].placeholder}
                className="w-full text-xs sm:text-sm p-3.5 pr-12 rounded-2xl border-2 border-purple-200 focus:outline-none focus:border-purple-500 font-medium resize-none shadow-inner"
              />

              {/* Direct Continuous Mic Button inside the Card */}
              <button
                onClick={handleToggleRecordAnswer}
                type="button"
                className={`absolute right-2.5 bottom-3.5 w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md ${
                  isListeningInput
                    ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                    : 'bg-purple-700 hover:bg-purple-800 text-white'
                }`}
                title={isListeningInput ? 'Tap to finish recording' : 'Tap to speak your answer'}
              >
                {isListeningInput ? (
                  <Square size={16} className="fill-white" />
                ) : (
                  <Mic size={18} />
                )}
              </button>
            </div>

            {/* Recording status pill */}
            {isListeningInput && (
              <div className="bg-red-600/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>
                  {language === 'ta'
                    ? 'கேட்கிறேன்... பேசி முடித்ததும் சிவப்பு பொத்தானை மீண்டும் அழுத்தவும்.'
                    : 'Listening continuously... tap the red button when finished.'}
                </span>
              </div>
            )}

            <button
              onClick={() => handleNextInterviewStep()}
              type="button"
              disabled={!answerInput.trim() && !isListeningInput}
              className="w-full py-3.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{language === 'ta' ? 'பதிவு செய்து அடுத்த கேள்விக்கு செல்' : 'Record & Continue'}</span>
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Review Screen (Localized) */}
      {currentStep >= interviewQuestions.length && !hasConfirmedComplaint && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase flex items-center gap-1">
                <CheckCircle size={14} /> {language === 'ta' ? 'விவரங்கள் தொகுக்கப்பட்டது' : 'AI Structured Draft'}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {language === 'ta' ? 'புகார் அறிக்கையை சரிபார்க்கவும்' : 'Review Complaint Statement'}
              </h4>
            </div>
            <SpeakButton
              textToSpeak={
                language === 'ta'
                  ? 'புகார் விவரங்கள் தொகுக்கப்பட்டுவிட்டன. இதனை சரிபார்த்துவிட்டு சமர்ப்பிக்க உறுதி செய்யவும்.'
                  : 'Complaint statement ready. Please review.'
              }
              size="md"
            />
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'புகார்தாரர்:' : 'Complainant:'}</span>
              <span className="font-bold text-slate-900">{complaintDraft.complainantName || 'அநாமதேய சாட்சி'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'தொலைபேசி எண்:' : 'Phone Number:'}</span>
              <span className="font-bold text-slate-900">{complaintDraft.phone || '9876543210'}</span>
            </div>
            <div className="py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium block">{language === 'ta' ? 'சம்பவ விவரம்:' : 'Incident Description:'}</span>
              <p className="font-bold text-slate-900 mt-0.5">{complaintDraft.incidentType || 'விவரம் அளிக்கப்படவில்லை'}</p>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'தேதி / நேரம்:' : 'Date / Time:'}</span>
              <span className="font-bold text-slate-900">{complaintDraft.date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'சம்பவம் நடந்த இடம்:' : 'Location:'}</span>
              <span className="font-bold text-slate-900">{complaintDraft.location || 'உள்ளூர் பகுதி'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">{language === 'ta' ? 'சம்பந்தப்பட்ட நபர்கள்:' : 'Accused / Involved:'}</span>
              <span className="font-bold text-slate-900">{complaintDraft.personsInvolved || 'அடையாளம் தெரியாதவர்கள்'}</span>
            </div>
            <div className="py-1">
              <span className="text-slate-500 font-medium block">{language === 'ta' ? 'சாட்சிகள் / ஆதாரங்கள்:' : 'Evidence & Witnesses:'}</span>
              <span className="font-bold text-slate-900">{complaintDraft.evidence || 'கூறப்படவில்லை'}</span>
            </div>
          </div>

          {/* Explicit User Confirmation */}
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
            <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>{language === 'ta' ? 'உறுதிமொழி:' : 'Explicit Confirmation:'}</strong>{' '}
              {language === 'ta'
                ? 'உங்கள் நேரடி அனுமதி மற்றும் உறுதிப்படுத்தல் இன்றி எந்தவொரு புகாரும் அதிகாரிகளுக்கு அனுப்பப்படாது.'
                : 'No complaint will be submitted without your explicit confirmation.'}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setCurrentStep(0)}
              type="button"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
            >
              {language === 'ta' ? 'திருத்துக' : 'Edit'}
            </button>

            <button
              onClick={handleConfirmAndProceed}
              disabled={isProcessingSubmission}
              type="button"
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckCircle size={16} />
              <span>{isProcessingSubmission ? (language === 'ta' ? 'தயாரிக்கிறது...' : 'Formatting...') : (language === 'ta' ? 'உறுதி செய்து புகார் கடிதம் பெற' : 'Confirm & Generate Complaint')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Status Screen */}
      {hasConfirmedComplaint && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-lg space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle size={36} />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-slate-900">
              {language === 'ta' ? 'முறைப்படியான புகார் கடிதம் தயார்' : (isDemoMode ? 'Complaint Draft Prepared' : 'Official Portal Handoff Ready')}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              {language === 'ta' ? 'ஆவண டோக்கன் எண்:' : 'Reference Document:'} <span className="font-mono font-bold text-purple-700">{complaintRefId}</span>
            </p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200 text-xs text-purple-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-purple-900">
              <ShieldCheck size={16} className="text-purple-600" />
              <span>{language === 'ta' ? 'அதிகாரப்பூர்வ சமர்ப்பிப்பு வழிகள்' : 'Submission Channels'}</span>
            </div>
            <p className="leading-relaxed">
              {language === 'ta'
                ? 'உங்கள் குரல் நேர்காணல் மூலம் முழுமையான புகார் கடிதம் தயாராகிவிட்டது. இதனை தேசிய மகளிர் ஆணையத்திலோ அல்லது அருகிலுள்ள காவல் நிலையத்திலோ சமர்ப்பிக்கலாம்.'
                : 'Your complaint is formatted to official police/NCW specifications.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href="https://ncw.nic.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs font-bold text-white bg-purple-700 px-3 py-2 rounded-xl hover:bg-purple-800 transition-colors"
              >
                <span>{language === 'ta' ? 'தேசிய மகளிர் ஆணையம் (NCW)' : 'National Commission for Women'}</span>
                <ExternalLink size={12} />
              </a>

              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs font-bold text-purple-800 bg-white border border-purple-200 px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <span>{language === 'ta' ? 'சைபர் க்ரைம் இணையதளம்' : 'Cybercrime Portal'}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <button
            onClick={handlePrintDraft}
            type="button"
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer size={15} />
            <span>{language === 'ta' ? 'புகார் கடிதத்தை அச்சிடுக / சேமிக்க' : 'Print / Save Complaint Document'}</span>
          </button>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                resetComplaintDraft();
                setCurrentStep(0);
                setHasConfirmedComplaint(false);
              }}
              type="button"
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw size={14} />
              <span>{language === 'ta' ? 'புதிய புகார்' : 'New Complaint'}</span>
            </button>

            <button
              onClick={() => navigateTo('home')}
              type="button"
              className="flex-1 py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl transition-colors"
            >
              {language === 'ta' ? 'முகப்புக்கு செல்க' : 'Return Home'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
