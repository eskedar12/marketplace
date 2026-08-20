import React from 'react';
import ListingCard from './ListingCard.jsx';
import Spinner from '../common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function ListingGrid({ listings, loading, emptyTitle, emptyHint }) {
  const { t } = useLanguage();
  if (loading) {
    return <Spinner label={t('listings.loadingListings')} className="py-16 justify-center" />;
  }

  if (!listings.length) {
    return (
      <div className="text-center py-16 border border-dashed border-line">
        <p className="font-display font-600 text-lg">{emptyTitle || t('listings.noListingsYet')}</p>
        <p className="text-ink/50 text-sm mt-1 font-body">{emptyHint || t('listings.widenFilters')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
