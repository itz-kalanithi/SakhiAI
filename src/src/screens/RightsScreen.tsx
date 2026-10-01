import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  ArrowLeft, 
  AlertCircle, 
  Phone, 
  ShieldAlert, 
  ExternalLink, 
  HelpCircle,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  FileText,
  Mic,
  Square,
  Volume2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { VERIFIED_RIGHTS } from '../data/rights';
import { LegalRight, LanguageCode } from '../types';
import { voiceService, VoiceErrorCode } from '../services/voiceService';

export const RightsScreen: React.FC = () => {
  const { 
    language, 
    goBack, 
    navigateTo, 
    speakMessage, 
    t 
  } = useApp();

  const [activeRightDetail, setActiveRightDetail] = useState<LegalRight | null>(null);
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [isListeningInput, setIsListeningInput] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speechLanguage, setSpeechLanguage] = useState<LanguageCode>(language === 'en' ? 'en' : 'ta');

  const [aiLegalGuidance, setAiLegalGuidance] = useState<{
    act: string;
    rightName: string;
    advice: string;
    steps: string[];
    authority: string;
    helpline: string;
    spokenText: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Sync speech language when global app language changes
  useEffect(() => {
    setSpeechLanguage(language === 'en' ? 'en' : 'ta');
  }, [language]);

  // Hook up audio level visualizer
  useEffect(() => {
    if (isListeningInput) {
      voiceService.setAudioLevelCallback((level) => {
        setAudioLevel(level);
      });
    } else {
      voiceService.setAudioLevelCallback(null);
      setAudioLevel(0);
    }
    return () => {
      voiceService.setAudioLevelCallback(null);
    };
  }, [isListeningInput]);

  // Localized Screen Content Dictionary
  const SCREEN_STRINGS: Record<LanguageCode, {
    badge: string;
    title: string;
    subtitle: string;
    voiceIntro: string;
    inputPlaceholder: string;
    listeningHint: string;
    analyzeBtn: string;
    analyzingBtn: string;
    orCommonTitle: string;
    scenarios: { title: string; query: string }[];
    coreRightsTitle: string;
    viewStepsBtn: string;
    showLessBtn: string;
    exerciseTitle: string;
    helplineLabel: string;
    sourceLabel: string;
    draftComplaintBtn: string;
    callNowBtn: string;
    identifiedLawBadge: string;
    recommendedStepsTitle: string;
  }> = {
    ta: {
      badge: 'சட்ட விழிப்புணர்வு & பாதுகாப்பு',
      title: 'குரல் வழி சட்ட உதவி',
      subtitle: 'உங்கள் பிரச்சனையை குரல் மூலம் சொல்லுங்கள். இந்திய சட்டப்படி உங்களுக்குரிய உரிமைகளை சகி விளக்கும்.',
      voiceIntro: 'வணக்கம். உங்கள் பிரச்சனையை குரல் மூலம் சொல்லுங்கள். குடும்ப வன்முறை, பணியிட தொல்லை, அல்லது சம்பள மறுப்பு போன்ற எந்த பிரச்சனையாக இருந்தாலும் உங்களுக்குரிய சட்ட உரிமைகளை சகி விளக்கும்.',
      inputPlaceholder: 'என்ன நடந்தது என்று பேசுங்கள்... (உதாரணம்: வீட்டில் வன்முறை, சம்பளம் தர மறுப்பு)',
      listeningHint: 'கேட்கிறேன்... பேசுங்கள். பேசி முடித்ததும் சிவப்பு பொத்தானை மீண்டும் அழுத்தவும்.',
      analyzeBtn: 'சட்ட விளக்கம் பெற',
      analyzingBtn: 'சட்ட உரிமைகளை ஆராய்கிறது...',
      orCommonTitle: 'அல்லது அடிக்கடி கேட்கப்படும் பிரச்சனைகள்:',
      scenarios: [
        {
          title: '“வீட்டில் வன்முறை / கணவர், மாமியார் மிரட்டல்”',
          query: 'வீட்டில் கணவர் மற்றும் குடும்பத்தினர் வன்முறை செய்கிறார்கள் மிரட்டுகிறார்கள்',
        },
        {
          title: '“வேலை செய்யும் இடத்தில் சம்பளம் தரவில்லை / தொல்லை”',
          query: 'வேலை செய்யும் இடத்தில் முதலாளி சம்பளம் தர மறுக்கிறார் பாலியல் தொல்லை',
        },
        {
          title: '“காவல் நிலையத்தில் புகார் வாங்க மறுக்கிறார்கள்”',
          query: 'காவல் நிலையத்தில் எல்லை இல்லை என்று கூறி புகார் பதிவு செய்ய மறுக்கிறார்கள்',
        },
        {
          title: '“வழக்கு நடத்த என்னிடம் வழக்கறிஞருக்கு பணம் இல்லை”',
          query: 'நீதிமன்ற வழக்கு நடத்த என்னிடம் பணம் இல்லை இலவச வழக்கறிஞர் வேண்டும்',
        },
      ],
      coreRightsTitle: 'பெண்கள் ஒவ்வொருவரும் அறிய வேண்டிய முக்கிய சட்ட உரிமைகள்',
      viewStepsBtn: 'நடவடிக்கை வழிகள் & முழு விவரம்',
      showLessBtn: 'குறைவாக காட்டு',
      exerciseTitle: 'இந்த உரிமையை எவ்வாறு பெறுவது:',
      helplineLabel: 'அவசர உதவி எண்:',
      sourceLabel: 'அரசு சட்டம்:',
      draftComplaintBtn: 'முறைப்படியான புகார் கடிதம் தயாரிக்க',
      callNowBtn: 'உடனடியாக அழைக்கவும்',
      identifiedLawBadge: 'பொருந்தக்கூடிய சட்டம் கண்டறியப்பட்டது',
      recommendedStepsTitle: 'பரிந்துரைக்கப்படும் அடுத்த கட்ட நடவடிக்கைகள்:',
    },
    hi: {
      badge: 'कानूनी साक्षरता एवं सुरक्षा',
      title: 'आवाज से कानूनी सहायता',
      subtitle: 'अपनी समस्या बोलकर बताएं। भारतीय कानून के अनुसार आपके अधिकारों की पूरी जानकारी सखी देगी।',
      voiceIntro: 'नमस्ते। अपनी समस्या बताइए। घरेलू हिंसा, कार्यस्थल पर शोषण या दहेज प्रताड़ना जैसे मामलों में सखी आपको कानूनी उपाय बताएगी।',
      inputPlaceholder: 'बताइए क्या हुआ... (उदा: घरेलू हिंसा, वेतन न मिलना, धमकी)',
      listeningHint: 'सुन रही हूँ... अपनी बात कहें। बोलने के बाद बटन दोबारा दबाएं।',
      analyzeBtn: 'कानूनी समाधान जानें',
      analyzingBtn: 'कानून का विश्लेषण जारी है...',
      orCommonTitle: 'या आम समस्याओं पर टैप करें:',
      scenarios: [
        {
          title: '“घरेलू हिंसा / ससुराल में मारपीट या धमकी”',
          query: 'घर में मारपीट और जान से मारने की धमकी मिल रही है',
        },
        {
          title: '“काम की जगह वेतन नहीं दे रहे / प्रताड़ना”',
          query: 'मालिक मजदूरी या वेतन नहीं दे रहा और परेशान कर रहा है',
        },
        {
          title: '“थाने में पुलिस रिपोर्ट दर्ज नहीं कर रही”',
          query: 'पुलिस सीमा विवाद का बहाना बनाकर एफआईआर दर्ज नहीं कर रही',
        },
        {
          title: '“मुकदमा लड़ने के लिए वकील की फीस नहीं है”',
          query: 'कोर्ट में केस के लिए वकील करने के पैसे नहीं हैं, मुफ्त सरकारी वकील चाहिए',
        },
      ],
      coreRightsTitle: 'प्रत्येक महिला के लिए आवश्यक प्रमुख कानूनी अधिकार',
      viewStepsBtn: 'पूरी कानूनी प्रक्रिया एवं अधिकार',
      showLessBtn: 'कम दिखाएं',
      exerciseTitle: 'इस अधिकार का उपयोग कैसे करें:',
      helplineLabel: 'हेल्पलाइन नंबर:',
      sourceLabel: 'अधिनियम / कानून:',
      draftComplaintBtn: 'औपचारिक शिकायत पत्र तैयार करें',
      callNowBtn: 'तुरंत कॉल करें',
      identifiedLawBadge: 'प्रासंगिक कानून की पहचान',
      recommendedStepsTitle: 'उठाए जाने वाले जरूरी कदम:',
    },
    te: {
      badge: 'చట్టపరమైన అవగాహన & రక్షణ',
      title: 'వాయిస్ లీగల్ అసిస్టెంట్',
      subtitle: 'మీ సమస్యను వాయిస్ ద్వారా చెప్పండి. భారతీయ చట్టాల ప్రకారం మీ హక్కులను సఖి వివరిస్తుంది.',
      voiceIntro: 'నమస్కారం. మీ సమస్యను చెప్పండి. గృహ హింస, పని ప్రదేశంలో వేధింపులు వంటి సమస్యలకు చట్టపరమైన పరిష్కారాన్ని సఖి వివరిస్తుంది.',
      inputPlaceholder: 'ఏం జరిగిందో మాట్లాడండి... (ఉదా: గృహ హింస, జీతం ఇవ్వకపోవడం)',
      listeningHint: 'వింటున్నాను... పూర్తిగా మాట్లాడండి. పూర్తయ్యాక బటన్ మళ్ళీ నొక్కండి.',
      analyzeBtn: 'చట్టపరమైన పరిష్కారం చూడండి',
      analyzingBtn: 'విశ్లేషిస్తోంది...',
      orCommonTitle: 'లేదా తరచుగా ఎదురయ్యే సమస్యలు:',
      scenarios: [
        {
          title: '“గృహ హింస / ఇంట్లో వేధింపులు”',
          query: 'ఇంట్లో హింస మరియు బెదిరింపులు ఎదురవుతున్నాయి',
        },
        {
          title: '“పని ప్రదేశంలో జీతం ఇవ్వడం లేదు / వేధింపులు”',
          query: 'యజమాని జీతం ఇవ్వడం లేదు మరియు పనిలో వేధిస్తున్నారు',
        },
        {
          title: '“పోలీసులు ఫిర్యాదు తీసుకోవడం లేదు”',
          query: 'పోలీసులు పరిధి కాదని కేసు నమోదు చేయడానికి నిరాకరిస్తున్నారు',
        },
        {
          title: '“కోర్టు కేసు కోసం ఉచిత లాయర్ కావాలి”',
          query: 'కోర్టు కేసు వాదించడానికి డబ్బులు లేవు ఉచిత లాయర్ కావాలి',
        },
      ],
      coreRightsTitle: 'మహిళలందరూ తప్పక తెలుసుకోవలసిన చట్టపరమైన హక్కులు',
      viewStepsBtn: 'పూర్తి వివరాలు & మార్గదర్శకాలు',
      showLessBtn: 'తక్కువ చూపించు',
      exerciseTitle: 'ఈ హక్కును ఎలా పొందాలి:',
      helplineLabel: 'హెల్ప్‌లైన్:',
      sourceLabel: 'ప్రభుత్వ చట్టం:',
      draftComplaintBtn: 'ఫిర్యాదు లేఖను తయారు చేయండి',
      callNowBtn: 'వెంటనే కాల్ చేయండి',
      identifiedLawBadge: 'సంబంధిత చట్టం గుర్తించబడింది',
      recommendedStepsTitle: 'తీసుకోవలసిన తదుపరి చర్యలు:',
    },
    en: {
      badge: 'LEGAL LITERACY & PROTECTION',
      title: 'Voice-First Legal Rights Assistant',
      subtitle: 'Describe your situation by voice. Sakhi identifies relevant Indian laws and remedies.',
      voiceIntro: 'Hello. Explain your situation by voice. Sakhi will identify relevant protections under Indian law.',
      inputPlaceholder: 'Describe what happened or speak into the microphone...',
      listeningHint: 'Listening... speak freely. Tap the red button when finished.',
      analyzeBtn: 'Analyze My Situation',
      analyzingBtn: 'Analyzing Protections...',
      orCommonTitle: 'OR TAP COMMON SITUATIONS:',
      scenarios: [
        {
          title: '“Someone is threatening me / violence at home”',
          query: 'Someone is threatening me and causing violence at home',
        },
        {
          title: '“Employer not paying wages / workplace harassment”',
          query: 'My employer is refusing to pay wages or harassing me at work',
        },
        {
          title: '“Police refused to register my complaint”',
          query: 'The local police refused to file my complaint saying it is outside their area',
        },
        {
          title: '“I cannot afford a lawyer for court”',
          query: 'I need to go to court but I cannot afford a private lawyer',
        },
      ],
      coreRightsTitle: 'Core Rights Every Woman Must Know',
      viewStepsBtn: 'View Action Steps & Authorities',
      showLessBtn: 'Show Less',
      exerciseTitle: 'How to exercise this right:',
      helplineLabel: 'Official Helpline:',
      sourceLabel: 'Statutory Source:',
      draftComplaintBtn: 'Draft Official Complaint',
      callNowBtn: 'Call Helpline',
      identifiedLawBadge: 'Relevant Law Identified',
      recommendedStepsTitle: 'Recommended Next Steps:',
    },
    ml: {
      badge: 'നിയമ സംരക്ഷണം',
      title: 'നിയമ സഹായ സഹായി',
      subtitle: 'നിങ്ങളുടെ പ്രശ്നം പറയൂ.',
      voiceIntro: 'നമസ്കാരം. നിങ്ങളുടെ പ്രശ്നം പറയൂ.',
      inputPlaceholder: 'സംഭവിച്ചത് എന്തെന്ന് പറയൂ...',
      listeningHint: 'കേൾക്കുന്നു...',
      analyzeBtn: 'പരിഹാരം കാണുക',
      analyzingBtn: 'പരിശോധിക്കുന്നു...',
      orCommonTitle: 'പ്രധാന പ്രശ്നങ്ങൾ:',
      scenarios: [],
      coreRightsTitle: 'അവകാശങ്ങൾ',
      viewStepsBtn: 'വിശദാംശങ്ങൾ',
      showLessBtn: 'കുറയ്ക്കുക',
      exerciseTitle: 'ചെയ്യേണ്ടത്:',
      helplineLabel: 'ഹെൽപ്പ്‌ലൈൻ:',
      sourceLabel: 'നിയമം:',
      draftComplaintBtn: 'പരാതി തയ്യാറാക്കുക',
      callNowBtn: 'വിളിക്കുക',
      identifiedLawBadge: 'നിയമം',
      recommendedStepsTitle: 'അടുത്ത ഘട്ടങ്ങൾ:',
    },
    kn: {
      badge: 'ಕಾನೂನು ರಕ್ಷಣೆ',
      title: 'ಕಾನೂನು ಸಹಾಯಕ',
      subtitle: 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ.',
      voiceIntro: 'ನಮಸ್ಕಾರ. ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ತಿಳಿಸಿ.',
      inputPlaceholder: 'ಏನಾಯಿತು ಎಂಬುದನ್ನು ಮಾತನಾಡಿ...',
      listeningHint: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ...',
      analyzeBtn: 'ಪರಿಹಾರ ನೋಡಿ',
      analyzingBtn: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
      orCommonTitle: 'ಸಮಸ್ಯೆಗಳು:',
      scenarios: [],
      coreRightsTitle: 'ಹಕ್ಕುಗಳು',
      viewStepsBtn: 'ವಿವರಗಳು',
      showLessBtn: 'ಕಡಿಮೆ ತೋರಿಸಿ',
      exerciseTitle: 'ಕ್ರಮ:',
      helplineLabel: 'ಸಹಾಯವಾಣಿ:',
      sourceLabel: 'ಕಾನೂನು:',
      draftComplaintBtn: 'ದೂರು ತಯಾರಿಸಿ',
      callNowBtn: 'ಕರೆ ಮಾಡಿ',
      identifiedLawBadge: 'ಕಾನೂನು',
      recommendedStepsTitle: 'ಕ್ರಮಗಳು:',
    },
    bn: {
      badge: 'আইনি সুরক্ষা',
      title: 'আইনি সহকারী',
      subtitle: 'আপনার সমস্যার কথা বলুন।',
      voiceIntro: 'নমস্কার। আপনার সমস্যার কথা বলুন।',
      inputPlaceholder: 'কী ঘটেছে বলুন...',
      listeningHint: 'শুনছি...',
      analyzeBtn: 'সমাধান দেখুন',
      analyzingBtn: 'বিশ্লেষণ করা হচ্ছে...',
      orCommonTitle: 'সমস্যা:',
      scenarios: [],
      coreRightsTitle: 'অধিকার',
      viewStepsBtn: 'বিবরণ',
      showLessBtn: 'সংক্ষেপ করুন',
      exerciseTitle: 'করণীয়:',
      helplineLabel: 'হেল্পলাইন:',
      sourceLabel: 'আইন:',
      draftComplaintBtn: 'অভিযোগ প্রস্তুত করুন',
      callNowBtn: 'ফোন করুন',
      identifiedLawBadge: 'আইন',
      recommendedStepsTitle: 'পদক্ষেপ:',
    }
  };

  const str = SCREEN_STRINGS[language] || SCREEN_STRINGS['ta'] || SCREEN_STRINGS['en'];

  // Toggle continuous voice recording on the card
  const handleToggleCardVoice = async () => {
    setVoiceError(null);

    if (isListeningInput) {
      // User tapped stop! Finalize recording
      const finalText = voiceService.stopListening();
      setIsListeningInput(false);
      const textToAnalyze = finalText || problemDescription;
      if (textToAnalyze.trim()) {
        setProblemDescription(textToAnalyze.trim());
        handleAnalyzeSituation(textToAnalyze.trim());
      }
    } else {
      // User tapped start! Record continuously
      setIsListeningInput(true);
      setProblemDescription('');

      try {
        await voiceService.startListening(
          speechLanguage,
          (currentTranscript) => {
            setProblemDescription(currentTranscript);
          },
          (errCode: VoiceErrorCode, userMessage: string) => {
            console.warn('Voice recording error:', errCode, userMessage);
            setIsListeningInput(false);

            if (errCode === 'not-allowed') {
              setVoiceError(
                language === 'ta'
                  ? 'மைக்ரோஃபோன் அனுமதி தடுக்கப்பட்டுள்ளது. பிரவுசர் முகவரிப் பட்டியில் (URL bar) கேமரா/மைக் ஐகானை கிளிக் செய்து "Allow" செய்யவும்.'
                  : 'Microphone permission blocked. Please allow microphone access in your browser address bar.'
              );
            } else if (errCode === 'network') {
              setVoiceError(
                language === 'ta'
                  ? 'பிரவுசர் வாய்ஸ் நெட்வொர்க் பிழை. கீழே உள்ள "English" பொத்தானை மாற்றி முயற்சிக்கவும் அல்லது மாதிரி உதாரணத்தை அழுத்தவும்.'
                  : 'Speech recognition network issue. Try switching voice language to English or tap a sample below.'
              );
            } else {
              setVoiceError(userMessage);
            }
          },
          (finalResult) => {
            setIsListeningInput(false);
            if (finalResult && finalResult.trim()) {
              setProblemDescription(finalResult.trim());
              handleAnalyzeSituation(finalResult.trim());
            }
          }
        );
      } catch (e: any) {
        setIsListeningInput(false);
        setVoiceError(e.message || 'Microphone error');
      }
    }
  };

  // Analyze problem and generate guidance in selected regional language
  const handleAnalyzeSituation = (textToAnalyze?: string) => {
    const query = (textToAnalyze || problemDescription).trim();
    if (!query) return;

    setIsAnalyzing(true);
    setAiLegalGuidance(null);

    const queryLower = query.toLowerCase();

    setTimeout(() => {
      setIsAnalyzing(false);
      let matched: typeof aiLegalGuidance;

      if (
        queryLower.includes('police') || 
        queryLower.includes('refuse') || 
        queryLower.includes('jurisdiction') || 
        queryLower.includes('மறுக்க') || 
        queryLower.includes('காவல்') ||
        queryLower.includes('थाना') ||
        queryLower.includes('போலீஸ்')
      ) {
        if (language === 'ta') {
          matched = {
            act: 'ஜீரோ எஃப்.ஐ.ஆர் உரிமை (Right to Zero FIR - BNSS/CrPC)',
            rightName: 'ஜீரோ எஃப்.ஐ.ஆர் பாதுகாப்பு',
            advice: 'குற்றம் எங்கு நடந்திருந்தாலும் எந்த காவல் நிலையத்திலும் போலீசார் உடனடியாக முதல் தகவல் அறிக்கை (FIR) பதிவு செய்தே ஆக வேண்டும். "எல்லை இல்லை" என்று கூறி மறுப்பது சட்டவிரோதமாகும்.',
            steps: [
              'அருகிலுள்ள காவல் நிலையத்திற்குச் சென்று "ஜீரோ எஃப்.ஐ.ஆர் பதிவு செய்ய வேண்டும்" என்று கூறவும்.',
              'பதிவு செய்யப்பட்ட FIR-ன் இலவச நகலை உடனே பெற்றுக்கொள்வது உங்கள் சட்ட உரிமை.',
              'போலீசார் மறுத்தால் உடனே 112 அல்லது மாவட்ட காவல் கண்காணிப்பாளரிடம் (SP) முறையிடவும்.',
            ],
            authority: 'அனைத்து மகளிர் காவல் நிலையம் (AWPS) / மாவட்ட காவல் கண்காணிப்பாளர்',
            helpline: '112',
            spokenText: 'ஜீரோ எஃப்.ஐ.ஆர் சட்டப்படி, சம்பவம் எங்கு நடந்திருந்தாலும் அருகிலுள்ள எந்த காவல் நிலையத்திலும் உங்கள் புகாரை பதிவு செய்ய வேண்டும். எல்லை இல்லை என்று மறுக்க முடியாது. உடனடி உதவிக்கு 112 அழையுங்கள்.',
          };
        } else {
          matched = {
            act: 'Right to Zero FIR (Police Mandate / Supreme Court Guidelines)',
            rightName: 'Zero FIR Rights',
            advice: 'Any police station in India is legally obligated to register your FIR immediately. They cannot reject your case citing jurisdiction boundaries.',
            steps: [
              'Visit the nearest station and demand a Zero FIR.',
              'Demand a free certified copy of the registered FIR.',
              'If the officer refuses, call 112 immediately to report non-compliance.',
            ],
            authority: 'All Women Police Station (AWPS) / Superintendent of Police',
            helpline: '112',
            spokenText: 'Under the Right to Zero FIR, any police station must register your complaint regardless of where the incident occurred. Dial 112 for support.',
          };
        }
      } else if (
        queryLower.includes('work') || 
        queryLower.includes('employer') || 
        queryLower.includes('job') || 
        queryLower.includes('வேலை') || 
        queryLower.includes('சம்பளம்') ||
        queryLower.includes('முதலாளி') ||
        queryLower.includes('salary') ||
        queryLower.includes('wage')
      ) {
        if (language === 'ta') {
          matched = {
            act: 'பணியிட பாலியல் துன்புறுத்தல் & ஊதிய உரிமை சட்டம் (POSH Act 2013)',
            rightName: 'பணியிட பாதுகாப்பு & ஊதிய உரிமை',
            advice: 'வேலை செய்யும் இடத்தில் பெண்களுக்கு பாதுகாப்பான சூழலும், செய்த வேலைக்கு உரிய ஊதியமும் பெறுவது அடிப்படை உரிமை. மிரட்டுவதோ, சம்பளம் தராமல் ஏமாற்றுவதோ தண்டனைக்குரிய குற்றமாகும்.',
            steps: [
              'நிறுவனத்தின் உள் புகார் குழுவிடம் (ICC) அல்லது மாவட்ட உள்ளூர் குழுவிடம் (LC) புகார் அளியுங்கள்.',
              'மத்திய அரசின் SHe-Box (shebox.nic.in) இணையதளத்திலும் ஆன்லைனில் நேரடியாக புகார் அளிக்கலாம்.',
              'சம்பள பாக்கிக்கு தொழிலாளர் நல அலுவலரிடம் (Labor Officer) மனு கொடுக்கலாம்.',
            ],
            authority: 'உள் புகார் குழு (ICC) & மாவட்ட தொழிலாளர் நல அலுவலர்',
            helpline: '7827170170',
            spokenText: 'பணியிட பாதுகாப்பு மற்றும் ஊதிய சட்டப்படி, உங்களுக்கு முழு பாதுகாப்பு உண்டு. சம்பளம் தராமல் ஏமாற்றுவது தவறு. தேசிய மகளிர் ஆணைய உதவி எண் 7827170170-ல் தொடர்பு கொள்ளலாம்.',
          };
        } else {
          matched = {
            act: 'Sexual Harassment at Workplace (POSH Act 2013) & Equal Remuneration',
            rightName: 'Workplace Dignity & Wage Rights',
            advice: 'Women have the absolute right to a safe work environment free from intimidation, wage denial, or harassment in both formal and informal sectors.',
            steps: [
              'Submit a complaint to the Internal Complaints Committee (ICC).',
              'Informal workers can approach the District Local Complaints Committee.',
              'File online directly on the Central SHe-Box portal (shebox.nic.in).',
            ],
            authority: 'Internal Complaints Committee & District Collector Office',
            helpline: '7827170170',
            spokenText: 'Under the POSH Act and Labor laws, you are entitled to a safe workplace and rightful wages. You can file a complaint with the Women Commission.',
          };
        }
      } else if (
        queryLower.includes('lawyer') || 
        queryLower.includes('afford') || 
        queryLower.includes('court') || 
        queryLower.includes('வழக்கறிஞர்') || 
        queryLower.includes('பணம்') ||
        queryLower.includes('free')
      ) {
        if (language === 'ta') {
          matched = {
            act: 'இலவச சட்ட உதவி சட்டம், 1987 (NALSA Section 12)',
            rightName: 'இலவச அரசு வழக்கறிஞர் உரிமை',
            advice: 'இந்திய சட்டப்படி அனைத்து பெண்களுக்கும் நீதிமன்றத்தில் வாதாட இலவச அரசு வழக்கறிஞரை பெற முழு உரிமை உள்ளது. வருமான வரம்பு கிடையாது, கட்டணம் எதுவும் தர வேண்டியதில்லை.',
            steps: [
              'தேசிய சட்ட சேவைகள் ஆணையத்தின் இலவச உதவி எண் 15100-ஐ உடனடியாக அழையுங்கள்.',
              'மாவட்ட நீதிமன்றத்தில் உள்ள சட்ட சேவைகள் ஆணையத்தை (DLSA) அணுகவும்.',
              'வழக்கறிஞர் கட்டணம், நீதிமன்ற தபால் செலவு அனைத்தும் அரசே ஏற்கும்.',
            ],
            authority: 'மாவட்ட சட்ட சேவைகள் ஆணையம் (DLSA) & NALSA',
            helpline: '15100',
            spokenText: 'சட்ட சேவைகள் ஆணையத்தின் 12-ம் பிரிவின்படி அனைத்து பெண்களுக்கும் நீதிமன்றத்தில் இலவச வழக்கறிஞர் அரசு மூலமாக வழங்கப்படுகிறது. 15100 என்ற எண்ணை அழையுங்கள்.',
          };
        } else {
          matched = {
            act: 'Legal Services Authorities Act, 1987 (Section 12)',
            rightName: 'Free Legal Aid for All Women',
            advice: 'Under Indian law, every woman is entitled to a free government-appointed lawyer regardless of her financial background or annual income.',
            steps: [
              'Call the National Legal Services toll-free helpline at 15100.',
              'Visit the District Legal Services Authority (DLSA) in your District Court.',
              'The government pays all advocate fees, paperwork, and court charges.',
            ],
            authority: 'National Legal Services Authority (NALSA) & DLSA',
            helpline: '15100',
            spokenText: 'Every woman in India is entitled to free legal aid and a government lawyer under Section 12 of the Legal Services Act. Call 15100.',
          };
        }
      } else {
        if (language === 'ta') {
          matched = {
            act: 'குடும்ப வன்முறை பாதுகாப்புச் சட்டம், 2005 (PWDVA)',
            rightName: 'குடும்ப வன்முறை & அச்சுறுத்தல் பாதுகாப்பு',
            advice: 'வீட்டில் உடல் ரீதியாக அடிப்பது மட்டுமின்றி, திட்டுதல், மிரட்டுதல், செலவுக்கு பணம் தராமல் துன்புறுத்துதல் அனைத்தும் தண்டனைக்குரிய குடும்ப வன்முறையாகும். வீட்டில் வாழும் முழு உரிமை உங்களுக்கு உண்டு.',
            steps: [
              'உடனடி ஆபத்து என்றால் 181 (பெண்கள் உதவி மையம்) அல்லது 112-ஐ உடனே அழையுங்கள்.',
              'மாவட்ட மகளிர் பாதுகாப்பு அலுவலரிடம் (Protection Officer) பாதுகாப்பு ஆணை (Protection Order) கோருங்கள்.',
              'குடும்ப வீட்டிலிருந்து உங்களை யாரும் வெளியேற்ற முடியாது; தங்கும் உரிமை சட்டப்படி உறுதி செய்யப்பட்டுள்ளது.',
            ],
            authority: 'மாவட்ட மகளிர் பாதுகாப்பு அலுவலர் & சகி ஒன்-ஸ்டாப் மையம்',
            helpline: '181',
            spokenText: 'குடும்ப வன்முறை பாதுகாப்புச் சட்டப்படி உங்களுக்கு முழு பாதுகாப்பு உண்டு. உங்களை வீட்டில் இருந்து யாரும் வெளியேற்ற முடியாது. உடனடி உதவிக்கு 181-ஐ அழையுங்கள்.',
          };
        } else {
          matched = {
            act: 'Protection of Women from Domestic Violence Act, 2005 (PWDVA)',
            rightName: 'Protection from Domestic Abuse & Threat',
            advice: 'Any physical, verbal, mental, or financial harassment by relatives or partner is punishable under the Domestic Violence Act. You have an absolute legal Right to Shared Residence.',
            steps: [
              'Call 181 (Women Helpline) or 112 for immediate shelter or police intervention.',
              'Contact the District Protection Officer to get a court Protection Order.',
              'No family member can legally evict you from your shared household.',
            ],
            authority: 'District Protection Officer & Sakhi One-Stop Crisis Center',
            helpline: '181',
            spokenText: 'Under the Domestic Violence Act, you have legal protection and the right to reside safely in your home. Call women helpline 181.',
          };
        }
      }

      setAiLegalGuidance(matched);
      speakMessage(matched.spokenText);
    }, 800);
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
        <div className="flex items-center gap-1 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
          <Scale size={15} />
          <span>{t('navRights')}</span>
        </div>
      </div>

      {/* Hero Legal Assistance Card (Fully Localized) */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-indigo-200/50 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-md inline-block">
              {str.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-black mt-1 leading-snug">
              {str.title}
            </h3>
            <p className="text-xs text-indigo-100 font-medium mt-0.5 leading-relaxed">
              {str.subtitle}
            </p>
          </div>
          <SpeakButton
            textToSpeak={str.voiceIntro}
            size="md"
          />
        </div>

        {/* Dedicated Continuous Voice Input Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 space-y-2.5">
          {/* Voice Language Selector & Mic Controls */}
          <div className="flex items-center justify-between text-[11px] text-indigo-200">
            <span className="font-semibold flex items-center gap-1">
              <Mic size={13} className="text-amber-400" />
              <span>Voice Input:</span>
            </span>

            {/* Quick Tamil / English Speech Language Toggle */}
            <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setSpeechLanguage('ta')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  speechLanguage === 'ta' ? 'bg-amber-400 text-slate-950' : 'text-white/80 hover:text-white'
                }`}
              >
                தமிழ் (ta)
              </button>
              <button
                type="button"
                onClick={() => setSpeechLanguage('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  speechLanguage === 'en' ? 'bg-amber-400 text-slate-950' : 'text-white/80 hover:text-white'
                }`}
              >
                English (en)
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder={str.inputPlaceholder}
              className="w-full text-xs sm:text-sm p-3 pr-14 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium resize-none shadow-inner"
            />

            {/* Direct Microphone Button inside the Card */}
            <button
              onClick={handleToggleCardVoice}
              type="button"
              className={`absolute right-2.5 bottom-3.5 w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-lg ${
                isListeningInput
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
              title={isListeningInput ? 'Tap to stop recording' : 'Tap to speak your problem'}
            >
              {isListeningInput ? (
                <Square size={17} className="fill-white" />
              ) : (
                <Mic size={20} className="animate-pulse" />
              )}
            </button>
          </div>

          {/* Real-time Audio Level Soundwave Equalizer when recording */}
          {isListeningInput && (
            <div className="bg-red-600/95 text-white text-[11px] font-bold p-2.5 rounded-xl flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>{str.listeningHint}</span>
              </div>

              {/* Bouncing Audio Bars */}
              <div className="flex items-center gap-0.5 h-5 px-1 bg-black/30 rounded-md">
                {[0.3, 0.7, 1.0, 0.6, 0.9, 0.4, 0.8].map((mult, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-amber-300 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(4, Math.min(18, (audioLevel * mult * 0.25)))}px`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Message if Mic Blocked */}
          {voiceError && (
            <div className="bg-amber-100 text-amber-950 p-2.5 rounded-xl text-xs flex items-start gap-2 border border-amber-300">
              <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{voiceError}</p>
                <p className="text-[10px] text-amber-800 mt-0.5">
                  உங்களுக்கு மைக் பிரச்சனை இருந்தால் கீழே உள்ள உதாரண பிரச்சனை பொத்தான்களை நேரடியாக அழுத்தலாம்.
                </p>
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={() => handleAnalyzeSituation()}
            disabled={isAnalyzing || (!problemDescription.trim() && !isListeningInput)}
            className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sparkles size={15} className="text-rose-700" />
            <span>{isAnalyzing ? str.analyzingBtn : str.analyzeBtn}</span>
          </button>
        </div>

        {/* Localized Common Situations Quick Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">
            {str.orCommonTitle}
          </span>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {str.scenarios.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setProblemDescription(sc.query);
                  handleAnalyzeSituation(sc.query);
                }}
                className="text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs truncate transition-colors flex items-center justify-between"
              >
                <span>{sc.title}</span>
                <span className="text-amber-300 text-[10px] font-bold">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Legal Guidance Result Box (In Tamil / Selected Language) */}
      {aiLegalGuidance && (
        <div className="bg-white rounded-3xl p-5 border-2 border-indigo-300 shadow-lg space-y-3.5 animate-in fade-in">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                {str.identifiedLawBadge}
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                {aiLegalGuidance.act}
              </h4>
            </div>
            <SpeakButton
              textToSpeak={aiLegalGuidance.spokenText}
              size="md"
            />
          </div>

          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 text-xs sm:text-sm text-slate-900 leading-relaxed font-semibold">
            {aiLegalGuidance.advice}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-900 block mb-1.5">
              {str.recommendedStepsTitle}
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {aiLegalGuidance.steps.map((st, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{st}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">
                {str.helplineLabel}
              </span>
              <a
                href={`tel:${aiLegalGuidance.helpline}`}
                className="inline-flex items-center gap-1.5 text-sm font-black text-rose-600 hover:underline"
              >
                <Phone size={15} />
                <span>{str.callNowBtn} ({aiLegalGuidance.helpline})</span>
              </a>
            </div>

            <button
              onClick={() => navigateTo('complaint')}
              type="button"
              className="py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
            >
              <FileText size={15} />
              <span>{str.draftComplaintBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Verified Indian Legal Protections List */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 px-1">
          <Scale size={16} className="text-indigo-600" />
          <span>{str.coreRightsTitle}</span>
        </h4>

        {VERIFIED_RIGHTS.map((right) => {
          const title = right.title[language] || right.title['en'];
          const summary = right.summary[language] || right.summary['en'];
          const steps = right.whatToDoSteps[language] || right.whatToDoSteps['en'];
          const isOpen = activeRightDetail?.id === right.id;

          return (
            <div
              key={right.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {right.actName.split('(')[0]}
                  </span>
                  <h5 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 leading-snug">
                    {title}
                  </h5>
                </div>
                <SpeakButton textToSpeak={`${title}. ${summary}`} size="sm" />
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                {summary}
              </p>

              {isOpen && (
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700 animate-in fade-in">
                  <span className="font-bold text-slate-900 block">{str.exerciseTitle}</span>
                  <ul className="space-y-1.5">
                    {steps.map((st, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                    <span>{str.helplineLabel} <strong className="text-rose-600 font-bold">{right.helpline}</strong></span>
                    <span className="truncate max-w-[160px]">{str.sourceLabel} {right.officialSource.split('(')[0]}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActiveRightDetail(isOpen ? null : right)}
                  type="button"
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  {isOpen ? str.showLessBtn : str.viewStepsBtn}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal Advice Transparency Disclaimer */}
      <div className="bg-slate-100 rounded-2xl p-3 text-[11px] text-slate-500 leading-relaxed border border-slate-200 text-center">
        {t('disclaimerLegal')}
      </div>
    </div>
  );
};
