import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi, reportsApi } from '../../api/listings.api.js';
import { conversationsApi } from '../../api/conversations.api.js';
import { cartApi } from '../../api/cart.api.js';
import { ordersApi } from '../../api/orders.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { conditionLabel, formatPrice, timeAgo } from '../../utils/formatters.js';
import { cityLabel } from '../../utils/constants.js';
import Button from '../../components/common/Button.jsx';
import { Textarea } from '../../components/common/Input.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [inCart, setInCart] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [callingSeller, setCallingSeller] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    listingsApi
      .getOne(id)
      .then((res) => setListing(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  // Reflects whether this listing is already in the buyer's cart, so the
  // button shows the right state on load instead of always starting blank.
  useEffect(() => {
    if (!user) return;
    cartApi
      .getMine()
      .then((res) => setInCart(res.data.some((item) => item.listing_id === id)))
      .catch(() => {});
  }, [id, user]);

  async function toggleCart() {
    if (!user) return navigate('/login', { state: { from: `/listings/${id}` } });
    setUpdatingCart(true);
    try {
      if (inCart) {
        await cartApi.remove(id);
        setInCart(false);
      } else {
        await cartApi.add(id);
        setInCart(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingCart(false);
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    try {
      await reportsApi.create(id, reportReason);
      setReportSent(true);
      setShowReport(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function startConversation() {
    if (!user) return navigate('/login', { state: { from: `/listings/${id}` } });
    setContacting(true);
    try {
      const res = await conversationsApi.getOrCreate(id);
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setContacting(false);
    }
  }

  async function callSeller() {
    if (!user) return navigate('/login', { state: { from: `/listings/${id}` } });
    setCallingSeller(true);
    try {
      const res = await listingsApi.getSellerPhone(id);
      // Hand off straight to the device's dialer — the number is never
      // rendered on the page, only used for this one redirect.
      window.location.href = `tel:${res.data.phone}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setCallingSeller(false);
    }
  }

  async function buyNow() {
    if (!user) return navigate('/login', { state: { from: `/listings/${id}` } });
    setBuyingNow(true);
    setError('');
    try {
      const res = await ordersApi.checkout([id]);
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      setError(err.message);
      setBuyingNow(false);
    }
  }

  if (error && !listing) {
    return <p className="max-w-3xl mx-auto px-4 py-16 text-clay font-body">{error}</p>;
  }
  if (!listing) {
    return <Spinner className="max-w-3xl mx-auto px-4 py-16" />;
  }

  const images = listing.images?.length ? listing.images : [];
  const isOwnListing = user?.id === listing.seller_id;
  const isSold = listing.status !== 'active';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <div className="aspect-[4/3] bg-paper border border-line rounded-2xl overflow-hidden">
          {images.length ? (
            <img src={images[activeImage]?.image_url} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 font-body text-xs uppercase tracking-widest">
              {t('common.noPhoto')}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${i === activeImage ? 'border-mustard' : 'border-line'}`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2 space-y-5">
        <div>
          <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
            {conditionLabel(listing.condition, t)}
          </span>
          <h1 className="text-2xl font-700 mt-2 leading-snug font-display text-ink">{listing.title}</h1>
          <p className="font-display font-bold text-2xl text-mustard mt-2">{formatPrice(listing.price)}</p>
          <p className="text-sm text-ink/50 font-body mt-1">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
            {cityLabel(listing.city, t)} · {t('listingDetail.postedTimeAgo', { time: timeAgo(listing.created_at, t) })}
          </p>
        </div>

        <p className="text-sm font-body text-ink/80 whitespace-pre-line">{listing.description}</p>

        {!isOwnListing && (
          <div className="border border-line rounded-2xl p-4 space-y-3 bg-white">
            <p className="font-display font-600 text-sm">{t('listingDetail.contactSeller')}</p>
            <div className="flex flex-wrap gap-2">
              {listing.seller_allows_calls && (
                <Button
                  onClick={callSeller}
                  disabled={callingSeller || isSold}
                  className="flex-1 text-center rounded-xl whitespace-nowrap"
                >
                  📞 {callingSeller ? t('listingDetail.calling') : t('listingDetail.call')}
                </Button>
              )}
              <Button
                variant="accent"
                onClick={startConversation}
                disabled={contacting}
                className="flex-1 text-center rounded-xl whitespace-nowrap"
              >
                💬 {contacting ? t('listingDetail.opening') : t('listingDetail.message')}
              </Button>
              <Button
                variant="outline"
                onClick={toggleCart}
                disabled={updatingCart || isSold}
                className="flex-1 text-center rounded-xl whitespace-nowrap"
              >
                🛒 {inCart ? t('listingDetail.inCart') : t('listingDetail.addToCart')}
              </Button>
            </div>

            <Button
              onClick={buyNow}
              disabled={buyingNow || isSold}
              className="w-full text-center rounded-xl bg-juniper text-white hover:bg-juniper-dark py-3 text-base"
            >
              {isSold
                ? t('listingDetail.sold')
                : `🛒 ${buyingNow ? t('listingDetail.redirecting') : t('listingDetail.buyNow', { price: formatPrice(listing.price) })}`}
            </Button>
          </div>
        )}

        {isOwnListing && (
          <Button as={Link} to={`/listings/${listing.id}/edit`} variant="outline" className="rounded-xl">
            {t('listingDetail.editListing')}
          </Button>
        )}

        <div>
          {reportSent ? (
            <p className="text-sm text-ink/50 font-body">{t('listingDetail.reportSent')}</p>
          ) : showReport ? (
            <form onSubmit={submitReport} className="space-y-2">
              <Textarea
                required
                rows={2}
                placeholder={t('listingDetail.reportPlaceholder')}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" variant="danger">
                  {t('listingDetail.submitReport')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReport(false)}>
                  {t('listingDetail.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            !isOwnListing && (
              <button
                onClick={() => (user ? setShowReport(true) : navigate('/login'))}
                className="text-xs font-body text-ink/40 hover:text-clay underline"
              >
                {t('listingDetail.reportListing')}
              </button>
            )
          )}
        </div>

        {error && <p className="text-clay text-sm font-body">{error}</p>}
      </div>
    </div>
  );
}
