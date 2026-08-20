import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../../api/orders.api.js';
import { formatPrice } from '../../utils/formatters.js';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function OrderComplete() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!txRef) {
      setError(t('orders.complete.missingRef'));
      return;
    }
    ordersApi
      .verify(txRef)
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message));
  }, [txRef]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-clay font-body">{error}</p>
        <Link to="/" className="inline-block mt-4 text-sm font-display font-bold text-juniper hover:text-mustard">
          {t('common.backToHome')}
        </Link>
      </div>
    );
  }

  if (!orders) return <Spinner className="max-w-md mx-auto px-4 py-16" />;

  const paid = orders.every((o) => o.status === 'paid');
  const total = orders.reduce((sum, o) => sum + Number(o.price), 0);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
      {paid ? (
        <>
          <div className="w-14 h-14 rounded-full bg-juniper/10 text-juniper flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h1 className="text-xl font-display font-extrabold text-ink">{t('orders.complete.success')}</h1>
          <p className="text-ink/60 font-body text-sm mt-1">{t('orders.complete.paidAmount', { amount: formatPrice(total) })}</p>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-full bg-clay/10 text-clay flex items-center justify-center mx-auto mb-4 text-2xl">
            ✕
          </div>
          <h1 className="text-xl font-display font-extrabold text-ink">{t('orders.complete.failedTitle')}</h1>
          <p className="text-ink/60 font-body text-sm mt-1">{t('orders.complete.failedHint')}</p>
        </>
      )}

      <div className="mt-6 space-y-2 text-left">
        {orders.map((o) => (
          <div key={o.id} className="border border-line rounded-xl p-3 bg-white flex items-center justify-between">
            <span className="font-body text-sm text-ink">{o.listing_title}</span>
            <span className="font-display font-600 text-sm text-ink/70">{formatPrice(o.price)}</span>
          </div>
        ))}
      </div>

      <Link to="/orders" className="inline-block mt-6 text-sm font-display font-bold text-juniper hover:text-mustard">
        {t('orders.complete.viewOrders')}
      </Link>
    </div>
  );
}
