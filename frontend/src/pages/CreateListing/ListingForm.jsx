import React, { useEffect, useState } from 'react';
import { categoriesApi, listingsApi } from '../../api/listings.api.js';
import { CONDITIONS } from '../../utils/formatters.js';
import { Input, Textarea, Select } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CATEGORY_VISUALS } from '../../utils/categoryIcons.jsx';
import { CITIES } from '../../utils/constants.js';

// Categories come back from the API with their raw (English) `name`.
// Every other category list in the app (homepage grid, navbar) shows a
// translated label by matching the API category to a CATEGORY_VISUALS
// entry and using its i18nKey — this form just falls back to the raw
// name if no match is found, so it never breaks for a category the
// backend adds that isn't in CATEGORY_VISUALS yet.
function categoryLabel(apiCat, t) {
  const visual = CATEGORY_VISUALS.find(
    (v) =>
      v.dbSlug === apiCat.slug ||
      apiCat.name.toLowerCase().includes(v.dbSlug.split('-')[0]) ||
      v.name.toLowerCase() === apiCat.name.toLowerCase()
  );
  return visual ? t(`navbar.${visual.i18nKey}`) : apiCat.name;
}

const MIN_PHOTOS = 1;
const MAX_PHOTOS = 5;

export default function ListingForm({ initial, onSubmit, submitLabel }) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(
    initial || {
      title: '',
      description: '',
      price: '',
      category_id: '',
      condition: '',
      city: '',
      neighborhood: '',
    }
  );
  // photos: existing image URLs (when editing) mixed with newly-picked
  // File objects (when adding more) — kept in one ordered array so the
  // preview grid and the final upload both work off a single list.
  const [photos, setPhotos] = useState(
    (initial?.images || []).map((url) => ({ kind: 'existing', url }))
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const conditionOptions = CONDITIONS.map((c) => ({
    value: c.value,
    label:
      c.value === 'brand_new'
        ? t('listings.brandNew')
        : c.value === 'lightly_used'
        ? t('listings.lightlyUsed')
        : t('listings.used'),
  }));

  const cityOptions = CITIES.map((city) => ({ value: city.value, label: t(`cities.${city.key}`) }));

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFilesPicked(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-picking the same file after removing it
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const next = picked.slice(0, room).map((file) => ({
        kind: 'new',
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
  }

  function removePhoto(idx) {
    setPhotos((prev) => {
      const removed = prev[idx];
      if (removed.kind === 'new') URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (photos.length < MIN_PHOTOS) {
      setError(t('createListing.minPhotosError', { min: MIN_PHOTOS }));
      return;
    }

    setSubmitting(true);
    try {
      // Upload only the newly-picked files; existing URLs (when editing)
      // are already on Cloudinary and get reused as-is.
      const newFiles = photos.filter((p) => p.kind === 'new').map((p) => p.file);
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        setUploadingCount(newFiles.length);
        const res = await listingsApi.uploadImages(newFiles);
        uploadedUrls = res.data.urls;
        setUploadingCount(0);
      }

      // Re-assemble in the order the seller arranged them.
      let uploadedIdx = 0;
      const images = photos.map((p) => (p.kind === 'existing' ? p.url : uploadedUrls[uploadedIdx++]));

      await onSubmit({ ...form, price: Number(form.price), images });
    } catch (err) {
      setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message);
    } finally {
      setSubmitting(false);
      setUploadingCount(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-body font-medium text-ink mb-1.5">
          {t('createListing.photos')} <span className="text-ink/40 font-normal">{t('createListing.photosCount', { count: photos.length, max: MAX_PHOTOS, min: MIN_PHOTOS })}</span>
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {photos.map((p, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-line group">
              <img
                src={p.kind === 'existing' ? p.url : p.previewUrl}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-ink/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {t('createListing.cover')}
                </span>
              )}
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-clay text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={t('createListing.removePhoto')}
              >
                ×
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-line hover:border-mustard flex flex-col items-center justify-center gap-1 cursor-pointer text-ink/40 hover:text-mustard transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-xs font-body">{t('createListing.add')}</span>
              <input type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={handleFilesPicked} />
            </label>
          )}
        </div>

        <p className="text-xs text-ink/50 font-body">
          {t('createListing.photoTip')}
        </p>
      </div>

      <Input
        label={t('createListing.titleLabel')}
        required
        maxLength={200}
        placeholder={t('createListing.titlePlaceholder')}
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
      />
      <Textarea
        label={t('createListing.description')}
        required
        rows={4}
        maxLength={2000}
        placeholder={t('createListing.descriptionPlaceholder')}
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('createListing.price')}
          type="number"
          required
          min="0"
          step="0.01"
          className="font-mono"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
        />
        <Select
          label={t('createListing.condition')}
          required
          placeholder={t('common.select')}
          value={form.condition}
          onChange={(e) => update('condition', e.target.value)}
          options={conditionOptions}
        />
      </div>
      <Select
        label={t('createListing.category')}
        required
        placeholder={t('common.select')}
        value={form.category_id}
        onChange={(e) => update('category_id', e.target.value)}
        options={categories.map((c) => ({ value: c.id, label: categoryLabel(c, t) }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('createListing.city')}
          required
          placeholder={t('common.select')}
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          options={cityOptions}
        />
        <Input
          label={t('createListing.neighborhood')}
          value={form.neighborhood}
          onChange={(e) => update('neighborhood', e.target.value)}
        />
      </div>

      {error && <p className="text-clay text-sm font-body">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting
          ? uploadingCount > 0
            ? t('createListing.uploadingPhotos', { count: uploadingCount, plural: uploadingCount > 1 ? 's' : '' })
            : t('common.saving')
          : submitLabel}
      </Button>
    </form>
  );
}
