import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingsApi } from '../../api/listings.api.js';
import { conditionLabel, formatPrice, timeAgo } from '../../utils/formatters.js';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function MyListings() {
  const { t } = useLanguage();
  const STATUS_LABEL = { active: t('myListings.statusActive'), sold: t('myListings.statusSold'), removed: t('myListings.statusRemoved') };
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listingsApi
      .getMine()
      .then((res) => setListings(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-700">{t('myListings.title')}</h1>
        <Button as={Link} to="/sell" variant="accent">
          {t('myListings.postAnItem')}
        </Button>
      </div>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}
      {loading ? (
        <Spinner />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line">
          <p className="font-display font-600 text-lg">{t('myListings.nothingPosted')}</p>
          <p className="text-ink/50 text-sm mt-1 font-body">{t('myListings.nothingPostedHint')}</p>
        </div>
      ) : (
        <div className="divide-y divide-line border-t border-b border-line">
          {listings.map((l) => (
            <Link
              key={l.id}
              to={`/listings/${l.id}`}
              className="flex items-center justify-between py-4 hover:bg-white transition-colors px-2"
            >
              <div>
                <p className="font-display font-600 text-sm">{l.title}</p>
                <p className="text-xs text-ink/50 font-body mt-0.5">
                  {conditionLabel(l.condition, t)} · {STATUS_LABEL[l.status]} · {t('myListings.postedTimeAgo', { time: timeAgo(l.created_at, t) })}
                </p>
              </div>
              <p className="font-mono font-600 text-sm text-juniper-dark">{formatPrice(l.price)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
