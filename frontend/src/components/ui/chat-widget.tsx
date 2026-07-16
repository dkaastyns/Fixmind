import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User } from 'lucide-react'
import { chatAi } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-ai-chat-widget', handleToggle)
    return () => window.removeEventListener('toggle-ai-chat-widget', handleToggle)
  }, [])
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'Hai! Saya adalah asisten AI pemeliharaan Anda. Ada yang bisa saya bantu hari ini?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const token = useAuthStore((s) => s.accessToken)

  const handleSend = async () => {
    if (!input.trim() || !token) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsLoading(true)

    try {
      const res = await chatAi(token, userMessage)
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Maaf, saya sedang mengalami kendala saat menyambung ke basis pengetahuan.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg text-white gradient-primary hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : ''}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 gradient-primary text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-medium">Asisten AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#F9D141] text-slate-900 font-bold' : 'bg-blue-100 text-blue-600'}`}>
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-[#F9D141] text-slate-900 font-semibold rounded-tr-sm' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white/90 border-t border-gray-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend() }}
                className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan sesuatu..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-lg bg-[#F9D141] text-slate-900 disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-4 h-4 text-slate-900" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
