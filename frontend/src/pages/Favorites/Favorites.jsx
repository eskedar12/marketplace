import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesApi } from '../../api/listings.api.js';
import ListingCard from '../../components/listings/ListingCard.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function Favorites() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    favoritesApi
      .getMine()
      .then((res) => setListings(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-extrabold text-ink mb-6">{t('favorites.title')}</h1>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}

      {loading ? (
        <Spinner />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-2xl">
          <p className="font-display font-bold text-lg text-ink">{t('favorites.empty')}</p>
          <p className="text-ink/50 text-sm mt-1 font-body">
            {t('favorites.emptyHint')}
          </p>
          <Link to="/" className="inline-block mt-4 text-sm font-display font-bold text-juniper hover:text-mustard">
            {t('common.browseListings')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, is_favorited: true }} />
          ))}
        </div>
      )}
    </div>
  );
}
