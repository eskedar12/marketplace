import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usersApi, ratingsApi } from '../../api/auth.api.js';
import Spinner from '../../components/common/Spinner.jsx';
import { timeAgo } from '../../utils/formatters.js';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([usersApi.getById(id), ratingsApi.getForUser(id)])
      .then(([userRes, ratingsRes]) => {
        setProfile(userRes.data);
        setRatings(ratingsRes.data.ratings || []);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p className="max-w-md mx-auto px-4 py-16 text-clay font-body">{error}</p>;
  if (!profile) return <Spinner className="max-w-md mx-auto px-4 py-16" />;

  const isSeller = profile.role === 'seller';

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-700">{profile.name}</h1>
      <p className="text-ink/60 text-sm font-body mt-1">
        {profile.city}
        {profile.is_verified && <span className="ml-2 text-juniper font-600">Verified</span>}
      </p>

      {isSeller && (
        <>
          <p className="text-sm font-body mt-2">
            {Number(profile.rating_avg || 0).toFixed(1)} ★ ({profile.rating_count || 0} reviews)
          </p>

          <h2 className="font-display font-600 text-sm uppercase tracking-wide text-ink/60 mt-8 mb-3">
            Reviews
          </h2>
          {ratings.length === 0 ? (
            <p className="text-ink/50 text-sm font-body">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {ratings.map((r) => (
                <div key={r.id} className="border border-line bg-white p-3">
                  <p className="text-sm font-mono font-600">{r.score} ★</p>
                  {r.comment && <p className="text-sm font-body text-ink/80 mt-1">{r.comment}</p>}
                  <p className="text-xs text-ink/40 font-body mt-1">{timeAgo(r.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
