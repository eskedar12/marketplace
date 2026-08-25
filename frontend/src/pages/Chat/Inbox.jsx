import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { conversationsApi } from '../../api/conversations.api.js';
import { timeAgo } from '../../utils/formatters.js';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function Inbox() {
  const { t } = useLanguage();
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
      <h1 className="text-2xl font-700 mb-6">{t('chat.messages')}</h1>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}
      {loading ? (
        <Spinner />
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line">
          <p className="font-display font-600 text-lg">{t('chat.noConversations')}</p>
          <p className="text-ink/50 text-sm mt-1 font-body">{t('chat.noConversationsHint')}</p>
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
                <p className="font-display font-600 text-sm flex items-center gap-1.5 truncate">
                  {c.other_user_name}
                  {c.other_user_verified && (
                    <span className="inline-flex items-center text-blue-500" title="Verified User">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" />
                      </svg>
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink/50 font-body mt-0.5 truncate">{c.listing_title}</p>
                <p className="text-xs text-ink/50 font-body mt-0.5 truncate">
                  {c.last_message || t('chat.noMessagesYet')}
                </p>
              </div>
              <span className="text-xs text-ink/40 font-body whitespace-nowrap">
                {timeAgo(c.last_message_at || c.created_at, t)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
