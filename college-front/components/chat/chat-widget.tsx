'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getChatHistory, saveChatMessage, clearChatHistory, getDocuments } from '@/lib/storage'

interface Message {
  content: string
  role: 'user' | 'assistant'
}

// Respostas mockadas baseadas em palavras-chave
function getMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  const knowledgeBaseDocs = getDocuments().filter((d) => d.isKnowledgeBase)
  const docNames = knowledgeBaseDocs.map((d) => d.name).join(', ')

  // Saudações
  if (message.match(/^(olá|oi|hey|bom dia|boa tarde|boa noite)/)) {
    return 'Olá! Sou o assistente virtual do Mural Universitário. Como posso ajudá-lo hoje? Posso responder perguntas sobre eventos, estágios, documentos e informações acadêmicas.'
  }

  // Eventos
  if (message.includes('evento') || message.includes('semana acadêmica')) {
    return 'Temos vários eventos programados! A Semana Acadêmica 2024 está com inscrições abertas, ocorrendo de 15 a 22 de Março. Também teremos uma palestra sobre Empreendedorismo Digital em 25 de Março. Confira todos os detalhes na seção de Avisos.'
  }

  // Estágios
  if (message.includes('estágio') || message.includes('vaga') || message.includes('emprego')) {
    return 'Temos várias oportunidades de estágio disponíveis! Atualmente há vagas em Desenvolvimento Web (R$ 1.800), Ciência de Dados (R$ 2.000) e DevOps (R$ 1.900). Acesse a seção de Avisos para ver os detalhes completos e como se candidatar.'
  }

  // Documentos
  if (message.includes('documento') || message.includes('manual') || message.includes('calendário')) {
    if (knowledgeBaseDocs.length > 0) {
      return `Temos diversos documentos disponíveis na nossa base de conhecimento: ${docNames}. Você pode acessá-los na seção de Documentos do site. Se precisar de algum documento específico, me avise!`
    }
    return 'Você pode encontrar documentos importantes como o Manual do Aluno, Calendário Acadêmico e Regimento Interno na seção de Documentos do site.'
  }

  // Matrícula
  if (message.includes('matrícula') || message.includes('matricula') || message.includes('vestibular')) {
    return 'Para informações sobre matrícula do Vestibular 2024.1, a 1ª chamada ocorre de 20 a 25 de Fevereiro na Secretaria Acadêmica. Documentos necessários: RG, CPF, Histórico Escolar, Certificado de Conclusão, Comprovante de Residência e 2 fotos 3x4.'
  }

  // Intercâmbio
  if (message.includes('intercâmbio') || message.includes('internacional') || message.includes('exterior')) {
    return 'O Programa de Intercâmbio Internacional 2024 está com inscrições abertas! Temos parcerias com universidades em Portugal, Itália, Espanha e EUA. As bolsas variam de €1.200 a $1.800 mensais. Requisitos: mínimo 4º semestre e CR 7.0.'
  }

  // Laboratório
  if (message.includes('laboratório') || message.includes('ia') || message.includes('inteligência artificial')) {
    return 'O novo Laboratório de Inteligência Artificial está disponível! Conta com 20 estações de alta performance e servidor com GPUs NVIDIA A100. Funciona de segunda a sexta das 8h às 22h e sábados das 8h às 14h. Necessário agendamento prévio pelo portal.'
  }

  // Horários
  if (message.includes('horário') || message.includes('funcionamento') || message.includes('abre') || message.includes('fecha')) {
    return 'A secretaria funciona de segunda a sexta, das 8h às 20h. A biblioteca funciona de segunda a sábado, das 7h às 22h. Os laboratórios têm horários variados, consulte o portal para informações específicas.'
  }

  // Contato
  if (message.includes('contato') || message.includes('telefone') || message.includes('email')) {
    return 'Você pode entrar em contato conosco pelo e-mail contato@mural.edu.br ou pelo telefone (11) 3000-0000. Estamos localizados na Av. Universitária, 1000 - São Paulo, SP.'
  }

  // Ajuda
  if (message.includes('ajuda') || message.includes('help') || message.includes('o que você pode')) {
    return 'Posso ajudá-lo com informações sobre:\n- Eventos e palestras\n- Vagas de estágio\n- Documentos acadêmicos\n- Processo de matrícula\n- Intercâmbio internacional\n- Laboratórios\n- Horários de funcionamento\n- Contatos\n\nO que você gostaria de saber?'
  }

  // Agradecimento
  if (message.includes('obrigado') || message.includes('valeu') || message.includes('thanks')) {
    return 'De nada! Estou aqui para ajudar. Se tiver mais alguma dúvida, é só perguntar!'
  }

  // Resposta padrão
  return 'Interessante pergunta! Infelizmente não tenho uma resposta específica para isso no momento. Posso ajudá-lo com informações sobre eventos, estágios, documentos, matrícula, intercâmbio ou laboratórios. Em que posso ajudar?'
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Carrega histórico ao abrir
  useEffect(() => {
    if (isOpen) {
      const history = getChatHistory()
      setMessages(history)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Auto scroll para última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput('')

    // Adiciona mensagem do usuário
    const newMessages: Message[] = [...messages, { content: userMessage, role: 'user' }]
    setMessages(newMessages)
    saveChatMessage(userMessage, 'user')

    // Simula digitação
    setIsTyping(true)
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1000))
    setIsTyping(false)

    // Adiciona resposta do assistente
    const response = getMockResponse(userMessage)
    setMessages((prev) => [...prev, { content: response, role: 'assistant' }])
    saveChatMessage(response, 'assistant')
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
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
          </ScrollArea>

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
