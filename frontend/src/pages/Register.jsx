import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
        <Field label="Full name" value={form.name} onChange={(v) => update('name', v)} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => update('password', v)}
          hint="At least 8 characters"
        />
        <Field label="Phone" value={form.phone} onChange={(v) => update('phone', v)} placeholder="+2519…" />
        <Field label="City" value={form.city} onChange={(v) => update('city', v)} />
        <Field
          label="Neighborhood (optional)"
          value={form.neighborhood}
          onChange={(v) => update('neighborhood', v)}
          required={false}
        />
        {error && <p className="text-clay text-sm">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-juniper text-paper font-display font-600 text-sm px-4 py-2.5 hover:bg-juniper-dark transition-colors disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
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

function Field({ label, value, onChange, type = 'text', hint, placeholder, required = true }) {
  return (
    <div>
      <label className="block text-sm font-body text-ink/70 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
      />
      {hint && <p className="text-xs text-ink/40 mt-1">{hint}</p>}
    </div>
  );
}
