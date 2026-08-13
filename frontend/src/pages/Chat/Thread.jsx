import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { conversationsApi } from '../../api/conversations.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';

export default function Thread() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    conversationsApi
      .getMessages(id)
      .then((res) => setMessages(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      const res = await conversationsApi.sendMessage(id, draft.trim());
      setMessages((m) => [...m, res.data]);
      setDraft('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col h-[calc(100vh-8rem)]">
      <Link to="/messages" className="text-sm font-body text-ink/50 hover:text-ink mb-4">
        ← Back to messages
      </Link>

      {error && <p className="text-clay text-sm font-body mb-2">{error}</p>}

      <div className="flex-1 overflow-y-auto space-y-3 py-2">
        {loading ? (
          <Spinner />
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 text-sm font-body ${
                    mine ? 'bg-juniper text-paper' : 'bg-white border border-line text-ink'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-line">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          className="flex-1 border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper bg-white"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
