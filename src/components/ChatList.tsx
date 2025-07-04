'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ChatHistory } from '@/types/chat'
import { ChatService } from '@/services/chatService'
import { ChatItem } from '@/components/ChatItem'
import { Search, Plus } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

interface ChatListProps {
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  selectedChatId?: string
  refreshTrigger?: number // Chat listesini yenilemek için trigger
}

export function ChatList({ onChatSelect, onNewChat, selectedChatId, refreshTrigger }: ChatListProps) {
  const { data: session } = useSession()
  const { t } = useTranslations()
  const [chats, setChats] = useState<ChatHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true)
      const userChats = await ChatService.getUserChats(session?.user?.email || '')
      setChats(userChats)
    } catch (error) {
      console.error('Chat yükleme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.email])

  // Chat'leri yükle
  useEffect(() => {
    if (session?.user?.email) {
      loadChats()
    }
  }, [session, loadChats])

  // Refresh trigger'a göre chat'leri yeniden yükle
  useEffect(() => {
    if (refreshTrigger && session?.user?.email) {
      loadChats()
    }
  }, [refreshTrigger, session, loadChats])

  // Chat silme
  const handleDeleteChat = async (chatId: string) => {
    try {
      if (!session?.user?.email) return
      
      await ChatService.deleteChat(session.user.email, chatId)
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      
      // Seçili chat silinirse yeni chat'e geç
      if (selectedChatId === chatId) {
        onNewChat()
      }
    } catch (error) {
      console.error('Chat silme hatası:', error)
    }
  }

  // Chat başlığını güncelle
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      if (!session?.user?.email) return
      
      await ChatService.updateChatTitle(session.user.email, chatId, newTitle)
      setChats(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      )
    } catch (error) {
      console.error('Chat yeniden adlandırma hatası:', error)
    }
  }

  // Arama ve gruplama
  const filteredChats = ChatService.searchChats(chats, searchTerm)
  const groupedChats = ChatService.groupChatsByDate(filteredChats)

  const renderChatGroup = (groupTitle: string, groupChats: ChatHistory[]) => {
    if (groupChats.length === 0) return null

    return (
      <div key={groupTitle} className="mb-4">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-2">
          {groupTitle}
        </div>
        <div className="space-y-1">
          {groupChats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onSelect={() => onChatSelect(chat.id)}
              onDelete={() => handleDeleteChat(chat.id)}
              onRename={(newTitle: string) => handleRenameChat(chat.id, newTitle)}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-3 text-center text-gray-500 dark:text-gray-400">
        {t('chat.loginRequired')}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 space-y-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>{t('chat.newChat')}</span>
        </button>

        {/* Arama */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('chat.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat Listesi */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            {t('common.loading')}
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-3 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? t('chat.noSearchResults') : t('chat.noChats')}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {renderChatGroup(t('dateGroups.today'), groupedChats.today)}
            {renderChatGroup(t('dateGroups.yesterday'), groupedChats.yesterday)}
            {renderChatGroup(t('dateGroups.last7days'), groupedChats.last7days)}
            {renderChatGroup(t('dateGroups.older'), groupedChats.older)}
          </div>
        )}
      </div>
    </div>
  )
}
