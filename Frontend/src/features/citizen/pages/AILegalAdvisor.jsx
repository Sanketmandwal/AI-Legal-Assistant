import { useState, useRef, useEffect } from 'react'
import { aiApi } from '@/api/aiApi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Send, Loader2, Scale, BookOpen, AlertCircle,
  User, Bot, Sparkles, PanelLeft, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'

function SuggestionChip({ text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-teal-200 text-slate-600 hover:text-teal-700 transition-colors text-left"
    >
      {text}
    </button>
  )
}

function AssistantMetaBlock({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
        <Icon className="h-3 w-3" /> {title}
      </div>
      {children}
    </div>
  )
}

export default function AILegalAdvisor() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    const query = input.trim()
    if (!query || query.length < 5) {
      toast.error('Please type at least 5 characters.')
      return
    }

    const userMsg = { role: 'user', content: query, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await aiApi.query(query, 'advisor', sessionId)
      if (response.session_id) setSessionId(response.session_id)

      const botMsg = {
        role: 'assistant',
        content: response.explanation || response.summary || 'I could not find a relevant answer.',
        summary: response.summary,
        provisions: response.legal_provisions || [],
        actions: response.recommended_actions || [],
        sources: response.retrieved_sources || [],
        confidence: response.confidence,
        disclaimer: response.disclaimer,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: err.response?.data?.error || 'Failed to connect to the AI engine. Make sure the AI server is running.',
        isError: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestions = [
    'What are my rights during a police arrest?',
    'How do I file a consumer complaint?',
    'What is the punishment for theft under BNS?',
    'Can police refuse to register my FIR?',
  ]

  return (
    <div className="w-full min-h-screen bg-[#f5f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">

        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col border-r border-slate-200 bg-white/90 backdrop-blur-sm min-h-screen`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Scale className="h-5 w-5 text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">AI Legal Advisor</p>
                <p className="text-[11px] text-slate-400 truncate">Indian law assistant</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Sparkles size={14} className="text-teal-600" /> Ask better questions
              </div>
              <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
                <li>Describe the incident clearly.</li>
                <li>Mention timeline, location, and people involved.</li>
                <li>Ask one legal issue at a time.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ShieldCheck size={14} className="text-teal-600" /> Coverage
              </div>
              <div className="flex flex-wrap gap-2">
                {['BNS', 'BNSS', 'BSA', 'FIR', 'Arrest', 'Consumer Law'].map((item) => (
                  <Badge key={item} variant="outline" className="border-slate-200 bg-slate-50 text-slate-500 text-[10px] px-2 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">Quick prompts</p>
              <div className="grid gap-2">
                {suggestions.map((item) => (
                  <SuggestionChip key={item} text={item} onClick={setInput} />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main chat */}
        <main className="min-w-0 flex flex-col min-h-screen">
          <div className="sticky top-0 z-20 bg-[#f5f7fb]/85 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 shrink-0"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">Legal Advisor Chat</h1>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">Chat with your legal AI assistant</p>
                </div>
              </div>
              <Badge className="bg-teal-50 text-teal-700 border border-teal-100 text-[10px] sm:text-xs px-2.5 py-1">
                Session {sessionId ? 'Active' : 'New'}
              </Badge>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shadow-sm mb-5">
                    <Bot className="h-8 w-8 text-teal-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How can I help with your legal issue?</h2>
                  <p className="text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
                    Ask questions about FIRs, arrest rights, legal procedures, consumer complaints, property disputes, and more.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
                    {suggestions.map((item) => (
                      <SuggestionChip key={item} text={item} onClick={setInput} />
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className="space-y-3">
                  <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="mt-1 shrink-0">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${msg.isError ? 'bg-red-100' : 'bg-teal-50 border border-teal-100'}`}>
                          {msg.isError
                            ? <AlertCircle className="h-4 w-4 text-red-600" />
                            : <Bot className="h-4 w-4 text-teal-600" />}
                        </div>
                      </div>
                    )}

                    <div className={`min-w-0 max-w-[92%] sm:max-w-[78%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                      <div className={`rounded-3xl px-4 py-3.5 text-sm leading-7 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white rounded-br-lg'
                          : msg.isError
                            ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-lg'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-lg'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="mt-1 shrink-0 order-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === 'assistant' && !msg.isError && (
                    <div className="ml-12 max-w-[92%] sm:max-w-[78%] space-y-3">
                      {msg.provisions?.length > 0 && (
                        <AssistantMetaBlock title="Legal Provisions" icon={BookOpen}>
                          <div className="space-y-2">
                            {msg.provisions.map((p, j) => (
                              <div key={j} className="flex items-start gap-2.5 text-xs min-w-0">
                                <Badge variant="outline" className="shrink-0 text-[10px] h-5 px-1.5 border-slate-200 text-slate-500 bg-slate-50">
                                  {p.act || p.section || 'Law'}
                                </Badge>
                                <span className="text-slate-600 leading-relaxed break-words">
                                  {p.description || p.title || p.text || JSON.stringify(p)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AssistantMetaBlock>
                      )}

                      {msg.actions?.length > 0 && (
                        <AssistantMetaBlock title="Recommended Actions" icon={Sparkles}>
                          <ul className="space-y-1.5">
                            {msg.actions.map((a, j) => (
                              <li key={j} className="text-xs text-slate-600 flex gap-2 leading-relaxed">
                                <span className="text-teal-500 font-bold shrink-0">→</span>
                                <span className="break-words">{a}</span>
                              </li>
                            ))}
                          </ul>
                        </AssistantMetaBlock>
                      )}

                      {msg.disclaimer && (
                        <p className="text-[10px] text-slate-400 italic px-1 leading-relaxed">{msg.disclaimer}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="mt-1 shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                      <Bot className="h-4 w-4 text-teal-600" />
                    </div>
                  </div>
                  <div className="rounded-3xl rounded-bl-lg bg-white border border-slate-200 px-4 py-3.5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Thinking through legal guidance...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-[#f5f7fb]/92 backdrop-blur-sm px-4 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-3">
                <div className="flex gap-3 items-end">
                  <Textarea
                    placeholder="Message AI Legal Advisor..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="resize-none flex-1 min-h-[52px] max-h-40 border-0 shadow-none focus-visible:ring-0 text-sm text-slate-700 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-teal-600 hover:bg-teal-700 h-11 w-11 rounded-2xl shrink-0 p-0"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                AI guidance is informational and should not replace professional legal advice.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}