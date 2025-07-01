'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Plus, User, Bot } from 'lucide-react'
import { ModelSelector } from './ModelSelector'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
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
  }

  return (
    <div className="flex-1 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-3 space-y-3">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover-lift"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
              Recent Chats
            </div>
          </div>
        </div>
        
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />
          <div style={{ marginTop: '0.7rem' }} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>GitHub Copilot API</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="max-w-2xl mx-auto text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  How can I help you today?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setInput('Write a React component for a modern button')}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white font-medium mb-1">
                      Create a React component
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
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
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-4 message-enter">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white dark:text-gray-900" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex space-x-4 message-enter">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 max-w-md">
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
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Message Copilot Chat..."
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 text-gray-400 hover:text-green-500 dark:hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover-lift rounded-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Copilot Chat can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
