import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { usersApi } from '../../api/auth.api.js';
import { Input, Select } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CITIES } from '../../utils/constants.js';

const EMPTY = { name: '', email: '', password: '', phone: '', city: '', neighborhood: '', role: 'buyer' };

export default function Register() {
  const { register, updateStoredUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const cityOptions = CITIES.map((city) => ({ value: city.value, label: t(`cities.${city.key}`) }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleAvatarPicked(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      // Profile photo is optional and uploaded separately from the
      // Cloudinary-backed avatar endpoint — if it fails, the account
      // still exists and the user can just add a photo later from
      // their profile, so we don't block navigation on it.
      if (avatarFile) {
        try {
          const res = await usersApi.uploadAvatar(avatarFile);
          updateStoredUser(res.data);
        } catch {
          // Non-fatal — registration already succeeded.
        }
      }
      navigate('/');
    } catch (err) {
      setError(err.details ? err.details.map((d) => typeof d === 'string' ? d : d.message).join(', ') : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-700 mb-6">{t('auth.createAccount')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('auth.fullName')} required value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Input
          label={t('auth.email')}
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <Input
          label={t('auth.password')}
          type="password"
          required
          hint={t('auth.passwordHint')}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
        />
        <Input
          label={t('auth.phone')}
          required
          type="tel"
          inputMode="tel"
          placeholder="+2519…"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value.replace(/[^0-9+\s-]/g, ''))}
        />
        <Select
          label={t('auth.city')}
          required
          placeholder={t('common.select')}
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          options={cityOptions}
        />
        <Input
          label={t('auth.neighborhoodOptional')}
          value={form.neighborhood}
          onChange={(e) => update('neighborhood', e.target.value)}
        />

        <div>
          <label className="block text-sm font-body font-medium text-ink mb-1.5">{t('auth.profilePhotoOptional')}</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-line flex-shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/30 font-display font-bold text-xl">
                  {form.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <label className="text-sm font-display font-bold text-mustard hover:text-mustard-dark cursor-pointer">
              {avatarPreview ? t('profile.changePhoto') : t('auth.addPhoto')}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarPicked}
              />
            </label>
            {avatarPreview && (
              <button
                type="button"
                onClick={removeAvatar}
                className="text-sm font-body text-ink/50 hover:text-clay"
              >
                {t('auth.removePhoto')}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-body font-medium text-ink mb-1.5">{t('auth.iWantTo')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update('role', 'buyer')}
              className={`px-4 py-2.5 rounded-xl border text-sm font-display font-bold transition-colors ${
                form.role === 'buyer'
                  ? 'border-juniper bg-juniper/10 text-juniper'
                  : 'border-line text-ink/60 hover:border-ink/30'
              }`}
            >
              {t('auth.buyItems')}
            </button>
            <button
              type="button"
              onClick={() => update('role', 'seller')}
              className={`px-4 py-2.5 rounded-xl border text-sm font-display font-bold transition-colors ${
                form.role === 'seller'
                  ? 'border-juniper bg-juniper/10 text-juniper'
                  : 'border-line text-ink/60 hover:border-ink/30'
              }`}
            >
              {t('auth.sellItems')}
            </button>
          </div>
        </div>

        {error && <p className="text-clay text-sm">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.creatingAccount') : t('auth.signUp')}
        </Button>
      </form>
      <p className="text-sm text-ink/60 mt-4 font-body">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link to="/login" className="text-juniper font-600">
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}