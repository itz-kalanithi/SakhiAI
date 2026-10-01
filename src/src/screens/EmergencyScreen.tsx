import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Share2, 
  ArrowLeft, 
  ShieldCheck, 
  Navigation, 
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpeakButton } from '../components/SpeakButton';
import { EMERGENCY_HELPLINES, MOCK_POLICE_STATIONS } from '../data/emergency';
import { locationService } from '../services/locationService';

export const EmergencyScreen: React.FC = () => {
  const { 
    goBack, 
    location, 
    requestLocation, 
    speakMessage, 
    language, 
    t 
  } = useApp();

  const [sosActivated, setSosActivated] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  const handleSosPress = () => {
    setSosActivated(true);
    speakMessage(
      'Emergency SOS triggered. Are you in immediate danger? Dial 112 or 181 right now. Help is nearby.'
    );
  };

  const handleShareLocationWhatsApp = () => {
    const message = locationService.generateEmergencySosMessage('I');
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopyLocation = () => {
    const message = locationService.generateEmergencySosMessage('I');
    navigator.clipboard.writeText(message);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
    speakMessage('Emergency location copied to clipboard.');
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
        <div className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
          <AlertTriangle size={15} className="animate-pulse" />
          <span>Emergency Assistance</span>
        </div>
      </div>

      {/* GIANT HIGH-VISIBILITY SOS BUTTON */}
      <div className="bg-gradient-to-b from-red-600 via-red-700 to-red-900 rounded-3xl p-6 text-white text-center shadow-2xl shadow-red-200 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
            Immediate Danger
          </span>
          <SpeakButton
            textToSpeak="அவசர உதவி தேவைப்பட்டால் இந்த சிவப்பு பொத்தானை அழுத்தவும். 112 மற்றும் 181 உடனடியாக இணைக்கப்படும்."
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30"
          />
        </div>

        <div className="relative py-2 flex items-center justify-center">
          {/* Glowing pulse rings */}
          <span className="absolute w-36 h-36 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
          <span className="absolute w-44 h-44 rounded-full bg-red-400/20 animate-pulse pointer-events-none" />

          <button
            onClick={handleSosPress}
            type="button"
            className="relative z-10 w-28 h-28 rounded-full bg-white text-red-600 hover:bg-red-50 flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-90"
            aria-label="Activate SOS"
          >
            <AlertTriangle size={42} className="animate-bounce" />
            <span className="text-base font-black uppercase tracking-widest mt-1">
              SOS
            </span>
          </button>
        </div>

        <div>
          <h3 className="text-xl font-black">
            {sosActivated ? '🚨 SOS ACTIVATED' : 'Press for Urgent Emergency'}
          </h3>
          <p className="text-xs text-red-100 max-w-xs mx-auto mt-1 font-medium">
            {sosActivated
              ? 'Stay calm. Select 112 or 181 below to immediately speak with officers.'
              : 'Tap to notify emergency helplines and share your live GPS coordinates.'}
          </p>
        </div>

        {/* Live GPS Broadcast Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={handleShareLocationWhatsApp}
            type="button"
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Share2 size={14} />
            <span>Send GPS via WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLocation}
            type="button"
            className="py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-2xl transition-all"
          >
            {copiedShareLink ? '✓ Copied!' : 'Copy GPS Link'}
          </button>
        </div>
      </div>

      {/* Current Location & GPS Accuracy Card */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 text-rose-600">
            <Compass size={18} />
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-[10px]">Your Current Location:</span>
            <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
              {location.district}, {location.state}
            </span>
          </div>
        </div>

        <button
          onClick={requestLocation}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
        >
          {location.isPermissionGranted ? 'GPS Active' : 'Enable High-Accuracy GPS'}
        </button>
      </div>

      {/* 24x7 Verified Indian Emergency Helplines */}
      <div className="space-y-2.5">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 px-1">
          <Phone size={16} className="text-red-600" />
          <span>Emergency One-Tap Helplines</span>
        </h4>

        <div className="grid grid-cols-1 gap-2.5">
          {EMERGENCY_HELPLINES.map((hl) => {
            const title = hl.title[language] || hl.title['en'];
            const desc = hl.desc[language] || hl.desc['en'];

            return (
              <div
                key={hl.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${hl.badgeColor}`}>
                      {hl.number}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Toll Free 24x7
                    </span>
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                    {title}
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {desc}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 shrink-0">
                  <a
                    href={`tel:${hl.number}`}
                    className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-200 active:scale-95 transition-all"
                    title={`Call ${hl.number}`}
                  >
                    <Phone size={22} className="animate-pulse" />
                  </a>
                  <SpeakButton textToSpeak={`${title}. ${desc}. Call ${hl.number}.`} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearby Police Stations & Sakhi One Stop Crisis Centers */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <MapPin size={16} className="text-rose-600" />
            <span>Nearby Police & Sakhi Crisis Centers</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-bold">
            Based on {location.state}
          </span>
        </div>

        <div className="space-y-2.5">
          {MOCK_POLICE_STATIONS.map((station) => {
            const isSakhiCenter = station.type === 'sakhi_one_stop_centre';

            return (
              <div
                key={station.id}
                className={`bg-white rounded-3xl p-4 border shadow-sm space-y-2.5 ${
                  isSakhiCenter ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isSakhiCenter
                            ? 'bg-rose-600 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isSakhiCenter ? 'Sakhi One Stop Centre' : 'Police Station'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-0.5">
                        <Navigation size={11} className="text-slate-400" />
                        {station.distanceKm} km away
                      </span>
                    </div>

                    <h5 className="font-extrabold text-slate-900 text-sm">
                      {station.name}
                    </h5>
                    <p className="text-xs text-slate-500">{station.address}</p>
                  </div>

                  <SpeakButton
                    textToSpeak={`${station.name}. ${station.distanceKm} கிலோமீட்டர் தொலைவில் உள்ளது. தொலைபேசி: ${station.phone}`}
                    size="sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={`tel:${station.phone}`}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone size={13} className="text-rose-600" />
                    <span>Call Station ({station.phone})</span>
                  </a>

                  <a
                    href={`https://maps.google.com/?q=${station.lat},${station.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                  >
                    <Navigation size={13} />
                    <span>Map</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice regarding hardware volume shortcuts */}
      <div className="bg-slate-100 rounded-2xl p-3 text-[11px] text-slate-500 leading-relaxed border border-slate-200 text-center">
        ℹ️ Hardware volume shortcuts are natively supported when SakhiAI is packaged for Android/iOS. In web mode, use the on-screen SOS button or dial 112 directly.
      </div>
    </div>
  );
};
