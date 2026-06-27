import React, { createContext, useContext, useState } from "react";
import { translations } from "../utils/translations";

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(
    localStorage.getItem("preferred_language") || ""
  );

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
  };

  const t = (key) => {
    const activeLang = language || "en";
    return translations[activeLang]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {!language ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-rose-100 shadow-2xl p-8 text-center transform scale-100 transition-all duration-300">
            {/* Heart Icon Logo */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-6 animate-pulse">
              <span className="text-3xl">💖</span>
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
              Select Your Language
            </h2>
            <h3 className="text-xl font-bold text-maroon-700 tracking-tight mb-4">
              உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்
            </h3>
            
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Please choose a language to continue browsing Soulmate Matrimony.<br/>
              தொடர ஆங்கிலம் அல்லது தமிழ் மொழியைத் தேர்ந்தெடுக்கவும்.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setLanguage("en")}
                className="w-full py-4 px-6 rounded-2xl bg-rose-500 text-white font-bold text-lg shadow-md hover:bg-rose-600 active:scale-[0.98] transition-all duration-200"
              >
                English
              </button>
              <button
                onClick={() => setLanguage("ta")}
                className="w-full py-4 px-6 rounded-2xl bg-maroon-600 text-white font-bold text-lg shadow-md hover:bg-maroon-700 active:scale-[0.98] transition-all duration-200"
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {children}
    </LanguageContext.Provider>
  );
};
