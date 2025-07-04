import { Timestamp } from 'firebase/firestore'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface ChatHistory {
  id: string
  title: string
  createdAt: Timestamp
  updatedAt: Timestamp
  messages: Message[]
  model: string
  userId: string
  messageCount: number
}

export interface ChatGroup {
  title: string
  chats: ChatHistory[]
}

export type DateGroup = 'today' | 'yesterday' | 'last7days' | 'older'
