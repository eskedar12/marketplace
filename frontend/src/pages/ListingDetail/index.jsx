import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi, favoritesApi, reportsApi } from '../../api/listings.api.js';
import { conversationsApi } from '../../api/conversations.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { conditionLabel, formatPrice, timeAgo } from '../../utils/formatters.js';
import Button from '../../components/common/Button.jsx';
import { Textarea } from '../../components/common/Input.jsx';
import Spinner from '../../components/common/Spinner.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    listingsApi
      .getOne(id)
      .then((res) => setListing(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  async function toggleFavorite() {
    if (!user) return navigate('/login', { state: { from: `/listings/${id}` } });
    try {
      if (favorited) {
        await favoritesApi.remove(id);
        setFavorited(false);
      } else {
        await favoritesApi.add(id);
        setFavorited(true);
      }
    } catch (err) {
      setError(err.message);
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

  if (error && !listing) {
    return <p className="max-w-3xl mx-auto px-4 py-16 text-clay font-body">{error}</p>;
  }
  if (!listing) {
    return <Spinner className="max-w-3xl mx-auto px-4 py-16" />;
  }

  const images = listing.images?.length ? listing.images : [];
  const isOwnListing = user?.id === listing.seller_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <div className="aspect-[4/3] bg-paper border border-line rounded-2xl overflow-hidden">
          {images.length ? (
            <img src={images[activeImage]?.image_url} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 font-body text-xs uppercase tracking-widest">
              No photo
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
            {conditionLabel(listing.condition)}
          </span>
          <h1 className="text-2xl font-700 mt-2 leading-snug font-display text-ink">{listing.title}</h1>
          <p className="font-display font-bold text-2xl text-mustard mt-2">{formatPrice(listing.price)}</p>
          <p className="text-sm text-ink/50 font-body mt-1">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
            {listing.city} · Posted {timeAgo(listing.created_at)}
          </p>
        </div>

        <p className="text-sm font-body text-ink/80 whitespace-pre-line">{listing.description}</p>

        {!isOwnListing && (
          <div className="border border-line rounded-2xl p-4 space-y-3 bg-white">
            <p className="font-display font-600 text-sm">Contact the seller</p>
            <div className="flex flex-wrap gap-2">
              {listing.seller_phone && (
                <Button as="a" href={`tel:${listing.seller_phone}`} className="flex-1 text-center rounded-xl">
                  Call
                </Button>
              )}
              {listing.seller_telegram && (
                <Button
                  as="a"
                  href={`https://t.me/${listing.seller_telegram}`}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  className="flex-1 text-center rounded-xl"
                >
                  Telegram
                </Button>
              )}
              <Button
                variant="accent"
                onClick={startConversation}
                disabled={contacting}
                className="flex-1 text-center rounded-xl"
              >
                {contacting ? 'Opening…' : 'Message on ReGebeya'}
              </Button>
            </div>
            <button onClick={toggleFavorite} className="flex items-center gap-1.5 text-sm font-body text-ink/60 hover:text-mustard transition-colors">
              <svg
                className={`w-4 h-4 ${favorited ? 'text-clay' : 'text-ink/40'}`}
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.5s-7-4.35-9.5-8.5C.9 8.5 2.5 5 6 5c2 0 3.3 1.1 4 2.1C10.7 6.1 12 5 14 5c3.5 0 5.1 3.5 3.5 7-2.5 4.15-9.5 8.5-9.5 8.5z"
                />
              </svg>
              {favorited ? 'Saved' : 'Save for later'}
            </button>
          </div>
        )}

        {isOwnListing && (
          <Button as={Link} to={`/listings/${listing.id}/edit`} variant="outline" className="rounded-xl">
            Edit this listing
          </Button>
        )}

        <div>
          {reportSent ? (
            <p className="text-sm text-ink/50 font-body">Thanks — this listing has been flagged for review.</p>
          ) : showReport ? (
            <form onSubmit={submitReport} className="space-y-2">
              <Textarea
                required
                rows={2}
                placeholder="Why are you reporting this listing?"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" variant="danger">
                  Submit report
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowReport(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            !isOwnListing && (
              <button
                onClick={() => (user ? setShowReport(true) : navigate('/login'))}
                className="text-xs font-body text-ink/40 hover:text-clay underline"
              >
                Report this listing
              </button>
            )
          )}
        </div>

        {error && <p className="text-clay text-sm font-body">{error}</p>}
      </div>
    </div>
  );
}
