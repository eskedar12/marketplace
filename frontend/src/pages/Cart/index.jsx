import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cart.api.js';
import { ordersApi } from '../../api/orders.api.js';
import { formatPrice } from '../../utils/formatters.js';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function Cart() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    cartApi
      .getMine()
      .then((res) => setItems(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function removeItem(listingId) {
    setRemovingId(listingId);
    try {
      await cartApi.remove(listingId);
      setItems((prev) => prev.filter((i) => i.listing_id !== listingId));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  const purchasable = items.filter((i) => i.status === 'active');
  const total = purchasable.reduce((sum, i) => sum + Number(i.price), 0);

  async function checkout() {
    if (purchasable.length === 0) return;
    setCheckingOut(true);
    setError('');
    try {
      const res = await ordersApi.checkout(purchasable.map((i) => i.listing_id));
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setCheckingOut(false);
    }
  }

  if (loading) return <Spinner className="max-w-2xl mx-auto px-4 py-16" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-display font-extrabold text-ink mb-6">{t('cart.title')}</h1>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-2xl">
          <p className="font-display font-bold text-lg text-ink">{t('cart.empty')}</p>
          <Link to="/" className="inline-block mt-4 text-sm font-display font-bold text-juniper hover:text-mustard">
            {t('common.browseListings')}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.cart_item_id}
                className="flex items-center gap-3 border border-line rounded-2xl p-3 bg-white"
              >
                <Link to={`/listings/${item.listing_id}`} className="w-16 h-16 rounded-xl overflow-hidden bg-paper flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/20 text-[10px] font-body uppercase">
                      {t('common.noPhoto')}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/listings/${item.listing_id}`} className="font-display font-600 text-sm text-ink hover:text-mustard truncate block">
                    {item.title}
                  </Link>
                  <p className="text-xs text-ink/50 font-body mt-0.5">{t('cart.soldBy', { name: item.seller_name })}</p>
                  {item.status !== 'active' ? (
                    <p className="text-xs text-clay font-body mt-0.5">{t('cart.noLongerAvailable')}</p>
                  ) : (
                    <p className="font-display font-bold text-sm text-mustard mt-0.5">{formatPrice(item.price)}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.listing_id)}
                  disabled={removingId === item.listing_id}
                  className="text-xs font-body text-ink/40 hover:text-clay flex-shrink-0"
                >
                  {t('cart.remove')}
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-line mt-6 pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-ink/60">
                {t('cart.total')} {purchasable.length < items.length && t('cart.availableCount', { available: purchasable.length, total: items.length })}
              </p>
              <p className="font-display font-bold text-xl text-ink">{formatPrice(total)}</p>
            </div>
            <Button variant="accent" onClick={checkout} disabled={checkingOut || purchasable.length === 0} className="rounded-xl px-6">
              {checkingOut ? t('cart.redirecting') : t('cart.checkout')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
