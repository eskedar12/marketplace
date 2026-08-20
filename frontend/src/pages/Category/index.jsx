import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useListings } from '../../hooks/useListings.js';
import { categoriesApi } from '../../api/listings.api.js';
import Sidebar from '../../components/layout/Sidebar.jsx';
import FilterBar from '../../components/listings/FilterBar.jsx';
import ListingGrid from '../../components/listings/ListingGrid.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// Dedicated browse page for a single category, linked from the
// CategoryNav dropdown (and reachable directly at /category/:slug).
// Works for both a parent slug ("electronics") and a subcategory
// slug ("phones") — the backend resolves either one and tells us
// which category_id(s) to pull listings for.
export default function CategoryPage() {
  const { slug } = useParams();
  const { filters, updateFilter, items, total, loading, error } = useListings();
  const { t } = useLanguage();

  const [category, setCategory] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setCategoryLoading(true);
    setNotFound(false);
    setCategory(null);

    categoriesApi
      .getBySlug(slug)
      .then((res) => {
        const data = res.data;
        setCategory(data);
        // Default to showing this category's listings plus its
        // subcategories' listings (categoryIds already includes both).
        updateFilter('category_id', data.categoryIds.join(','));
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setCategoryLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  if (categoryLoading) {
    return <Spinner label={t('listings.loadingListings')} className="py-24 justify-center" />;
  }

  if (notFound || !category) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-700 text-2xl">{t('category.notFound')}</h1>
        <p className="text-ink/50 font-body mt-2">{t('category.notFoundHint')}</p>
        <Link to="/" className="inline-block mt-6 text-mustard font-body font-semibold hover:underline">
          {t('category.backToHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-body text-ink/50 mb-3">
        <Link to="/" className="hover:text-mustard transition-colors">{t('common.home')}</Link>
        <span>/</span>
        {category.parent && (
          <>
            <Link to={`/category/${category.parent.slug}`} className="hover:text-mustard transition-colors">
              {category.parent.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink/80 font-medium">{category.name}</span>
      </nav>

      <h1 className="font-display font-extrabold text-2xl md:text-3xl text-ink">{category.name}</h1>
      <p className="text-xs font-body text-ink/50 mt-1">{t('category.showingListings', { total })}</p>

      {/* Subcategory pill filters — only shown on a parent category page */}
      {category.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => updateFilter('category_id', category.categoryIds.join(','))}
            className={`px-4 py-1.5 rounded-full text-xs font-display font-bold transition-colors ${
              filters.category_id === category.categoryIds.join(',')
                ? 'bg-mustard text-white'
                : 'bg-white border border-line text-ink/70 hover:border-mustard/50'
            }`}
          >
            {t('category.all', { name: category.name })}
          </button>
          {category.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => updateFilter('category_id', sub.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-display font-bold transition-colors ${
                filters.category_id === sub.id
                  ? 'bg-mustard text-white'
                  : 'bg-white border border-line text-ink/70 hover:border-mustard/50'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mt-8">
        <Sidebar title={t('listings.filters')} className="w-full lg:w-64 flex-shrink-0">
          <FilterBar filters={filters} onChange={updateFilter} />
        </Sidebar>

        <div className="flex-1">
          {error && <p className="text-clay text-sm mb-4 font-body">{error}</p>}

          <ListingGrid
            listings={items}
            loading={loading}
            emptyTitle={t('category.noListingsYet', { name: category.name })}
            emptyHint={t('category.checkBackSoon')}
          />

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12 font-body text-sm">
              <Button
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() => updateFilter('page', filters.page - 1)}
                className="rounded-lg hover:bg-slate-50 border-slate-200"
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
                className="rounded-lg hover:bg-slate-50 border-slate-200"
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
