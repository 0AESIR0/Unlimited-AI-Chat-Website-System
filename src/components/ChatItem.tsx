'use client'

import React, { useState } from 'react'
import { ChatHistory } from '@/types/chat'
import { MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react'

interface ChatItemProps {
  chat: ChatHistory
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (newTitle: string) => void
}

export function ChatItem({ chat, isSelected, onSelect, onDelete, onRename }: ChatItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chat.title)

  const handleRename = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      onRename(editTitle.trim())
    }
    setIsEditing(false)
    setShowMenu(false)
  }

  const handleCancelEdit = () => {
    setEditTitle(chat.title)
    setIsEditing(false)
    setShowMenu(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div
      className={`group relative flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={onSelect}
    >
      {/* Chat İkonu */}
      <div className="flex-shrink-0">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>

      {/* Chat Başlığı */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleRename}
            className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 p-0 m-0"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
            {chat.title}
          </div>
        )}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {chat.messageCount} mesaj
        </div>
      </div>

      {/* Edit Butonları (editing modunda) */}
      {isEditing && (
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleRename}
            className="p-1 text-green-600 hover:text-green-700 rounded"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-red-600 hover:text-red-700 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Menu Butonu */}
      {!isEditing && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-6 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                  setShowMenu(false)
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Edit2 className="w-3 h-3" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                  setShowMenu(false)
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
              >
                <Trash2 className="w-3 h-3" />
                <span>Sil</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
