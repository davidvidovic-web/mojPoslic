'use client'

import React from 'react';
import { useSupabaseAuth } from "@/contexts/supabase-auth-context"
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'select' | 'buttons';
  className?: string;
}

export function LanguageSwitcher({ variant = 'select', className }: LanguageSwitcherProps) {
  const { user, updateLanguagePreference } = useSupabaseAuth();
  const currentLocale = useLocale();

  const languages = [
    { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    if (user) {
      // If user is logged in, update their preference and redirect
      await updateLanguagePreference(languageCode);
    } else {
      // If user is not logged in, just redirect to the appropriate domain
      const currentUrl = new URL(window.location.href);
      const baseDomain = currentUrl.hostname.replace(/^en\./, '');
      
      if (languageCode === 'en') {
        window.location.href = `${currentUrl.protocol}//en.${baseDomain}${currentUrl.pathname}${currentUrl.search}`;
      } else {
        window.location.href = `${currentUrl.protocol}//${baseDomain}${currentUrl.pathname}${currentUrl.search}`;
      }
    }
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={currentLocale === lang.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange(lang.code)}
            className="gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Languages className="h-4 w-4" />
      <Select value={currentLocale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            {languages.find(lang => lang.code === currentLocale)?.flag}{' '}
            {languages.find(lang => lang.code === currentLocale)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
