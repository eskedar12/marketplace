import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../../api/listings.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useLanguage } from '../../hooks/useLanguage.js';
import { notificationText } from '../../utils/notificationText.js';
import { timeAgo } from '../../utils/formatters.js';

// Polling interval for the unread badge — this app has no websocket/SSE
// layer, so "real time" here means "checks every 30s", which is enough
// for a marketplace inbox without adding new infrastructure.
const POLL_MS = 30000;

export default function NotificationBell() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;
    function refreshCount() {
      notificationsApi
        .getUnreadCount()
        .then((res) => {
          if (!cancelled) setUnreadCount(res.data.count);
        })
        .catch(() => {});
    }

    refreshCount();
    const interval = setInterval(refreshCount, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      notificationsApi
        .getMine()
        .then((res) => {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }

  function handleItemClick(notification) {
    setOpen(false);
    if (!notification.is_read) {
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      notificationsApi.markRead(notification.id).catch(() => {});
    }
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        title={t('navbar.notifications')}
        aria-label={t('navbar.notifications')}
        className="relative p-2 text-ink/70 hover:text-mustard hover:bg-mustard/5 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-clay text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-line z-40 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <span className="font-display font-bold text-sm text-ink">{t('notifications.title')}</span>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-body font-medium text-juniper hover:text-mustard"
            >
              {t('common.viewAll')}
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="text-center text-sm text-ink/50 font-body py-8">{t('common.loading')}</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="font-display font-bold text-sm text-ink">{t('notifications.caughtUp')}</p>
                <p className="text-ink/50 text-xs mt-1 font-body">{t('notifications.caughtUpHint')}</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((notification) => {
                const { title, body, link } = notificationText(notification, t);
                return (
                  <Link
                    key={notification.id}
                    to={link}
                    onClick={() => handleItemClick(notification)}
                    className={`block px-4 py-3 border-b border-line last:border-b-0 hover:bg-paper transition-colors ${
                      notification.is_read ? '' : 'bg-mustard/5'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-mustard mt-1.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-body font-semibold text-xs text-ink/60 uppercase tracking-wide">
                          {title}
                        </p>
                        <p className="font-body text-sm text-ink leading-snug mt-0.5">{body}</p>
                        <p className="text-[11px] text-ink/40 font-body mt-1">
                          {timeAgo(notification.created_at, t)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
