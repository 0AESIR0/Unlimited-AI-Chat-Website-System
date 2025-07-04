'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { Locale, languageNames, detectBrowserLanguage } from '@/lib/i18n'

interface LanguageSelectorProps {
  onLanguageChange?: (locale: Locale) => void
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('tr')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // LocalStorage'dan dil tercihi al, yoksa tarayıcı dilini algıla
    const savedLocale = localStorage.getItem('locale') as Locale
    const browserLocale = detectBrowserLanguage()
    const initialLocale = savedLocale || browserLocale
    
    setCurrentLocale(initialLocale)
  }, [])

  const handleLanguageChange = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem('locale', locale)
    setIsOpen(false)
    onLanguageChange?.(locale)
    
    // Sayfayı yenile
    window.location.reload()
  }

  const languages = [
    { code: 'tr' as Locale, name: languageNames.tr, flag: '🇹🇷' },
    { code: 'en' as Locale, name: languageNames.en, flag: '🇺🇸' }
  ]

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors flex items-center space-x-1"
        title="Dil değiştir / Change language"
      >
        <span className="text-sm">{currentLanguage.flag}</span>
        <Globe className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentLocale === language.code ? 'bg-gray-100 dark:bg-gray-700 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
