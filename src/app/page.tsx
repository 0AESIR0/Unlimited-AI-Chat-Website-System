'use client'

import { ChatInterface } from '../components/ChatInterface'
import { AuthButton } from '../components/AuthButton'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageSelector } from '../components/LanguageSelector'
import { useSession } from 'next-auth/react'
import { useTranslations } from '@/hooks/useTranslations'

export default function Home() {
  const { data: session, status } = useSession()
  const { t, isLoading: translationsLoading } = useTranslations()

  if (status === 'loading' || translationsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-green-500"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* ChatGPT-style Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-50 flex-shrink-0">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-12 sm:h-14">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">C</span>
              </div>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {t('header.title')}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <LanguageSelector />
              <ThemeToggle />
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {session ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center px-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('landing.title')}
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {t('landing.description')}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('landing.features.unlimited')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{t('landing.features.multipleModels')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{t('landing.features.codeGeneration')}</span>
                  </div>
                </div>
              </div>
              
              <AuthButton />
              
              <div className="mt-8 text-xs text-gray-400 dark:text-gray-500">
                {t('landing.termsText')}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
