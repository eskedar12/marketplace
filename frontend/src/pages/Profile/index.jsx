import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usersApi, faydaApi } from '../../api/auth.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Input, Select } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CITIES } from '../../utils/constants.js';

export default function Profile() {
  const { updateStoredUser } = useAuth();
  const { t } = useLanguage();
  const cityOptions = CITIES.map((city) => ({ value: city.value, label: t(`cities.${city.key}`) }));
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [connectingFayda, setConnectingFayda] = useState(false);
  // 'success' | 'error' | 'cancelled' — read from the URL once below,
  // then kept here so the banner survives after ?fayda= is stripped
  // from the URL (otherwise it'd vanish the instant we clean the URL up).
  const [faydaBanner, setFaydaBanner] = useState(null);

  useEffect(() => {
    usersApi
      .getMe()
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Landed back from a Fayda attempt (mock or real) — refetch so the
  // verified badge shows up immediately, then drop ?fayda= from the URL
  // so refreshing the page doesn't re-show the banner.
  useEffect(() => {
    const status = searchParams.get('fayda');
    if (!status) return;
    setFaydaBanner(status);
    if (status === 'success') {
      usersApi
        .getMe()
        .then((res) => {
          setProfile(res.data);
          setForm(res.data);
          updateStoredUser(res.data);
        })
        .catch((err) => setError(err.message));
    }
    const next = new URLSearchParams(searchParams);
    next.delete('fayda');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerifyWithFayda() {
    setConnectingFayda(true);
    setError('');
    try {
      const res = await faydaApi.connect();
      window.location.href = res.data.authorizeUrl; // full navigation — must leave the SPA
    } catch (err) {
      setError(err.message);
      setConnectingFayda(false);
    }
  }

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleAvatarPicked(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    try {
      const res = await usersApi.uploadAvatar(file);
      setProfile(res.data);
      setForm(res.data);
      updateStoredUser(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await usersApi.updateMe({
        name: form.name,
        phone: form.phone,
        city: form.city,
        neighborhood: form.neighborhood,
        allow_calls: form.allow_calls !== false,
      });
      setProfile(res.data);
      updateStoredUser(res.data);
      setSaved(true);
    } catch (err) {
      setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !profile) return <p className="max-w-md mx-auto px-4 py-16 text-clay font-body">{error}</p>;
  if (!form) return <Spinner className="max-w-md mx-auto px-4 py-16" />;

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-700 mb-1">{t('profile.yourProfile')}</h1>
      {profile.role === 'seller' && (
        <p className="text-ink/60 text-sm font-body mb-2">
          {t('profile.rating', { avg: Number(profile.rating_avg || 0).toFixed(1), count: profile.rating_count || 0 })}
          {profile.is_verified && <span className="ml-2 text-juniper font-600">{t('profile.verified')}</span>}
        </p>
      )}

      {profile.role === 'seller' && !profile.is_verified && (
        <div className="mb-6">
          <button
            type="button"
            onClick={handleVerifyWithFayda}
            disabled={connectingFayda}
            className="text-sm font-display font-bold text-juniper hover:text-mustard disabled:opacity-60"
          >
            {connectingFayda ? t('profile.faydaConnecting') : t('profile.verifyWithFayda')}
          </button>
        </div>
      )}

      {faydaBanner === 'success' && (
        <div className="mb-6 rounded-lg border border-juniper/30 bg-juniper/10 px-4 py-3 flex items-center gap-2">
          <span className="text-juniper text-lg leading-none">✓</span>
          <p className="text-juniper text-sm font-body font-600">{t('profile.faydaSuccess')}</p>
        </div>
      )}
      {faydaBanner === 'error' && (
        <div className="mb-6 rounded-lg border border-clay/30 bg-clay/10 px-4 py-3">
          <p className="text-clay text-sm font-body">{t('profile.faydaError')}</p>
        </div>
      )}
      {faydaBanner === 'cancelled' && (
        <div className="mb-6 rounded-lg border border-line bg-ink/5 px-4 py-3">
          <p className="text-ink/50 text-sm font-body">{t('profile.faydaCancelled')}</p>
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-line flex-shrink-0">
          {form.profile_image ? (
            <img src={form.profile_image} alt={t('profile.yourProfile')} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink/30 font-display font-bold text-2xl">
              {form.name?.[0]?.toUpperCase()}
            </div>
          )}
          {uploadingAvatar && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Spinner className="!p-0" />
            </div>
          )}
        </div>
        <label className="text-sm font-display font-bold text-mustard hover:text-mustard-dark cursor-pointer">
          {t('profile.changePhoto')}
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleAvatarPicked}
            disabled={uploadingAvatar}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('profile.fullName')} required value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Input label={t('profile.email')} value={form.email} disabled className="opacity-60" />
        <Input
          label={t('profile.phone')}
          required
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value.replace(/[^0-9+\s-]/g, ''))}
        />
        <Select
          label={t('profile.city')}
          required
          placeholder={t('common.select')}
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          options={cityOptions}
        />
        <Input
          label={t('profile.neighborhood')}
          value={form.neighborhood || ''}
          onChange={(e) => update('neighborhood', e.target.value)}
        />

        {profile.role === 'seller' && (
          <label className="flex items-start gap-2.5 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={form.allow_calls !== false}
              onChange={(e) => update('allow_calls', e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-mustard"
            />
            <span>
              <span className="block text-sm font-body text-ink/80">{t('profile.allowCalls')}</span>
              <span className="block text-xs text-ink/40 font-body">
                {t('profile.allowCallsHint')}
              </span>
            </span>
          </label>
        )}

        {error && <p className="text-clay text-sm font-body">{error}</p>}
        {saved && <p className="text-juniper text-sm font-body">{t('profile.saved')}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('profile.saveChanges')}
        </Button>
      </form>
    </div>
  );
}