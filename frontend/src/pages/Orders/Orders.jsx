import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api.js';
import { formatPrice, timeAgo } from '../../utils/formatters.js';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

const STATUS_STYLES = {
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-mustard/10 text-mustard-dark',
  failed: 'bg-clay/10 text-clay',
  cancelled: 'bg-line text-ink/50',
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersApi
      .getMine()
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-extrabold text-ink mb-6">{t('orders.title')}</h1>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}

      {loading ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-2xl">
          <p className="font-display font-bold text-lg text-ink">{t('orders.empty')}</p>
          <Link to="/" className="inline-block mt-4 text-sm font-display font-bold text-juniper hover:text-mustard">
            {t('common.browseListings')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center gap-3 border border-line rounded-2xl p-3 bg-white">
              <Link to={`/listings/${o.listing_id}`} className="w-14 h-14 rounded-xl overflow-hidden bg-paper flex-shrink-0">
                {o.image_url ? (
                  <img src={o.image_url} alt={o.listing_title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/20 text-[10px] font-body uppercase">
                    {t('common.noPhoto')}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/listings/${o.listing_id}`} className="font-display font-600 text-sm text-ink hover:text-mustard truncate block">
                  {o.listing_title}
                </Link>
                <p className="text-xs text-ink/50 font-body mt-0.5">
                  {t('orders.soldByDate', { name: o.seller_name, time: timeAgo(o.created_at, t) })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-display font-bold text-sm text-ink">{formatPrice(o.price)}</p>
                <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md mt-1 ${STATUS_STYLES[o.status] || ''}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
