import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listingsApi } from '../api/client.js';
import { conditionLabel, formatPrice, timeAgo } from '../utils/format.js';

const STATUS_LABEL = { active: 'Active', sold: 'Sold', removed: 'Removed' };

export default function MyListings() {
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
        <h1 className="text-2xl font-700">My listings</h1>
        <Link
          to="/sell"
          className="px-4 py-2 bg-mustard text-ink font-display font-600 text-sm hover:bg-mustard-dark transition-colors"
        >
          Post an item
        </Link>
      </div>

      {error && <p className="text-clay text-sm font-body mb-4">{error}</p>}
      {loading ? (
        <p className="text-ink/50 font-body text-sm">Loading…</p>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line">
          <p className="font-display font-600 text-lg">Nothing posted yet</p>
          <p className="text-ink/50 text-sm mt-1 font-body">Your listings will show up here.</p>
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
                  {conditionLabel(l.condition)} · {STATUS_LABEL[l.status]} · Posted {timeAgo(l.created_at)}
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
