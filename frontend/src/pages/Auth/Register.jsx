import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Input } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

const EMPTY = { name: '', email: '', password: '', phone: '', city: '', neighborhood: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
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
      <h1 className="text-2xl font-700 mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" required value={form.name} onChange={(e) => update('name', e.target.value)} />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          hint="At least 8 characters"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
        />
        <Input
          label="Phone"
          required
          placeholder="+2519…"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <Input label="City" required value={form.city} onChange={(e) => update('city', e.target.value)} />
        <Input
          label="Neighborhood (optional)"
          value={form.neighborhood}
          onChange={(e) => update('neighborhood', e.target.value)}
        />
        {error && <p className="text-clay text-sm">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className="text-sm text-ink/60 mt-4 font-body">
        Already have an account?{' '}
        <Link to="/login" className="text-juniper font-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
