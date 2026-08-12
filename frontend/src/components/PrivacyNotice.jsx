import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyNotice() {
  return (
    <div className="privacy-card">
      <div className="privacy-icon-wrapper">
        <ShieldCheck size={18} className="privacy-icon" />
      </div>
      <div className="privacy-text">
        <p className="privacy-title">Your data is safe and private</p>
        <p className="privacy-subtitle">We never share without your consent</p>
      </div>
    </div>
  );
}
