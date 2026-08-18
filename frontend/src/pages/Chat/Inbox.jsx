import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { conversationsApi } from '../../api/conversations.api.js';
import { timeAgo } from '../../utils/formatters.js';
import Spinner from '../../components/common/Spinner.jsx';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    conversationsApi
      .getAll()
      .then((res) => setConversations(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-700 mb-6">Messages</h1>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}
      {loading ? (
        <Spinner />
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line">
          <p className="font-display font-600 text-lg">No conversations yet</p>
          <p className="text-ink/50 text-sm mt-1 font-body">Message a seller from a listing page to start one.</p>
        </div>
      ) : (
        <div className="divide-y divide-line border-t border-b border-line">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className="flex items-center justify-between py-4 px-2 hover:bg-white transition-colors gap-4"
            >
              <div className="min-w-0">
                <p className="font-display font-600 text-sm truncate">{c.other_user_name}</p>
                <p className="text-xs text-ink/50 font-body mt-0.5 truncate">{c.listing_title}</p>
                <p className="text-xs text-ink/50 font-body mt-0.5 truncate">
                  {c.last_message || 'No messages yet'}
                </p>
              </div>
              <span className="text-xs text-ink/40 font-body whitespace-nowrap">
                {timeAgo(c.last_message_at || c.created_at)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
