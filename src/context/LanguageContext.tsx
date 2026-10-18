import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageOption,
  translations,
} from '../i18n/translations';
import { getSetting, setSetting } from '../database/database';

interface LanguageContextType {
  language: SupportedLanguage;
  languageOption: LanguageOption;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: string, defaultText?: string) => string;
  languagesList: LanguageOption[];
}

const defaultLangOption = SUPPORTED_LANGUAGES[0];

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languageOption: defaultLangOption,
  setLanguage: async () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
  languagesList: SUPPORTED_LANGUAGES,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    async function loadSavedLanguage() {
      try {
        const saved = await getSetting('app_language', 'en');
        if (saved && (saved === 'en' || saved === 'es' || saved === 'fr' || saved === 'de' || saved === 'bn')) {
          setLanguageState(saved as SupportedLanguage);
        }
      } catch (e) {
        console.warn('Failed to load language setting:', e);
      }
    }
    loadSavedLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      await setSetting('app_language', lang);
    } catch (e) {
      console.warn('Failed to persist language setting:', e);
    }
  }, []);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const currentDict = translations[language] || translations.en;
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }
      const enDict = translations.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return defaultText || key;
    },
    [language]
  );

  const currentOption =
    SUPPORTED_LANGUAGES.find((item) => item.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageOption: currentOption,
        setLanguage,
        t,
        languagesList: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
