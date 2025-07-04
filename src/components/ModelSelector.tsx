'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

const AI_MODELS = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: 'En gelişmiş model - kod, metin, resim analizi - Profesyonel/günlük kullanım',
    icon: '🧠',
    color: 'bg-green-500'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Yüksek Performans ve verim - günlük kullanım',
    icon: '⚡',
    color: 'bg-blue-500'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI', 
    description: 'Hızlı ve verimli - günlük kullanım',
    icon: '🎭',
    color: 'bg-purple-500'
  },
  {
    id: 'llama3.2-vision:11b',
    name: 'LLaMA 3.2 Vision',
    provider: 'Meta',
    description: 'Görsel içerik analizi - güçlü ve etkili',
    icon: '👁️',
    color: 'bg-gray-500'
  },
  {
    id: 'stable-diffusion-xl-base-1.0',
    name: 'Stable Diffusion XL Base 1.0',
    provider: 'Cloudflare AI',
    description: 'Ücretsiz resim çizdirme - 10k request/gün',
    icon: '🎨',
    color: 'bg-orange-500'
  },
]

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslations()

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover-lift"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg model-icon">{currentModel.icon}</span>
          <div className="text-left">
            <div className="font-medium text-sm">{currentModel.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{currentModel.provider}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 model-dropdown-enter">
            <div className="p-2 space-y-1">
              {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedModel === model.id ? 'bg-gray-100 dark:bg-gray-700 ring-1 ring-green-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-xl">{model.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">{model.name}</span>
                      <span className={`w-2 h-2 rounded-full ${model.color}`}></span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{model.provider}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{model.description}</div>
                  </div>
                </div>
              </button>
            ))}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('models.tooltip')}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
