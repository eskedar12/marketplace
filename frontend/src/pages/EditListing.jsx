import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsApi } from '../api/client.js';
import ListingForm from '../components/ListingForm.jsx';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listingsApi.getOne(id).then((res) => setListing(res.data)).catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit(data) {
    await listingsApi.update(id, data);
    navigate(`/listings/${id}`);
  }

  async function handleRemove() {
    if (!confirm('Remove this listing? Buyers will no longer be able to find it.')) return;
    await listingsApi.remove(id);
    navigate('/my-listings');
  }

  if (error) return <p className="max-w-3xl mx-auto px-4 py-16 text-clay font-body">{error}</p>;
  if (!listing) return <p className="max-w-3xl mx-auto px-4 py-16 text-ink/50 font-body">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-700 mb-6">Edit listing</h1>
      <ListingForm initial={listing} onSubmit={handleSubmit} submitLabel="Save changes" />
      <button
        onClick={handleRemove}
        className="mt-6 text-sm font-body text-clay underline"
      >
        Remove this listing
      </button>
    </div>
  );
}
