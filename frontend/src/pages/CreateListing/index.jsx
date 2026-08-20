import React from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsApi } from '../../api/listings.api.js';
import ListingForm from './ListingForm.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function CreateListing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  async function handleSubmit(data) {
    const res = await listingsApi.create(data);
    navigate(`/listings/${res.data.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-700 mb-1">{t('createListing.title')}</h1>
      <p className="text-ink/60 text-sm font-body mb-6">
        {t('createListing.subtitle')}
      </p>
      <ListingForm onSubmit={handleSubmit} submitLabel={t('createListing.publish')} />
    </div>
  );
}
