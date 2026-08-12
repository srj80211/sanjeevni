import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function ListenButton({ textToSpeak, label = 'Listen', subtitle = 'Tap to hear instructions' }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  const toggleSpeech = () => {
    if (!supported) return;

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    synth.cancel(); // Stop any existing speech

    const defaultText = textToSpeak || 'Please look straight into the camera and make sure your face is clearly visible.';
    const utterance = new SpeechSynthesisUtterance(defaultText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    synth.speak(utterance);
  };

  if (!supported) return null;

  return (
    <div className="listen-button-container">
      <button
        className={`listen-btn ${isSpeaking ? 'speaking' : ''}`}
        onClick={toggleSpeech}
        aria-label={label}
      >
        <div className="sound-wave-icon">
          {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          {isSpeaking && <span className="audio-pulse-ring" />}
        </div>
        <span className="listen-label">{label}</span>
      </button>
      <span className="listen-subtitle">{subtitle}</span>
    </div>
  );
}
