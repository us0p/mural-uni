import type { Document, Subscriber } from './types'
import type { ChatSource } from './api/types'

const isClient = typeof window !== 'undefined'

const KEYS = {
  documents: 'mural_documents',
  subscribers: 'mural_subscribers',
  chatHistory: 'mural_chat_history',
}

const defaultDocuments: Document[] = []
const defaultSubscribers: Subscriber[] = []

export function initializeStorage() {
  if (!isClient) return
  if (!localStorage.getItem(KEYS.documents)) {
    localStorage.setItem(KEYS.documents, JSON.stringify(defaultDocuments))
  }
  if (!localStorage.getItem(KEYS.subscribers)) {
    localStorage.setItem(KEYS.subscribers, JSON.stringify(defaultSubscribers))
  }
}

// === DOCUMENTS ===
export function getDocuments(): Document[] {
  if (!isClient) return defaultDocuments
  const data = localStorage.getItem(KEYS.documents)
  return data ? JSON.parse(data) : defaultDocuments
}

export function getDocumentsByAccessLevel(level: number): Document[] {
  return getDocuments().filter((d) => d.isPublic || d.minAccessLevel <= level)
}

// === SUBSCRIBERS ===
export function getSubscribers(): Subscriber[] {
  if (!isClient) return defaultSubscribers
  const data = localStorage.getItem(KEYS.subscribers)
  return data ? JSON.parse(data) : defaultSubscribers
}

export function addSubscriber(email: string): Subscriber {
  const subscriber: Subscriber = {
    id: `sub-${Date.now()}`,
    email,
    subscribedAt: new Date().toISOString(),
  }
  if (isClient) {
    const subscribers = getSubscribers()
    subscribers.push(subscriber)
    localStorage.setItem(KEYS.subscribers, JSON.stringify(subscribers))
  }
  return subscriber
}

export interface ChatMessage {
  content: string
  role: 'user' | 'assistant'
  sources?: ChatSource[]
}

// === CHAT HISTORY ===
export function getChatHistory(): ChatMessage[] {
  if (!isClient) return []
  const data = localStorage.getItem(KEYS.chatHistory)
  return data ? JSON.parse(data) : []
}

export function saveChatMessage(content: string, role: 'user' | 'assistant', sources?: ChatSource[]): void {
  if (!isClient) return
  const history = getChatHistory()
  const message: ChatMessage = { content, role }
  if (sources && sources.length > 0) message.sources = sources
  history.push(message)
  if (history.length > 50) history.splice(0, history.length - 50)
  localStorage.setItem(KEYS.chatHistory, JSON.stringify(history))
}

export function clearChatHistory(): void {
  if (!isClient) return
  localStorage.removeItem(KEYS.chatHistory)
}
