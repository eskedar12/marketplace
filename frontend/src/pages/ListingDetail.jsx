import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsApi, favoritesApi, reportsApi, conversationsApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { conditionLabel, formatPrice, timeAgo } from '../utils/format.js';

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
    return <p className="max-w-3xl mx-auto px-4 py-16 text-ink/50 font-body">Loading…</p>;
  }

  const images = listing.images?.length ? listing.images : [];
  const isOwnListing = user?.id === listing.seller_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
      {/* Images */}
      <div className="md:col-span-3">
        <div className="aspect-[4/3] bg-line/40 border border-line overflow-hidden">
          {images.length ? (
            <img
              src={images[activeImage]?.image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 font-mono text-xs uppercase tracking-widest">
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
                className={`w-16 h-16 border ${i === activeImage ? 'border-juniper' : 'border-line'} overflow-hidden`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="md:col-span-2 space-y-5">
        <div>
          <span className="condition-stamp text-ink/70">{conditionLabel(listing.condition)}</span>
          <h1 className="text-2xl font-700 mt-2 leading-snug">{listing.title}</h1>
          <p className="font-mono font-600 text-2xl text-juniper-dark mt-2">
            {formatPrice(listing.price)}
          </p>
          <p className="text-sm text-ink/50 font-body mt-1">
            {listing.neighborhood ? `${listing.neighborhood}, ` : ''}
            {listing.city} · Posted {timeAgo(listing.created_at)}
          </p>
        </div>

        <p className="text-sm font-body text-ink/80 whitespace-pre-line">{listing.description}</p>

        {!isOwnListing && (
          <div className="border border-line p-4 space-y-3 bg-white">
            <p className="font-display font-600 text-sm">Contact the seller</p>
            <div className="flex flex-wrap gap-2">
              {listing.seller_phone && (
                <a
                  href={`tel:${listing.seller_phone}`}
                  className="flex-1 text-center px-4 py-2 bg-juniper text-paper text-sm font-display font-600 hover:bg-juniper-dark transition-colors"
                >
                  Call
                </a>
              )}
              {listing.seller_telegram && (
                <a
                  href={`https://t.me/${listing.seller_telegram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center px-4 py-2 border border-juniper text-juniper text-sm font-display font-600 hover:bg-juniper hover:text-paper transition-colors"
                >
                  Telegram
                </a>
              )}
              <button
                onClick={startConversation}
                disabled={contacting}
                className="flex-1 text-center px-4 py-2 bg-mustard text-ink text-sm font-display font-600 hover:bg-mustard-dark transition-colors disabled:opacity-60"
              >
                {contacting ? 'Opening…' : 'Message on Zego'}
              </button>
            </div>
            <button
              onClick={toggleFavorite}
              className="text-sm font-body text-ink/60 hover:text-juniper"
            >
              {favorited ? '★ Saved' : '☆ Save for later'}
            </button>
          </div>
        )}

        {isOwnListing && (
          <Link
            to={`/listings/${listing.id}/edit`}
            className="inline-block px-4 py-2 border border-ink text-sm font-display font-600 hover:bg-ink hover:text-paper transition-colors"
          >
            Edit this listing
          </Link>
        )}

        <div>
          {reportSent ? (
            <p className="text-sm text-ink/50 font-body">Thanks — this listing has been flagged for review.</p>
          ) : showReport ? (
            <form onSubmit={submitReport} className="space-y-2">
              <textarea
                required
                placeholder="Why are you reporting this listing?"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-clay"
                rows={2}
              />
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1.5 bg-clay text-paper text-sm font-display font-600">
                  Submit report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className="px-3 py-1.5 text-sm font-body text-ink/50"
                >
                  Cancel
                </button>
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
