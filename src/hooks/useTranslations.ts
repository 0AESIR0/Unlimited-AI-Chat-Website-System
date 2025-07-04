'use client'

import { useState, useEffect } from 'react'
import { Locale, detectBrowserLanguage } from '@/lib/i18n'

type Messages = Record<string, unknown>

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>('tr')
  const [messages, setMessages] = useState<Messages>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      
      // LocalStorage'dan dil tercihi al, yoksa tarayıcı dilini algıla
      const savedLocale = localStorage.getItem('locale') as Locale
      const browserLocale = detectBrowserLanguage()
      const currentLocale = savedLocale || browserLocale
      
      // Dil dosyasını yükle
      const response = await import(`@/locales/${currentLocale}.json`)
      
      setLocale(currentLocale)
      setMessages(response.default)
    } catch (error) {
      console.error('Dil dosyası yüklenirken hata:', error)
      // Fallback olarak Türkçe yükle
      const fallback = await import('@/locales/tr.json')
      setMessages(fallback.default)
      setLocale('tr')
    } finally {
      setIsLoading(false)
    }
  }

  // Çeviri fonksiyonu
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: unknown = messages
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
      if (value === undefined) break
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    
    // Parametreleri değiştir
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(`{{${paramKey}}}`, String(paramValue))
      }, value)
    }
    
    return value
  }

  return { t, locale, isLoading, loadMessages }
}
