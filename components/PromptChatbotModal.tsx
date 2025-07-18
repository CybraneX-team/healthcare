'use client'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  memo,
  useCallback,
  forwardRef,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function PromptChatbotModal({
  isOpen,
  initialPrompt,
  userName,
  onClose,
  onSave,
}: {
  isOpen: boolean
  initialPrompt: string
  userName: string
  onClose: () => void
  onSave: (p: string) => void
}) {
  const [history, setHistory] = useState<Msg[] | any>([])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastAssistantRef = useRef<HTMLDivElement | null>(null) // new

  useEffect(() => {
    if (!isOpen) return

    const greet: Msg = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `👋 Hey ${userName.split(' ')[0]}! I can rewrite your **prompt** – just tell me what to change.`,
    }

    const promptBubble = initialPrompt.trim()
      ? {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `💡Current Prompt: ${initialPrompt}`,
        }
      : null

    setHistory(promptBubble ? [greet, promptBubble] : [greet])
    setDraft('')
  }, [isOpen, initialPrompt, userName])

  const prevHeightRef = useRef(0)

  useLayoutEffect(() => {
    const feed = scrollRef.current
    if (!feed) return

    const grew = feed.scrollHeight > prevHeightRef.current
    const delta = feed.scrollHeight - feed.scrollTop - feed.clientHeight

    if (grew && delta < 120) feed.scrollTop = feed.scrollHeight

    prevHeightRef.current = feed.scrollHeight
  }, [history, thinking])

  const send = useCallback(async () => {
    if (!draft.trim()) return

    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: draft.trim(),
    }

    setHistory((h: any) => [...h, userMsg])
    setDraft('')
    setThinking(true)

    const res = await fetch('/api/prompt-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...history, userMsg].map(({ role, content }) => ({
          role,
          content,
        })),
      }),
    })

    const { assistant } = await res.json()
    setThinking(false)

    if (assistant?.content) {
      setHistory((h: any) => [
        ...h,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistant.content.trim(),
        },
      ])

      setTimeout(() => {
        lastAssistantRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [draft, history])

  const variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

  const Avatar = memo(function Avatar({
    label,
    bg,
  }: {
    label: string
    bg: string
  }) {
    return (
      <div
        className={`w-9 h-9 rounded-full grid place-items-center font-bold text-white ${bg} shadow-md`}
      >
        {label}
      </div>
    )
  })

  const Bubble = memo(
    forwardRef<HTMLDivElement, { m: Msg }>(function Bubble({ m }, ref) {
      const isUser = m.role === 'user'
      const bgUser = 'bg-[#d5efff] text-gray-900'
      const bgAI = 'bg-[#e5e8ff] text-gray-800 border border-blue-100'

      return (
        <motion.div
          ref={ref}
          variants={variants}
          initial={false}
          animate="show"
          exit="hidden"
          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          {!isUser && <Avatar label="AI" bg="bg-[#7F8CAA]" />}
          <div
            className={`prose prose-sm break-words whitespace-pre-wrap px-5 py-3 rounded-3xl shadow-md relative ${
              isUser ? bgUser : bgAI
            } max-w-[90%]`}
          >
            <ReactMarkdown>{m.content}</ReactMarkdown>
            <span
              className={`absolute -bottom-1 w-2 h-2 rotate-45 ${
                isUser
                  ? 'right-[-3px] bg-[#d5efff]'
                  : 'left-[-3px] bg-[#e5e8ff]'
              }`}
            />
          </div>
          {isUser && (
            <Avatar label={userName[0].toUpperCase()} bg="bg-blue-600" />
          )}
        </motion.div>
      )
    }),
  )

  const Loader = () => (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      className="flex gap-1 pl-12"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
        />
      ))}
    </motion.div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex flex-col w-full max-w-4xl h-[85vh] rounded-[26px] bg-white border border-gray-200 shadow-xl overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <div className="flex items-center justify-between px-7 py-4 border-b border-gray-200 bg-gradient-to-br from-[#eef3f7] to-[#dce9f7]">
              <h3 className="text-xl font-semibold text-gray-900">
                Prompt Assistant
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
              {history.map((m: any, index: any) => (
                <Bubble
                  key={m.id}
                  m={m}
                  ref={
                    m.role === 'assistant' && index === history.length - 1
                      ? lastAssistantRef
                      : undefined
                  }
                />
              ))}
              {thinking && <Loader />}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="px-8 py-5 bg-gradient-to-br from-[#eef3f7] to-[#dce9f7] flex gap-3 border-t border-gray-200"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask to add, remove, tweak…"
                className="flex-1 rounded-full bg-white text-sm px-5 py-3 placeholder-gray-400 text-gray-900 ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-ellipsis overflow-hidden"
              />
              <Button
                disabled={!draft.trim() || thinking}
                className="rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow"
              >
                Send
              </Button>
            </form>

            <div className="px-8 py-5 bg-gradient-to-br from-[#eef3f7] to-[#dce9f7] flex justify-end gap-3 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-700 hover:text-black"
              >
                Cancel
              </Button>
              <Button
                disabled={!history.some((m: any) => m.role === 'assistant')}
                onClick={() => {
                  const lastAI = [...history]
                    .reverse()
                    .find((m) => m.role === 'assistant')
                  if (lastAI) onSave(lastAI.content)
                  onClose()
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save prompt &amp; close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
