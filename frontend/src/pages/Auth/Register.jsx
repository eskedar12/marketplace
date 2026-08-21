import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Input, Select } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CITIES } from '../../utils/constants.js';

const EMPTY = { name: '', email: '', password: '', phone: '', city: '', neighborhood: '', role: 'buyer' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY);
  const cityOptions = CITIES.map((city) => ({ value: city.value, label: t(`cities.${city.key}`) }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
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
          placeholder="+2519…"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
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
