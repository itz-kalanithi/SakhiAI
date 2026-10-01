import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lightbulb, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  Mic,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { EDUCATION_LESSONS } from '../data/education';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { LanguageCode } from '../types';

export const EducationScreen: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    goBack, 
    speakMessage, 
    stopSpeech,
    voiceState,
    t 
  } = useApp();

  const [isSimplerMode, setIsSimplerMode] = useState<boolean>(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  // Exactly one subject: Everyday Mathematics & Market Calculation
  const lesson = EDUCATION_LESSONS[0];
  const quiz = lesson.quizQuestions[0];

  const currentExplanation = isSimplerMode
    ? lesson.simpleExplanation[language] || lesson.simpleExplanation['en']
    : lesson.detailedExplanation[language] || lesson.detailedExplanation['en'];

  const handleSelectLanguage = (langCode: LanguageCode) => {
    setLanguage(langCode);
    const title = lesson.title[langCode] || lesson.title['en'];
    const expl = isSimplerMode
      ? lesson.simpleExplanation[langCode] || lesson.simpleExplanation['en']
      : lesson.detailedExplanation[langCode] || lesson.detailedExplanation['en'];
    speakMessage(`${title}. ${expl}`);
  };

  const handleToggleSimplerMode = () => {
    const nextState = !isSimplerMode;
    setIsSimplerMode(nextState);
    const textToSpeak = nextState
      ? lesson.simpleExplanation[language] || lesson.simpleExplanation['en']
      : lesson.detailedExplanation[language] || lesson.detailedExplanation['en'];
    speakMessage(textToSpeak);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedQuizAnswer(index);
    setShowQuizResult(true);

    const isCorrect = index === quiz.correctAnswerIndex;
    const explanation = quiz.explanation[language] || quiz.explanation['en'];

    if (isCorrect) {
      const correctPrefix: Record<LanguageCode, string> = {
        ta: 'மிகச் சரி! சரியான விடை.',
        hi: 'बहुत बढ़िया! बिल्कुल सही उत्तर।',
        te: 'చాలా మంచిది! సరైన సమాధానం.',
        ml: 'വളരെ ശരി! ശരിയായ ഉത്തരം.',
        kn: 'ತುಂಬಾ ಒಳ್ಳೆಯದು! ಸರಿಯಾದ ಉತ್ತರ.',
        bn: 'একদম ঠিক! সঠিক উত্তর।',
        en: 'Very good! That is correct.',
      };
      speakMessage(`${correctPrefix[language] || correctPrefix['en']} ${explanation}`);
    } else {
      const wrongPrefix: Record<LanguageCode, string> = {
        ta: 'தவறான விடை. சரியான விடை ₹50.',
        hi: 'गलत उत्तर। सही उत्तर ₹50 है।',
        te: 'తప్పు సమాధానం. సరైన సమాధానం ₹50.',
        ml: 'തെറ്റായ ഉത്തരം. ശരിയായ ഉത്തരം ₹50 രൂപ.',
        kn: 'ತಪ್ಪು ಉತ್ತರ. ಸರಿಯಾದ ಉತ್ತರ ₹50.',
        bn: 'ভুল উত্তর। সঠিক উত্তর ₹৫০।',
        en: 'Not quite. The correct answer is ₹50.',
      };
      speakMessage(`${wrongPrefix[language] || wrongPrefix['en']} ${explanation}`);
    }
  };

  const handleReadLessonAloud = () => {
    const fullText = `${lesson.title[language] || lesson.title['en']}. ${currentExplanation}. ${lesson.realLifeExample[language] || lesson.realLifeExample['en']}`;
    speakMessage(fullText);
  };

  const handleReadQuestionAloud = () => {
    const qText = `${quiz.question[language] || quiz.question['en']}`;
    speakMessage(qText);
  };

  return (
    <div className="pb-32 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>{t('goBack')}</span>
        </button>
        <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
          <GraduationCap size={15} />
          <span>{lesson.subjectTitle[language] || 'Education'}</span>
        </div>
      </div>

      {/* Language Switcher Bar - Read in ALL Languages */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Volume2 size={13} className="text-amber-600" />
            Read in Any Language
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
            7 Languages Available
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {SUPPORTED_LANGUAGES.map((langItem) => {
            const isSelected = langItem.code === language;
            return (
              <button
                key={langItem.code}
                onClick={() => handleSelectLanguage(langItem.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-200 ring-2 ring-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                <span>{langItem.nativeName}</span>
                <span className="text-[10px] opacity-75">({langItem.code.toUpperCase()})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Subject Lesson Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Lesson Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md">
              1 Subject: {lesson.subjectTitle[language] || lesson.subjectTitle['en']}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1 leading-snug">
              {lesson.title[language] || lesson.title['en']}
            </h2>
          </div>
          <button
            onClick={handleReadLessonAloud}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Read Lesson Aloud"
          >
            <Volume2 size={16} className={voiceState === 'speaking' ? 'animate-bounce' : ''} />
            <span>Read Lesson</span>
          </button>
        </div>

        {/* Simpler Mode Pill */}
        <div className="flex items-center justify-between bg-amber-50/80 rounded-2xl p-2.5 border border-amber-200/60">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-900">
              {isSimplerMode ? 'Simple Analogy Mode' : 'Standard Explanation'}
            </span>
          </div>
          <button
            onClick={handleToggleSimplerMode}
            type="button"
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
              isSimplerMode
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            {isSimplerMode ? 'Show Full Detail' : t('explainSimpler')}
          </button>
        </div>

        {/* Explanation Text */}
        <div className="text-sm sm:text-base text-slate-800 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100 font-normal">
          {currentExplanation}
        </div>

        {/* Real-life market example */}
        <div className="bg-orange-50/70 rounded-2xl p-3 border border-orange-100 text-xs sm:text-sm text-orange-950 space-y-1">
          <div className="font-bold text-orange-900 flex items-center gap-1.5">
            <span>🛒</span>
            <span>Real Life Market Example:</span>
          </div>
          <p className="leading-relaxed">
            {lesson.realLifeExample[language] || lesson.realLifeExample['en']}
          </p>
        </div>
      </div>

      {/* Exactly ONE Question & ONE Answer Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">Single Practice Question</span>
              <span className="text-[10px] text-slate-500">Test your understanding</span>
            </div>
          </div>
          <button
            onClick={handleReadQuestionAloud}
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-full transition-all"
          >
            <Volume2 size={14} />
            <span>Read Question</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="text-sm sm:text-base font-bold text-slate-900 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/80 leading-relaxed">
          {quiz.question[language] || quiz.question['en']}
        </div>

        {/* 4 Clickable Options */}
        <div className="grid grid-cols-2 gap-2.5">
          {quiz.options[language].map((optionText: string, idx: number) => {
            const isSelected = selectedQuizAnswer === idx;
            const isCorrect = idx === quiz.correctAnswerIndex;

            let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-amber-50/60 hover:border-amber-300 text-slate-800';
            if (showQuizResult) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-300 font-extrabold';
              } else if (isSelected) {
                btnStyle = 'bg-red-50 border-red-300 text-red-900 line-through';
              } else {
                btnStyle = 'opacity-50 bg-slate-50 border-slate-200 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleQuizAnswer(idx)}
                type="button"
                className={`p-3.5 rounded-2xl border text-center font-bold text-base transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 ${btnStyle}`}
              >
                <span>{optionText}</span>
                {showQuizResult && isCorrect && <CheckCircle2 size={18} className="text-emerald-600" />}
                {showQuizResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-600" />}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation & Feedback */}
        {showQuizResult && (
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in space-y-2 ${
            selectedQuizAnswer === quiz.correctAnswerIndex
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                {selectedQuizAnswer === quiz.correctAnswerIndex ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Correct Answer! (₹50)</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-600" />
                    <span>Correct Answer is ₹50:</span>
                  </>
                )}
              </span>
              <button
                onClick={() => {
                  setSelectedQuizAnswer(null);
                  setShowQuizResult(false);
                }}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
              >
                <RotateCcw size={12} /> Try Again
              </button>
            </div>
            <p className="leading-relaxed">
              {quiz.explanation[language] || quiz.explanation['en']}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
