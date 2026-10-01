import React from 'react';
import { 
  GraduationCap, 
  Landmark, 
  Scale, 
  AlertCircle, 
  Mic, 
  Square,
  FileText, 
  HelpCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { ScreenType } from '../types';

export const HomeScreen: React.FC = () => {
  const { 
    navigateTo, 
    startVoiceListening, 
    stopVoiceListening,
    stopSpeech,
    voiceState, 
    t, 
    language,
    speakMessage,
  } = useApp();

  const isListening = voiceState === 'listening';
  const isSpeaking = voiceState === 'speaking';

  const sections: {
    id: ScreenType;
    icon: any;
    titleKey: string;
    englishTitle: string;
    description: Record<string, string>;
    bgGradient: string;
    iconBg: string;
    iconColor: string;
    spokenIntro: Record<string, string>;
  }[] = [
    {
      id: 'education',
      icon: GraduationCap,
      titleKey: 'navEducation',
      englishTitle: 'Education & Learning',
      description: {
        ta: 'கணிதம், அறிவியல், மற்றும் டிஜிட்டல் வங்கி பாதுகாப்பு எளிய முறையில் கற்கலாம்.',
        te: 'గణితం, సైన్స్ మరియు డిజిటల్ బ్యాంకింగ్ భద్రతను సులభంగా నేర్చుకోండి.',
        hi: 'गणित, विज्ञान और डिजिटल फोनपे सुरक्षा आसान भाषा में सीखें।',
        ml: 'ഗണിതവും ഡിജിറ്റൽ സുരക്ഷയും ലളിതമായി പഠിക്കാം.',
        kn: 'ಗಣಿತ ಹಾಗೂ ಡಿಜಿಟಲ್ ಬ್ಯಾಂಕಿಂಗ್ ಭದ್ರತೆಯನ್ನು ಕಲಿಯಿರಿ.',
        bn: 'অঙ্ক, বিজ্ঞান ও ডিজিটাল ব্যাঙ্কিং নিরাপত্তা সহজে শিখুন।',
        en: 'Learn everyday math, health, and mobile banking safety with voice lessons.',
      },
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-white',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      spokenIntro: {
        ta: 'கல்விப் பிரிவு. இங்கு நீங்கள் அன்றாட கணிதம் மற்றும் மொபைல் வங்கி பாதுகாப்பை கற்றுக்கொள்ளலாம்.',
        te: 'విద్య విభాగం. ఇక్కడ మీరు గణితం మరియు మొబైల్ భద్రతను నేర్చుకోవచ్చు.',
        hi: 'शिक्षा अनुभाग। यहाँ आप गणित और फोनपे सुरक्षा सीख सकती हैं।',
        ml: 'വിദ്യാഭ്യാസ വിഭാഗം.',
        kn: 'ಶಿಕ್ಷಣ ವಿಭಾಗ.',
        bn: 'শিক্ষা বিভাগ।',
        en: 'Education section. Learn everyday mathematics and mobile safety.',
      },
    },
    {
      id: 'schemes',
      icon: Landmark,
      titleKey: 'navSchemes',
      englishTitle: 'Government Schemes',
      description: {
        ta: 'மகப்பேறு உதவி, பெண் குழந்தைகள் சேமிப்பு மற்றும் அரசு மானியங்களை அறியவும்.',
        te: 'గర్భిణుల సహాయం, ఆడపిల్లల భవిష్యత్ నిధి మరియు ప్రభుత్వ రాయితీలు.',
        hi: 'मातृत्व सहायता, बेटी बचत योजना और सरकारी सब्सिडी की जानकारी।',
        ml: 'സ്ത്രീകൾക്കായുള്ള വിവിധ സർക്കാർ പദ്ധതികൾ.',
        kn: 'ಮಹಿಳೆಯರಿಗಾಗಿ ಸರ್ಕಾರದ ವಿವಿಧ ಸೌಲಭ್ಯಗಳು ಮತ್ತು ಯೋಜನೆಗಳು.',
        bn: 'মহিলাদের জন্য সরকারি প্রকল্প ও আর্থিক অনুদান।',
        en: 'Discover verified central and state schemes for maternity, savings & business loans.',
      },
      bgGradient: 'from-rose-500/10 via-rose-500/5 to-white',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      spokenIntro: {
        ta: 'அரசு திட்டங்கள் பிரிவு. பெண்களுக்கான நிதியுதவி, மகப்பேறு உதவி மற்றும் தொழில் கடன்களை கண்டறியலாம்.',
        te: 'ప్రభుత్వ పథకాల విభాగం. మహిళల కోసం ఉన్న పథకాలు తెలుసుకోండి.',
        hi: 'सरकारी योजनाएं अनुभाग। यहाँ महिलाओं के लिए उपलब्ध योजनाओं की जानकारी पाएं।',
        ml: 'സർക്കാർ പദ്ധതികൾ പരിശോധിക്കാം.',
        kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ.',
        bn: 'সরকারি প্রকল্প সংক্রান্ত তথ্য।',
        en: 'Government Schemes. Find financial assistance and welfare benefits.',
      },
    },
    {
      id: 'rights',
      icon: Scale,
      titleKey: 'navRights',
      englishTitle: 'Know Your Rights',
      description: {
        ta: 'குடும்ப வன்முறை, பணியிட பாதுகாப்பு மற்றும் இலவச வழக்கறிஞர் சட்ட உரிமைகள்.',
        te: 'గృహ హింస రక్షణ, పని ప్రదేశంలో భద్రత మరియు ఉచిత లాయర్ హక్కులు.',
        hi: 'घरेलू हिंसा से बचाव, कार्यस्थल पर सुरक्षा और मुफ्त सरकारी वकील पाने के अधिकार।',
        ml: 'നിയമപരമായ അവകാശങ്ങളും സംരക്ഷണവും.',
        kn: 'ಕೌಟುಂಬಿಕ ಹಿಂಸೆ ವಿರುದ್ಧ ರಕ್ಷಣೆ ಮತ್ತು ಕಾನೂನು ನೆರವು.',
        bn: 'নারীর আইনি অধিকার ও বিনামূল্যে সরকারি উকিল সহায়তা।',
        en: 'Understand your legal protections under Indian law with zero legal jargon.',
      },
      bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-white',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-700',
      spokenIntro: {
        ta: 'சட்ட உரிமைகள் பிரிவு. உங்கள் பிரச்சனையை கூறி இலவச சட்ட பாதுகாப்பு மற்றும் ஜீரோ எஃப்.ஐ.ஆர் உரிமையை அறியலாம்.',
        te: 'చట్టపరమైన హక్కులు. మీ సమస్యకు చట్టపరమైన పరిష్కారం తెలుసుకోండి.',
        hi: 'कानूनी अधिकार अनुभाग। यहाँ जानिए अपने अधिकार और मुफ्त कानूनी सहायता।',
        ml: 'നിയമ സഹായം നേടാം.',
        kn: 'ಕಾನೂನು ರಕ್ಷಣೆ ತಿಳಿಯಿರಿ.',
        bn: 'আইনি অধিকার ও সুরক্ষা জানুন।',
        en: 'Know Your Rights. Learn about free legal aid and protection laws.',
      },
    },
    {
      id: 'emergency',
      icon: AlertCircle,
      titleKey: 'navEmergency',
      englishTitle: 'Emergency & Safety',
      description: {
        ta: '112, 181 உடனடி அழைப்பு, அருகிலுள்ள காவல் நிலையம் மற்றும் நேரலை ஜிபிஎஸ் பகிர்வு.',
        te: '112, 181 తక్షణ కాల్, సమీప పోలీస్ స్టేషన్ మరియు లైవ్ లొకేషన్ షేరింగ్.',
        hi: '112, 181 पर तुरंत कॉल, नजदीकी पुलिस थाना और आपातकालीन जीपीएस अलर्ट।',
        ml: 'അടിയന്തര പോലീസ് സഹായവും ഹെൽപ്പ്‌ലൈനുകളും.',
        kn: 'ತುರ್ತು 112, 181 ಕರೆ ಮತ್ತು ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆ.',
        bn: 'জরুরি ১১২, ১৮১ কল ও কাছের থানার সন্ধান।',
        en: 'Instant 1-tap call to 112 & 181, find nearest police station, and share live GPS.',
      },
      bgGradient: 'from-red-500/10 via-red-500/5 to-white',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-700',
      spokenIntro: {
        ta: 'அவசர உதவி பிரிவு. ஆபத்து காலத்தில் 112 மற்றும் 181-ஐ அழைக்கவும் காவல் நிலையத்தை கண்டுபிடிக்கவும் பயன்படும்.',
        te: 'అత్యవసర విభాగం. తక్షణ పోలీసు సహాయం కోసం.',
        hi: 'आपातकालीन सहायता अनुभाग। 112 या 181 पर तत्काल संपर्क करें।',
        ml: 'അടിയന്തര സഹായം.',
        kn: 'ತುರ್ತು ರಕ್ಷಣೆ.',
        bn: 'জরুরি সাহায্য ও পুলিশ সহায়তা।',
        en: 'Emergency and safety section for immediate help and nearest police stations.',
      },
    },
  ];

  return (
    <div className="pb-28 px-3 sm:px-4 pt-3 max-w-lg mx-auto space-y-4">
      {/* Hero Voice Prompt Box */}
      <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 rounded-3xl p-5 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
        {/* Decorative backdrop elements */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles size={14} className="text-amber-300" />
            <span>Voice-Controlled Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
            {t('askSakhi')}
          </h2>

          <p className="text-rose-100 text-xs sm:text-sm max-w-xs mb-5 font-medium">
            You don't need to read or type. Press the big button and just speak.
          </p>

          {/* Central Hero Button */}
          <div className="relative mb-2">
            {isListening && (
              <span className="absolute inset-0 -m-3 rounded-full bg-white/30 animate-ping" />
            )}
            <button
              onClick={() => {
                if (isListening) {
                  stopVoiceListening();
                } else if (isSpeaking) {
                  stopSpeech();
                } else {
                  startVoiceListening();
                }
              }}
              type="button"
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-transform active:scale-90 ${
                isListening
                  ? 'bg-amber-400 text-rose-950 ring-4 ring-amber-200 animate-pulse'
                  : isSpeaking
                  ? 'bg-amber-500 text-white ring-4 ring-amber-200'
                  : 'bg-white text-rose-600 hover:scale-105 shadow-rose-900/30'
              }`}
              aria-label="Tap to speak"
            >
              {isListening || isSpeaking ? (
                <Square size={28} className="fill-current" />
              ) : (
                <Mic size={34} className="animate-pulse" />
              )}
            </button>
          </div>

          <span className="text-[11px] font-bold tracking-wider uppercase text-rose-200">
            {isListening ? (language === 'ta' ? 'கேட்கிறேன்... அழுத்தவும்' : 'Listening... tap stop') : isSpeaking ? 'Speaking...' : t('tapToSpeak')}
          </span>
        </div>
      </div>

      {/* Spoken Prompts Guide Carousel */}
      <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle size={12} className="text-rose-600" />
            {t('samplePrompts')}
          </span>
          <SpeakButton 
            textToSpeak={`${t('samplePrompts')}: ${t('prompt1')}, ${t('prompt2')}, ${t('prompt3')}`} 
            size="sm" 
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button 
            onClick={() => navigateTo('schemes')}
            className="p-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 text-rose-900 font-semibold text-left transition-colors truncate"
          >
            {t('prompt1')}
          </button>
          <button 
            onClick={() => navigateTo('education')}
            className="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 font-semibold text-left transition-colors truncate"
          >
            {t('prompt2')}
          </button>
          <button 
            onClick={() => navigateTo('emergency')}
            className="p-2 rounded-xl bg-red-50/70 hover:bg-red-100/70 text-red-900 font-semibold text-left transition-colors truncate"
          >
            {t('prompt3')}
          </button>
          <button 
            onClick={() => navigateTo('emergency')}
            className="p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 font-semibold text-left transition-colors truncate"
          >
            {t('prompt4')}
          </button>
        </div>
      </div>

      {/* 4 Major Core Touch & Voice Cards */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const desc = sec.description[language] || sec.description['en'];
          const spokenText = sec.spokenIntro[language] || sec.spokenIntro['en'];

          return (
            <div
              key={sec.id}
              onClick={() => navigateTo(sec.id)}
              className={`bg-gradient-to-r ${sec.bgGradient} rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-3 rounded-2xl ${sec.iconBg} ${sec.iconColor} shrink-0 shadow-sm`}>
                    <Icon size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {t(sec.titleKey)}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mb-1">
                      {sec.englishTitle}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <SpeakButton textToSpeak={spokenText} size="sm" />
                  <div className="p-1 rounded-full text-slate-400 bg-white/80 border border-slate-100">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice-Guided Complaint Quick Card */}
      <div 
        onClick={() => navigateTo('complaint')}
        className="bg-gradient-to-r from-purple-50 via-pink-50 to-white rounded-3xl p-4 border border-purple-200/80 shadow-sm cursor-pointer flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
            <FileText size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">
              {t('fileComplaint')}
            </h4>
            <p className="text-xs text-slate-600">
              AI-conducted voice interview & structured FIR drafting
            </p>
          </div>
        </div>
        <SpeakButton 
          textToSpeak="புகார் அளிக்க விரும்பினால் இங்கே அழுத்தவும். சகி குரல் மூலம் கேள்விகள் கேட்டு புகாரை தயாரிக்கும்." 
          size="sm" 
        />
      </div>
    </div>
  );
};
