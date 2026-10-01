import React, { useState } from 'react';
import { 
  Landmark, 
  ArrowLeft, 
  CheckCircle, 
  ExternalLink, 
  FileText, 
  Sparkles,
  ChevronDown,
  Info,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { VERIFIED_SCHEMES } from '../data/schemes';
import { Scheme } from '../types';

export const SchemesScreen: React.FC = () => {
  const { 
    language, 
    goBack, 
    navigateTo, 
    setSelectedSchemeForApply, 
    updateApplicationDraft, 
    location,
    t,
    speakMessage,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSchemeDetail, setActiveSchemeDetail] = useState<Scheme | null>(null);

  // Conversational Eligibility Filter States
  const [showEligibilityChecker, setShowEligibilityChecker] = useState<boolean>(false);
  const [filterAge, setFilterAge] = useState<number>(24);
  const [filterOccupation, setFilterOccupation] = useState<string>('all');
  const [filterIncome, setFilterIncome] = useState<number>(150000);
  const [isPregnantOrMother, setIsPregnantOrMother] = useState<boolean>(false);

  // Filter schemes
  const filteredSchemes = VERIFIED_SCHEMES.filter((scheme) => {
    if (selectedCategory !== 'all' && scheme.category !== selectedCategory) {
      return false;
    }
    if (scheme.state && !location.state.toLowerCase().includes(scheme.state.toLowerCase())) {
      return false;
    }
    if (showEligibilityChecker) {
      if (scheme.eligibility.minAge && filterAge < scheme.eligibility.minAge) return false;
      if (scheme.eligibility.maxAge && filterAge > scheme.eligibility.maxAge) return false;
      if (scheme.id === 'pmmvy' && !isPregnantOrMother) return false;
    }
    return true;
  });

  const handleStartApply = (scheme: Scheme) => {
    setSelectedSchemeForApply(scheme);
    updateApplicationDraft({
      schemeId: scheme.id,
      schemeName: scheme.name,
      addressState: location.state,
      district: location.district,
    });
    const spokenStart = language === 'ta'
      ? `${scheme.nativeName[language] || scheme.name} திட்டத்திற்கு விண்ணப்பிக்க உதவுகிறேன். நான் கேட்கும் கேள்விகளுக்கு குரல் மூலம் பதில் அளியுங்கள்.`
      : `Starting application for ${scheme.name}. I will ask you questions to fill the form step-by-step.`;
    speakMessage(spokenStart, () => {
      navigateTo('scheme-apply');
    });
  };

  const handleOpenEligibilityChecker = () => {
    const nextState = !showEligibilityChecker;
    setShowEligibilityChecker(nextState);
    if (nextState) {
      const eligibilityPrompt = language === 'ta'
        ? 'உங்கள் தகுதியை கண்டறிய உங்கள் வயது மற்றும் கர்ப்பிணியா என்பதை தெரிவியுங்கள்.'
        : 'Let us check your eligibility. Tell me your age and if you are currently pregnant or a mother.';
      speakMessage(eligibilityPrompt);
    }
  };

  const isTa = language === 'ta';

  const categoryList = isTa
    ? [
        { id: 'all', label: 'அனைத்து திட்டங்கள்' },
        { id: 'financial', label: 'சேமிப்பு & ரொக்கம்' },
        { id: 'maternity', label: 'மகப்பேறு உதவி' },
        { id: 'livelihood', label: 'தொழில் & சிறு கடன்' },
        { id: 'education', label: 'உயர்கல்வி உதவி' },
      ]
    : [
        { id: 'all', label: 'All Schemes' },
        { id: 'financial', label: 'Savings & Cash' },
        { id: 'maternity', label: 'Maternity Support' },
        { id: 'livelihood', label: 'Business & Loans' },
        { id: 'education', label: 'Higher Education' },
      ];

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
          <Landmark size={15} />
          <span>{isTa ? 'அரசு திட்டங்கள்' : t('navSchemes')}</span>
        </div>
      </div>

      {/* Voice-First Eligibility Checker Banner (Localized) */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-rose-200 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-md inline-block">
              {isTa ? 'AI தகுதி வழிகாட்டி' : 'AI Eligibility Assistant'}
            </span>
            <h3 className="text-lg sm:text-xl font-black mt-1 leading-snug">
              {isTa ? 'நீங்கள் பெறக்கூடிய அரசு திட்டங்களை கண்டறியுங்கள்' : 'Find Which Schemes You Qualify For'}
            </h3>
            <p className="text-xs text-rose-100 font-medium leading-relaxed">
              {isTa
                ? 'வயது மற்றும் நிலையை குறிப்பிட்டு உங்களுக்கு தகுதியான திட்டங்களை உடனே பாருங்கள்.'
                : 'Answer 3 simple questions to see potentially eligible vs confirmed schemes.'}
            </p>
          </div>
          <SpeakButton
            textToSpeak={
              isTa
                ? 'உங்கள் தகுதியை கண்டறிய சில கேள்விகளுக்கு பதிலளியுங்கள். உங்கள் வயது, மற்றும் நிலையை கொண்டு உங்களுக்கு ஏற்ற திட்டங்களை சகி கண்டுபிடிக்கும்.'
                : 'Answer a few quick questions to check which government schemes you are eligible for.'
            }
            size="md"
          />
        </div>

        <button
          onClick={handleOpenEligibilityChecker}
          className="w-full py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Sparkles size={16} className="text-amber-500" />
          <span>
            {showEligibilityChecker
              ? (isTa ? 'கேள்விகளை மறைக்க' : 'Hide Eligibility Questions')
              : (isTa ? 'என் தகுதியை உடனே சரிபார்க்க' : 'Check My Eligibility Now')}
          </span>
        </button>

        {/* Interactive Eligibility Controls */}
        {showEligibilityChecker && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-xs space-y-3 animate-in fade-in">
            {/* Age Slider */}
            <div>
              <div className="flex justify-between font-bold text-xs mb-1">
                <span>{isTa ? 'விண்ணப்பதாரர் வயது:' : 'Applicant Age:'}</span>
                <span className="bg-white text-rose-800 px-2 py-0.5 rounded font-black">
                  {filterAge} {isTa ? 'வயது' : 'years'}
                </span>
              </div>
              <input
                type="range"
                min="16"
                max="65"
                value={filterAge}
                onChange={(e) => setFilterAge(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Maternity check */}
            <div className="flex items-center justify-between pt-1">
              <span>{isTa ? 'கர்ப்பிணியா அல்லது பச்சிளம் குழந்தையின் தாயா?' : 'Pregnant or mother of infant?'}</span>
              <button
                type="button"
                onClick={() => setIsPregnantOrMother(!isPregnantOrMother)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors ${
                  isPregnantOrMother ? 'bg-amber-400 text-rose-950' : 'bg-white/20 text-white'
                }`}
              >
                {isPregnantOrMother ? (isTa ? '✓ ஆம்' : '✓ Yes') : (isTa ? 'இல்லை' : 'No')}
              </button>
            </div>

            {/* Income indicator */}
            <div className="pt-1 text-[11px] text-rose-200">
              {isTa ? 'மாநில திட்டம்:' : 'Region Filter:'} <strong>{location.state}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills (Localized) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categoryList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Schemes List */}
      <div className="space-y-3">
        {filteredSchemes.map((scheme) => {
          const nativeName = scheme.nativeName[language] || scheme.nativeName['en'];
          const benefits = scheme.nativeBenefits[language] || scheme.nativeBenefits['en'];
          const isDetailOpen = activeSchemeDetail?.id === scheme.id;

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                      {scheme.ministry.split(',')[0]}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check size={10} /> {isTa ? 'தகுதி பெற வாய்ப்புள்ளது' : 'Potentially Eligible'}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {nativeName}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {scheme.name}
                  </p>
                </div>
                <SpeakButton
                  textToSpeak={`${nativeName}. நன்மைகள்: ${benefits}`}
                  size="sm"
                />
              </div>

              {/* Highlight Benefits Box */}
              <div className="bg-gradient-to-r from-rose-50/70 to-amber-50/60 p-3 rounded-2xl border border-rose-100 text-xs sm:text-sm font-semibold text-rose-950">
                💰 {benefits}
              </div>

              {/* Expandable Details */}
              {isDetailOpen && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700 animate-in fade-in">
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">
                      {isTa ? 'பயனாளிகள் தகுதி:' : 'Target Group:'}
                    </span>
                    <p>{scheme.eligibility.targetGroup}</p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block mb-1">
                      {isTa ? 'தேவையான ஆவணங்கள்:' : 'Required Documents:'}
                    </span>
                    <ul className="space-y-1">
                      {scheme.requiredDocs.map((doc, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{isTa ? 'ஆதாரம்:' : 'Source:'} {scheme.isCentral ? (isTa ? 'மத்திய அரசு' : 'Govt of India') : scheme.state}</span>
                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{isTa ? 'அரசு தளம்' : 'Official Portal'}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleStartApply(scheme)}
                  type="button"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <FileText size={15} />
                  <span>{isTa ? 'விண்ணப்பிக்கவும் (குரல் வழி)' : `${t('applyNow')} (Voice Assistant)`}</span>
                </button>

                <button
                  onClick={() => setActiveSchemeDetail(isDetailOpen ? null : scheme)}
                  type="button"
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors"
                >
                  {isDetailOpen ? (isTa ? 'மறைக்க' : 'Hide') : (isTa ? 'முழு விவரம்' : 'Details')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
