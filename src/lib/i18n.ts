export const locales = ['en', 'tr'] as const
export const defaultLocale = 'tr' as const

export type Locale = typeof locales[number]

// Tarayıcı dilini algıla
export function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return defaultLocale
  
  const browserLang = navigator.language.split('-')[0]
  return locales.includes(browserLang as Locale) ? (browserLang as Locale) : defaultLocale
}

// Dil adları
export const languageNames = {
  en: 'English',
  tr: 'Türkçe'
} as const
