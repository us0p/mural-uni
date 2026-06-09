'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Trash2, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getChatHistory, saveChatMessage, clearChatHistory } from '@/lib/storage'
import type { ChatMessage } from '@/lib/storage'
import { askChat } from '@/lib/api/chat'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const history = getChatHistory()
      setMessages(history)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = input.trim()
    setInput('')

    const newUserMsg: ChatMessage = { content: userMessage, role: 'user' }
    setMessages((prev) => [...prev, newUserMsg])
    saveChatMessage(userMessage, 'user')

    setIsTyping(true)
    try {
      const response = await askChat({ question: userMessage })
      const sources = response.sources.length > 0 ? response.sources : undefined
      const assistantMsg: ChatMessage = { content: response.answer, role: 'assistant', sources }
      setMessages((prev) => [...prev, assistantMsg])
      saveChatMessage(response.answer, 'assistant', sources)
    } catch {
      const errorMsg: ChatMessage = {
        content: 'Ocorreu um erro ao processar sua pergunta. Tente novamente.',
        role: 'assistant',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleClearHistory = () => {
    clearChatHistory()
    setMessages([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Janela do chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <div>
              <h3 className="font-semibold text-primary-foreground">Assistente Virtual</h3>
              <p className="text-xs text-primary-foreground/70">Mural Universitário</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="h-8 w-8 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              title="Limpar conversa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-2">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Olá! Como posso ajudá-lo hoje?
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Pergunte sobre eventos, estágios, documentos...
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 border-t border-border/40 pt-2 space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Fontes:</p>
                        {msg.sources.map((source) => (
                          <a
                            key={`${source.documentId}-${source.chunkIndex}`}
                            href={
                              source.isPublic
                                ? `/api/documents/public/${source.documentId}/download`
                                : `/api/documents/${source.documentId}/download`
                            }
                            className="flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            <FileDown className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{source.fileName}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
