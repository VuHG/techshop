'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { aiService, type ChatMessage } from '@/services/aiService';
import { cn } from '@/lib/utils';

const QUICK_REPLIES = [
  'Tư vấn laptop lập trình dưới 20 triệu',
  'PC gaming tầm 25 triệu',
  'Laptop văn phòng mỏng nhẹ',
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, dangGui]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || dangGui) return;
    const lichSu = messages.slice(-6);
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setInput('');
    setDangGui(true);
    try {
      const reply = await aiService.chat(msg, lichSu);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Xin lỗi, trợ lý ảo đang bận. Vui lòng thử lại sau.' },
      ]);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Trợ lý ảo"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-dark"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-primary px-4 py-3 text-white">
            <Bot className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">Trợ lý TechShop</p>
              <p className="text-[11px] text-white/80">Tư vấn sản phẩm công nghệ</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <div className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">
                  Xin chào! Mình là trợ lý TechShop. Bạn cần tư vấn sản phẩm gì?
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-full border border-primary/30 bg-white px-3 py-1 text-xs text-primary hover:bg-primary-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
                    m.role === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-700 shadow-sm',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {dangGui && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white px-3 py-2 text-sm text-gray-400 shadow-sm">
                  Đang soạn câu trả lời...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-gray-100 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={dangGui}
              aria-label="Gửi"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
