import React from 'react';
import { Link } from 'react-router-dom';
import { conditionLabel, formatPrice } from '../utils/format.js';

export default function ListingCard({ listing }) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="tag-card group block bg-white border border-line hover:border-ink/40 transition-colors"
    >
      <span className="tag-hole" aria-hidden="true" />

      <div className="aspect-[4/3] bg-line/40 overflow-hidden">
        {listing.thumbnail_url ? (
          <img
            src={listing.thumbnail_url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 font-mono text-xs uppercase tracking-widest">
            No photo
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-600 text-sm leading-snug text-ink line-clamp-2">
            {listing.title}
          </h3>
        </div>

        <p className="font-mono font-600 text-base text-juniper-dark">
          {formatPrice(listing.price)}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="condition-stamp text-ink/70">{conditionLabel(listing.condition)}</span>
          <span className="text-xs text-ink/50 font-body truncate">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
            {listing.city}
          </span>
        </div>
      </div>
    </Link>
  );
}
