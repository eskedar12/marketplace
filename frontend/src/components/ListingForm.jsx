import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../api/client.js';
import { CONDITIONS } from '../utils/format.js';

export default function ListingForm({ initial, onSubmit, submitLabel }) {
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ ...form, price: Number(form.price) });
    } catch (err) {
      setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-body text-ink/70 mb-1">Title</label>
        <input
          required
          maxLength={200}
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
          placeholder="e.g. iPhone 13 Pro, 128GB"
        />
      </div>

      <div>
        <label className="block text-sm font-body text-ink/70 mb-1">Description</label>
        <textarea
          required
          maxLength={2000}
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
          placeholder="Condition details, why you're selling, anything a buyer should know"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body text-ink/70 mb-1">Price (ETB)</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className="w-full border border-line px-3 py-2 text-sm font-mono focus:outline-none focus:border-juniper"
          />
        </div>
        <div>
          <label className="block text-sm font-body text-ink/70 mb-1">Condition</label>
          <select
            required
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
          >
            <option value="">Select…</option>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-body text-ink/70 mb-1">Category</label>
        <select
          required
          value={form.category_id}
          onChange={(e) => update('category_id', e.target.value)}
          className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
        >
          <option value="">Select…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body text-ink/70 mb-1">City</label>
          <input
            required
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
          />
        </div>
        <div>
          <label className="block text-sm font-body text-ink/70 mb-1">Neighborhood</label>
          <input
            value={form.neighborhood}
            onChange={(e) => update('neighborhood', e.target.value)}
            className="w-full border border-line px-3 py-2 text-sm focus:outline-none focus:border-juniper"
          />
        </div>
      </div>

      {error && <p className="text-clay text-sm font-body">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 bg-juniper text-paper font-display font-600 text-sm hover:bg-juniper-dark transition-colors disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
