import React, { useState } from 'react';
import { FileText, History, Globe, Sparkles, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { LanguageOption } from '../types';

interface NavbarProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  credits: number;
  hasUnlimited: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenPaywall: () => void;
  onResetToHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  credits,
  hasUnlimited,
  historyCount,
  onOpenHistory,
  onOpenPaywall,
  onResetToHome,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.name === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 bg-[#fbfbfa]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={onResetToHome}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center shadow-xs shadow-teal-900/10 group-hover:bg-teal-700 transition-colors">
            <FileText className="w-5 h-5 text-teal-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-stone-900">Plain</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                Beta
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium leading-none hidden sm:block">
              Clear document explanations
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Credits / Upgrade Button */}
          <button
            onClick={onOpenPaywall}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              hasUnlimited
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : credits > 0
                ? 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title="View Plans & Credits"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>
              {hasUnlimited ? 'Unlimited' : `${credits} ${credits === 1 ? 'Free Credit' : 'Credits'}`}
            </span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white text-stone-700 text-xs font-medium border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs"
              aria-label="Select output language"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-base leading-none">{activeLang.flag}</span>
              <span className="hidden md:inline">{activeLang.name}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {langMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white border border-stone-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                    Output Language
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.name);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-stone-50 ${
                          currentLanguage === lang.name
                            ? 'text-teal-900 font-semibold bg-teal-50/70'
                            : 'text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.name}</span>
                          <span className="text-[11px] text-stone-400">({lang.localName})</span>
                        </div>
                        {currentLanguage === lang.name && (
                          <Check className="w-3.5 h-3.5 text-teal-700" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* History Drawer Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-stone-700 text-xs font-medium border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs"
            aria-label="View history"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-teal-800 text-white text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
