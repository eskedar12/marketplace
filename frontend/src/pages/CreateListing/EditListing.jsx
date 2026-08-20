import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsApi } from '../../api/listings.api.js';
import ListingForm from '../CreateListing/ListingForm.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    listingsApi
      .getOne(id)
      .then((res) => setListing(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit(data) {
    await listingsApi.update(id, data);
    navigate(`/listings/${id}`);
  }

  async function handleRemove() {
    if (!confirm(t('createListing.removeConfirm'))) return;
    await listingsApi.remove(id);
    navigate('/my-listings');
  }

  if (error) return <p className="max-w-3xl mx-auto px-4 py-16 text-clay font-body">{error}</p>;
  if (!listing) return <Spinner className="max-w-3xl mx-auto px-4 py-16" />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-700 mb-6">{t('createListing.edit')}</h1>
      <ListingForm initial={listing} onSubmit={handleSubmit} submitLabel={t('createListing.saveChanges')} />
      <Button variant="ghost" onClick={handleRemove} className="mt-6 !px-0 text-clay underline">
        {t('createListing.removeListing')}
      </Button>
    </div>
  );
}
