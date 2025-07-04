'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Plus, User, Bot } from 'lucide-react'
import { ModelSelector } from './ModelSelector'
import { MessageContent } from './MessageContent'
import { ChatList } from '@/components/ChatList'
import { ChatService } from '@/services/chatService'
import { Message } from '@/types/chat'

export function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4.1')
  const [inputHeight, setInputHeight] = useState(48)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [refreshChatList, setRefreshChatList] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !session?.user?.email) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    // UI'yi hemen güncelle
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px'
      setInputHeight(48)
    }
    
    setIsLoading(true)

    try {
      // API'ye request gönder
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          history: messages
        })
      })

      if (!response.ok) throw new Error('Bir hata oluştu')

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      }

      // Firebase'e kaydet
      if (currentChatId) {
        // Mevcut chat'e mesaj ekle
        await ChatService.addMessage(session.user.email, currentChatId, userMessage)
        await ChatService.addMessage(session.user.email, currentChatId, assistantMessage)
      } else {
        // Yeni chat oluştur
        const newChatId = await ChatService.createChat(
          session.user.email,
          userMessage,
          selectedModel
        )
        setCurrentChatId(newChatId)
        await ChatService.addMessage(session.user.email, newChatId, assistantMessage)
        
        // ChatList'i yenile
        setRefreshChatList(prev => prev + 1)
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
  }

  // Chat seçme
  const handleChatSelect = async (chatId: string) => {
    try {
      if (!session?.user?.email) return
      
      const chat = await ChatService.getChat(session.user.email, chatId)
      if (chat) {
        setMessages(chat.messages)
        setCurrentChatId(chatId)
        setSelectedModel(chat.model)
      }
    } catch (error) {
      console.error('Chat yükleme hatası:', error)
    }
  }

  return (
    <div className="flex-1 flex relative">
      {/* Sidebar - Firebase Chat List */}
      <div className="hidden md:flex w-60 lg:w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col fixed left-0 bottom-0 z-10" style={{ top: '49px', height: 'calc(100vh - 49px)' }}>
        <ChatList
          onChatSelect={handleChatSelect}
          onNewChat={startNewChat}
          selectedChatId={currentChatId || undefined}
          refreshTrigger={refreshChatList}
        />
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          <div style={{ marginTop: '0.7rem' }} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>GitHub Copilot API</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area - Proper flex layout */}
      <div className="flex-1 flex flex-col w-full md:ml-60 lg:ml-64 min-h-0">
        {/* Mobile Model Selector & New Chat - Only visible on mobile */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 space-y-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
            MODEL
          </div>
          <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>

        {/* Messages - Dynamic height based on input */}
        <div 
          className="overflow-y-auto custom-scrollbar" 
          style={{ height: `calc(100vh - 49px - ${inputHeight + 80}px)` }}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-3 sm:px-4 lg:px-6">
              <div className="max-w-2xl mx-auto text-center w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-white font-bold text-lg sm:text-xl">C</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  How can I help you today?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={() => setInput('Write a React component for a modern button')}
                    className="p-3 sm:p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white font-medium mb-1 text-sm sm:text-base">
                      Create a React component
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Build modern UI components with TypeScript
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setInput('Explain how GitHub Copilot API works')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white font-medium mb-1">
                      Learn about APIs
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Understand how modern AI APIs function
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setInput('Help me debug this JavaScript code')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white font-medium mb-1">
                      Debug code
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Get help fixing and optimizing your code
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setInput('What are the latest trends in web development?')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white font-medium mb-1">
                      Tech trends
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Stay updated with the latest in technology
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {messages.map((message) => (
                <div key={message.id} className={`flex message-enter ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'user' ? (
                    // User message - Right aligned
                    <div className="flex space-x-3 sm:space-x-4 max-w-[80%] sm:max-w-[70%]">
                      <div className="flex-1 min-w-0">
                        <div className="text-white rounded-2xl px-4 py-3" style={{ backgroundColor: '#404040' }}>
                          <MessageContent content={message.content} role={message.role} />
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center">
                          {session?.user?.image ? (
                            <img 
                              src={session.user.image} 
                              alt="Profile"
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const userIcon = e.currentTarget.nextElementSibling as HTMLElement
                                userIcon?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <User className={`w-4 h-4 sm:w-5 sm:h-5 text-white ${session?.user?.image ? 'hidden' : ''}`} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // AI message - Left aligned  
                    <div className="flex space-x-3 sm:space-x-4 max-w-[80%] sm:max-w-[70%]">
                      <div className="flex-shrink-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <MessageContent content={message.content} role={message.role} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start message-enter">
                  <div className="flex space-x-4 max-w-[80%] sm:max-w-[70%]">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <span className="text-sm ml-2">Düşünüyor...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Dynamic height that grows upward */}
        <div className="border-t border-gray-200 bg-white dark:bg-gray-900 flex-shrink-0" style={{ borderColor: '#111727' }}>
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <div className="relative flex items-end space-x-2 sm:space-x-3">
              <div className="flex-1 relative flex flex-col justify-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    // Dynamic auto resize - properly handles line removal
                    const textarea = e.target
                    
                    // Reset height to auto to get accurate scrollHeight
                    textarea.style.height = 'auto'
                    
                    // Calculate new height based on content
                    const scrollHeight = textarea.scrollHeight
                    const lineHeight = 24 // Approximate line height
                    const padding = 24 // Top + bottom padding
                    const minHeight = 48 // Minimum height (2 lines)
                    const maxHeight = 200 // Maximum height
                    
                    // Calculate actual needed height
                    let newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))
                    
                    // If content is less than 2 lines, use minimum height
                    if (scrollHeight <= minHeight) {
                      newHeight = minHeight
                    }
                    
                    textarea.style.height = newHeight + 'px'
                    setInputHeight(newHeight)
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Copilot Chat..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                  rows={1}
                  style={{ 
                    minHeight: '48px', 
                    maxHeight: '200px', 
                    overflow: 'hidden',
                    height: 'auto',
                    lineHeight: '24px'
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 sm:right-3 top-2 sm:top-3 p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg flex items-center justify-center w-8 h-8"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center px-2">
              Copilot Chat can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
