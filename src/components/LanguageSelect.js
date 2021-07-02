import React from 'react';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '../constants';

export default function LanguageSelect() {
  const { i18n } = useTranslation();
  const selectedLang = i18n.language;

  return (
    <div className="flex space-x-2 absolute top-0 right-0 mr-2 mt-2 text-xl">
      {AVAILABLE_LANGUAGES.map((lang) => (
        <button
          key={lang}
          className={`cursor-pointer opacity-80 ${
            selectedLang === lang && 'opacity-100 text-green-500 font-bold'
          }`}
          onClick={() => {
            i18n.changeLanguage(lang);
          }}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
