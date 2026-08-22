import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../api/listings.api.js';
import { useLanguage } from '../../hooks/useLanguage.js';
import { notificationText } from '../../utils/notificationText.js';
import { timeAgo } from '../../utils/formatters.js';
import Spinner from '../../components/common/Spinner.jsx';

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationsApi
      .getMine()
      .then((res) => setNotifications(res.data.notifications))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const hasUnread = notifications.some((n) => !n.is_read);

  function markOneRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    notificationsApi.markRead(id).catch(() => {});
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    notificationsApi.markAllRead().catch(() => {});
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-extrabold text-ink">{t('notifications.title')}</h1>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="text-sm font-body font-medium text-juniper hover:text-mustard transition-colors"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}

      {loading ? (
        <Spinner label={t('common.loading')} className="py-16 justify-center" />
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-2xl">
          <p className="font-display font-bold text-lg text-ink">{t('notifications.caughtUp')}</p>
          <p className="text-ink/50 text-sm mt-1 font-body">{t('notifications.caughtUpHint')}</p>
        </div>
      ) : (
        <div className="border border-line rounded-2xl overflow-hidden bg-white">
          {notifications.map((notification) => {
            const { title, body, link } = notificationText(notification, t);
            return (
              <Link
                key={notification.id}
                to={link}
                onClick={() => !notification.is_read && markOneRead(notification.id)}
                className={`flex items-start gap-3 px-4 sm:px-5 py-4 border-b border-line last:border-b-0 hover:bg-paper transition-colors ${
                  notification.is_read ? '' : 'bg-mustard/5'
                }`}
              >
                {!notification.is_read && (
                  <span className="w-2 h-2 rounded-full bg-mustard mt-2 flex-shrink-0" />
                )}
                <div className={`min-w-0 ${notification.is_read ? 'pl-5' : ''}`}>
                  <p className="font-body font-semibold text-xs text-ink/60 uppercase tracking-wide">
                    {title}
                  </p>
                  <p className="font-body text-sm text-ink leading-snug mt-0.5">{body}</p>
                  <p className="text-xs text-ink/40 font-body mt-1.5">{timeAgo(notification.created_at, t)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
