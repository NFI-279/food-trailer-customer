// [Frontend - Customer] src/providers/LanguageProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void; // A simple toggle function for the Globe icon!
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ro"); // Let's default to Romanian for the customers!

  useEffect(() => {
    const saved = localStorage.getItem("customer_lang") as Language;
    if (saved === "ro" || saved === "en") setLanguageState(saved);
  }, []);

  const toggleLanguage = () => {
    const newLang = language === "ro" ? "en" : "ro";
    setLanguageState(newLang);
    localStorage.setItem("customer_lang", newLang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}