import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ChatHistory, Message, DateGroup } from '@/types/chat'

export class ChatService {
  // Helper: User'ın chat collection'ını al
  private static getUserChatCollection(userEmail: string) {
    return collection(db, 'users', userEmail, 'chats')
  }

  // Helper: Belirli chat document'ını al
  private static getChatDocument(userEmail: string, chatId: string) {
    return doc(db, 'users', userEmail, 'chats', chatId)
  }

  // Yeni chat oluştur
  static async createChat(
    userEmail: string, 
    firstMessage: Message, 
    model: string
  ): Promise<string> {
    try {
      // İlk mesajdan title generate et
      const title = await this.generateChatTitle(firstMessage.content)
      
      const chatData: Omit<ChatHistory, 'id'> = {
        title,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        messages: [firstMessage],
        model,
        userId: userEmail, // Backward compatibility için
        messageCount: 1
      }

      const userChatCollection = this.getUserChatCollection(userEmail)
      const docRef = await addDoc(userChatCollection, chatData)
      
      console.log('✅ Yeni chat oluşturuldu:', docRef.id, 'for user:', userEmail)
      return docRef.id
    } catch (error) {
      console.error('❌ Chat oluşturma hatası:', error)
      throw error
    }
  }

  // Chat'e mesaj ekle
  static async addMessage(userEmail: string, chatId: string, message: Message): Promise<void> {
    try {
      const chatRef = this.getChatDocument(userEmail, chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) {
        throw new Error('Chat bulunamadı')
      }

      const chatData = chatDoc.data() as ChatHistory
      const updatedMessages = [...chatData.messages, message]

      await updateDoc(chatRef, {
        messages: updatedMessages,
        updatedAt: Timestamp.now(),
        messageCount: updatedMessages.length
      })

      console.log('✅ Mesaj eklendi:', chatId, 'for user:', userEmail)
    } catch (error) {
      console.error('❌ Mesaj ekleme hatası:', error)
      throw error
    }
  }

  // Kullanıcının tüm chat'lerini getir
  static async getUserChats(userEmail: string): Promise<ChatHistory[]> {
    try {
      const userChatCollection = this.getUserChatCollection(userEmail)
      const querySnapshot = await getDocs(userChatCollection)
      const chats: ChatHistory[] = []

      querySnapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data()
        } as ChatHistory)
      })

      // Client-side'da tarihe göre sırala
      chats.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())

      console.log('✅ Chatler yüklendi:', chats.length, 'for user:', userEmail)
      return chats
    } catch (error) {
      console.error('❌ Chatleri yükleme hatası:', error)
      throw error
    }
  }

  // Belirli chat'i getir
  static async getChat(userEmail: string, chatId: string): Promise<ChatHistory | null> {
    try {
      const chatRef = this.getChatDocument(userEmail, chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) {
        return null
      }

      return {
        id: chatDoc.id,
        ...chatDoc.data()
      } as ChatHistory
    } catch (error) {
      console.error('❌ Chat getirme hatası:', error)
      throw error
    }
  }

  // Chat silme
  static async deleteChat(userEmail: string, chatId: string): Promise<void> {
    try {
      const chatRef = this.getChatDocument(userEmail, chatId)
      await deleteDoc(chatRef)
      console.log('✅ Chat silindi:', chatId, 'for user:', userEmail)
    } catch (error) {
      console.error('❌ Chat silme hatası:', error)
      throw error
    }
  }

  // Chat başlığını güncelle
  static async updateChatTitle(userEmail: string, chatId: string, newTitle: string): Promise<void> {
    try {
      const chatRef = this.getChatDocument(userEmail, chatId)
      await updateDoc(chatRef, {
        title: newTitle,
        updatedAt: Timestamp.now()
      })
      console.log('✅ Chat başlığı güncellendi:', chatId, 'for user:', userEmail)
    } catch (error) {
      console.error('❌ Chat başlığı güncelleme hatası:', error)
      throw error
    }
  }

  // Chat'leri tarihine göre grupla
  static groupChatsByDate(chats: ChatHistory[]): Record<DateGroup, ChatHistory[]> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups: Record<DateGroup, ChatHistory[]> = {
      today: [],
      yesterday: [],
      last7days: [],
      older: []
    }

    chats.forEach(chat => {
      const chatDate = chat.updatedAt.toDate()
      
      if (chatDate >= today) {
        groups.today.push(chat)
      } else if (chatDate >= yesterday) {
        groups.yesterday.push(chat)
      } else if (chatDate >= last7Days) {
        groups.last7days.push(chat)
      } else {
        groups.older.push(chat)
      }
    })

    return groups
  }

  // Chat title generate etme
  private static async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      // İlk mesajdan basit title oluştur (max 50 karakter)
      let title = firstMessage.trim()
      
      // Çok uzunsa kısalt
      if (title.length > 50) {
        title = title.substring(0, 47) + '...'
      }
      
      // Boşsa default title
      if (!title) {
        title = 'Yeni Sohbet'
      }

      return title
    } catch (error) {
      console.error('❌ Title generate hatası:', error)
      return 'Yeni Sohbet'
    }
  }

  // Chat'lerde arama
  static searchChats(chats: ChatHistory[], searchTerm: string): ChatHistory[] {
    if (!searchTerm.trim()) return chats

    const term = searchTerm.toLowerCase()
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(term) ||
      chat.messages.some(msg => 
        msg.content.toLowerCase().includes(term)
      )
    )
  }
}
