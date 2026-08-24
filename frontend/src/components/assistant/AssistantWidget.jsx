import React, { useEffect, useRef, useState } from 'react';
import { assistantApi } from '../../api/assistant.api.js';
import { usePageContext } from '../../hooks/usePageContext.js';
import { useLanguage } from '../../hooks/useLanguage.js';

// How many of the widget's own past turns get sent back as context for
// a follow-up question. Matches assistant.validation.js's max(8) on the
// backend — kept in sync here so a trim on one side isn't silently
// pointless on the other.
const HISTORY_TURNS = 8;

export default function AssistantWidget() {
  const { page, pageDetails } = usePageContext();
  const { language, t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError('');
    setInput('');
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await assistantApi.ask({
        message: text,
        page,
        pageDetails,
        language,
        history: nextMessages.slice(-HISTORY_TURNS - 1, -1),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setError(err.message || t('assistant.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[340px] max-w-[calc(100vw-2.5rem)] h-[440px] bg-white rounded-2xl shadow-2xl border border-line flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-ink text-white shrink-0">
            <div>
              <p className="font-display font-700 text-sm">{t('assistant.title')}</p>
              <p className="text-[11px] text-white/60 font-body">{t('assistant.subtitle')}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t('assistant.close')}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-cream/40">
            {messages.length === 0 && (
              <div className="bg-white border border-line rounded-xl rounded-tl-sm px-3 py-2 text-xs font-body text-ink/70 max-w-[85%]">
                {t('assistant.welcome')}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-xl text-xs font-body max-w-[85%] whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-mustard text-white rounded-br-sm ml-auto'
                    : 'bg-white border border-line text-ink/80 rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-line rounded-xl rounded-tl-sm px-3 py-2 text-xs font-body text-ink/40 max-w-[85%]">
                {t('assistant.thinking')}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs font-body text-red-600 max-w-[90%]">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 p-2.5 border-t border-line shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.placeholder')}
              className="flex-1 text-xs font-body px-3 py-2 rounded-full border border-line focus:outline-none focus:border-mustard/60 bg-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t('assistant.send')}
              className="w-8 h-8 shrink-0 rounded-full bg-mustard text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t('assistant.close') : t('assistant.open')}
        className="w-[52px] h-[52px] rounded-full bg-ink text-white shadow-xl flex items-center justify-center hover:bg-ink/90 transition-colors"
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.05 0-2.06-.16-3-.46L3 21l1.5-4.5C3.55 15.13 3 13.6 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
