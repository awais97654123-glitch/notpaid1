'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr', flag: '🇺🇸' },
  { code: 'ur', label: 'اردو (Urdu)', dir: 'rtl', flag: '🇵🇰' },
  { code: 'ar', label: 'العربية (Arabic)', dir: 'rtl', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी (Hindi)', dir: 'ltr', flag: '🇮🇳' },
];

export function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = React.useState('en');

  React.useEffect(() => {
    const saved = localStorage.getItem('taskpad_locale') || 'en';
    setCurrentLocale(saved);
  }, []);

  const changeLanguage = (code: string, dir: string) => {
    setCurrentLocale(code);
    localStorage.setItem('taskpad_locale', code);
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', code);

    // Set cookie for server components / next-intl
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const currentLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 text-xs gap-1.5 cursor-pointer">
          <Globe className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline font-medium">{currentLang.label}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="text-xs">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code, lang.dir)}
            className={`gap-2 ${currentLocale === lang.code ? 'font-bold bg-slate-100 dark:bg-slate-800 text-blue-600' : ''}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {lang.dir === 'rtl' && (
              <span className="text-[10px] text-slate-400 ml-auto">RTL</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
