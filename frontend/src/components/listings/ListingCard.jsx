import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters.js';
import { favoritesApi } from '../../api/listings.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useLanguage } from '../../hooks/useLanguage.js';
import { cityLabel } from '../../utils/constants.js';

// "Used"-style badge shown on each card. Brand new / lightly used
// read as a light, trustworthy green; fair condition reads as an
// amber "Used" pill — matching the two badge colors in the reference
// design.
function conditionBadge(condition, t) {
  if (condition === 'fair_condition') {
    return { label: t('listings.used'), className: 'bg-amber-50 text-amber-700' };
  }
  if (condition === 'brand_new') {
    return { label: t('listings.brandNew'), className: 'bg-emerald-50 text-emerald-700' };
  }
  return { label: t('listings.lightlyUsed'), className: 'bg-emerald-50 text-emerald-700' };
}

export default function ListingCard({ listing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [favorited, setFavorited] = useState(Boolean(listing.is_favorited));
  const [busy, setBusy] = useState(false);

  const badge = conditionBadge(listing.condition, t);

  function toggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !favorited;
    setFavorited(next); // optimistic
    const call = next ? favoritesApi.add(listing.id) : favoritesApi.remove(listing.id);
    call.catch(() => setFavorited(!next)).finally(() => setBusy(false));
  }

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block bg-white rounded-2xl border border-line overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative aspect-square bg-paper overflow-hidden">
        {listing.thumbnail_url ? (
          <img
            src={listing.thumbnail_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-body text-xs uppercase tracking-widest">
            {t('common.noPhoto')}
          </div>
        )}

        <button
          onClick={toggleFavorite}
          aria-label={favorited ? t('listings.removeFromFavorites') : t('listings.addToFavorites')}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
        >
          <svg
            className={`w-4 h-4 ${favorited ? 'text-clay' : 'text-ink/40'}`}
            fill={favorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.5s-7-4.35-9.5-8.5C.9 8.5 2.5 5 6 5c2 0 3.3 1.1 4 2.1C10.7 6.1 12 5 14 5c3.5 0 5.1 3.5 3.5 7-2.5 4.15-9.5 8.5-9.5 8.5z"
            />
          </svg>
        </button>
      </div>

      <div className="p-3.5 space-y-1.5">
        <h3 className="font-body font-semibold text-sm leading-snug text-ink line-clamp-2 group-hover:text-mustard transition-colors">
          {listing.title}
        </h3>

        <p className="font-display font-bold text-base text-mustard">{formatPrice(listing.price)}</p>

        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md ${badge.className}`}>
          {badge.label}
        </span>

        <div className="flex items-center gap-1 text-xs text-ink/50 font-body pt-0.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 16.66L13.4 20.9a2 2 0 01-2.83 0l-4.24-4.24a8 8 0 1111.31 0z" />
            <circle cx="12" cy="11" r="3" />
          </svg>
          <span className="truncate">{cityLabel(listing.city, t)}</span>
        </div>
      </div>
    </Link>
  );
}
