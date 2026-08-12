import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import logoImg from '../assets/Logo.jpeg';

const LANGUAGES = [
  { code: 'en', label: 'English' }
];

export default function Header({ currentLang = 'en', onLangChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0]
  );

  const handleSelect = (lang) => {
    setSelectedLang(lang);
    setIsOpen(false);
    if (onLangChange) onLangChange(lang.code);
  };

  return (
    <header className="sanjeevani-header">
      <div className="brand-container">
        <div className="brand-logo-wrapper">
          <img src={logoImg} alt="Sanjeevani Logo" className="brand-logo-img" />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">SANJEEVANI</h1>
          <p className="brand-subtitle">AI-Powered Rural Healthcare</p>
        </div>
      </div>

      <div className="language-selector-wrapper">
        <button
          className="language-selector-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Select language"
        >
          <Globe className="lang-icon" size={18} />
          <span>{selectedLang.label.split(' ')[0]}</span>
          <ChevronDown className={`chevron-icon ${isOpen ? 'rotate' : ''}`} size={16} />
        </button>

        {isOpen && (
          <div className="language-dropdown">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`lang-option ${selectedLang.code === lang.code ? 'active' : ''}`}
                onClick={() => handleSelect(lang)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
