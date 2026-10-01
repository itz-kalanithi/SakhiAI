import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SpeakButtonProps {
  textToSpeak: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  textToSpeak,
  size = 'md',
  label,
  className = '',
}) => {
  const { speakMessage, stopSpeech, voiceState, isMuted } = useApp();
  const isSpeakingThis = voiceState === 'speaking';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeakingThis) {
      stopSpeech();
    } else {
      speakMessage(textToSpeak);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1',
    md: 'p-2 text-sm gap-1.5',
    lg: 'p-3 text-base gap-2',
  }[size];

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  return (
    <button
      onClick={handleClick}
      type="button"
      title="Tap to listen"
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95 shadow-sm ${
        isSpeakingThis
          ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
          : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
      } ${sizeClasses} ${className}`}
      aria-label="Read aloud"
    >
      {isMuted ? (
        <VolumeX size={iconSizes} className="text-slate-400" />
      ) : (
        <Volume2 size={iconSizes} className={isSpeakingThis ? 'animate-bounce' : ''} />
      )}
      {label && <span className="font-semibold">{label}</span>}
    </button>
  );
};
