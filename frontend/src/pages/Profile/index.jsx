import React, { useEffect, useState } from 'react';
import { usersApi } from '../../api/auth.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Input } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Spinner from '../../components/common/Spinner.jsx';

export default function Profile() {
  const { updateStoredUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersApi
      .getMe()
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch((err) => setError(err.message));
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
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
      <h1 className="text-2xl font-700 mb-1">Your profile</h1>
      <p className="text-ink/60 text-sm font-body mb-6">
        Rating: {Number(profile.rating_avg || 0).toFixed(1)} ★ ({profile.rating_count || 0} reviews)
        {profile.is_verified && <span className="ml-2 text-juniper font-600">Verified</span>}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Input label="Email" value={form.email} disabled className="opacity-60" />
        <Input label="Phone" required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input label="City" required value={form.city} onChange={(e) => update('city', e.target.value)} />
        <Input
          label="Neighborhood"
          value={form.neighborhood || ''}
          onChange={(e) => update('neighborhood', e.target.value)}
        />

        {error && <p className="text-clay text-sm font-body">{error}</p>}
        {saved && <p className="text-juniper text-sm font-body">Saved.</p>}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}
