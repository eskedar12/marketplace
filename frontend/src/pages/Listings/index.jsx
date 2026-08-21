import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListings } from '../../hooks/useListings.js';
import Sidebar from '../../components/layout/Sidebar.jsx';
import FilterBar from '../../components/listings/FilterBar.jsx';
import ListingGrid from '../../components/listings/ListingGrid.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { cityLabel } from '../../utils/constants.js';

// The full "browse everything" page — reached from the homepage's
// "View All" link and the footer's "View all categories" link. Single
// category browsing with its own filters lives at /category/:slug;
// this page covers the unfiltered, all-categories case.
export default function Listings() {
  const { filters, updateFilter, items, total, loading, error } = useListings();
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedInitialParams = useRef(false);
  const { t } = useLanguage();

  // Pick up ?q= and ?city= from the homepage's search bar once on
  // mount, then drop them from the URL so they don't linger once the
  // user starts changing filters here.
  useEffect(() => {
    if (appliedInitialParams.current) return;
    appliedInitialParams.current = true;

    const q = searchParams.get('q');
    const city = searchParams.get('city');
    if (q) updateFilter('q', q);
    if (city) updateFilter('city', city);
    if (q || city) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-ink">{t('listings.allListings')}</h1>
          <p className="text-xs font-body text-ink/50 mt-0.5">{t('listings.showingActiveOffers', { total })}</p>
        </div>
      </div>

      {(filters.category_id || filters.q || filters.city || filters.condition || filters.min_price || filters.max_price) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white border border-line rounded-xl">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-widest font-display mr-1">{t('listings.activeFilters')}</span>
          {filters.q && (
            <span className="inline-flex items-center gap-1.5 bg-paper text-ink text-xs font-medium px-2.5 py-1 rounded-lg">
              {t('listings.query', { q: filters.q })}
              <button onClick={() => updateFilter('q', '')} className="text-ink/40 hover:text-ink/70 font-bold leading-none">&times;</button>
            </span>
          )}
          {filters.city && (
            <span className="inline-flex items-center gap-1.5 bg-paper text-ink text-xs font-medium px-2.5 py-1 rounded-lg">
              {t('listings.city', { city: cityLabel(filters.city, t) })}
              <button onClick={() => updateFilter('city', '')} className="text-ink/40 hover:text-ink/70 font-bold leading-none">&times;</button>
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1.5 bg-paper text-ink text-xs font-medium px-2.5 py-1 rounded-lg">
              {t('listings.condition', { condition: filters.condition.replace('_', ' ') })}
              <button onClick={() => updateFilter('condition', '')} className="text-ink/40 hover:text-ink/70 font-bold leading-none">&times;</button>
            </span>
          )}
          {(filters.min_price || filters.max_price) && (
            <span className="inline-flex items-center gap-1.5 bg-paper text-ink text-xs font-medium px-2.5 py-1 rounded-lg">
              {t('listings.price', { min: filters.min_price || '0', max: filters.max_price || t('listings.max') })}
              <button
                onClick={() => {
                  updateFilter('min_price', '');
                  updateFilter('max_price', '');
                }}
                className="text-ink/40 hover:text-ink/70 font-bold leading-none"
              >
                &times;
              </button>
            </span>
          )}
          <button
            onClick={() => {
              updateFilter('q', '');
              updateFilter('category_id', '');
              updateFilter('city', '');
              updateFilter('condition', '');
              updateFilter('min_price', '');
              updateFilter('max_price', '');
            }}
            className="text-xs font-bold text-mustard hover:text-mustard-dark ml-auto transition-colors"
          >
            {t('listings.clearAll')}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <Sidebar title={t('listings.filters')} className="w-full lg:w-64 flex-shrink-0">
          <FilterBar filters={filters} onChange={updateFilter} />
        </Sidebar>

        <div className="flex-1">
          {error && <p className="text-clay text-sm mb-4 font-body">{error}</p>}

          <ListingGrid listings={items} loading={loading} />

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12 font-body text-sm">
              <Button
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() => updateFilter('page', filters.page - 1)}
                className="rounded-lg hover:bg-paper border-line"
              >
                {t('listings.prev')}
              </Button>
              <span className="text-ink/60 font-medium">
                {t('listings.pageOf', { page: filters.page, total: totalPages })}
              </span>
              <Button
                variant="outline"
                disabled={filters.page >= totalPages}
                onClick={() => updateFilter('page', filters.page + 1)}
                className="rounded-lg hover:bg-paper border-line"
              >
                {t('listings.next')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
