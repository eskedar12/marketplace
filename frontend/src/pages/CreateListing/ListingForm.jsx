import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../api/listings.api.js';
import { CONDITIONS } from '../../utils/formatters.js';
import { Input, Textarea, Select } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';

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
      <Input
        label="Title"
        required
        maxLength={200}
        placeholder="e.g. iPhone 13 Pro, 128GB"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
      />
      <Textarea
        label="Description"
        required
        rows={4}
        maxLength={2000}
        placeholder="Condition details, why you're selling, anything a buyer should know"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (ETB)"
          type="number"
          required
          min="0"
          step="0.01"
          className="font-mono"
          value={form.price}
          onChange={(e) => update('price', e.target.value)}
        />
        <Select
          label="Condition"
          required
          value={form.condition}
          onChange={(e) => update('condition', e.target.value)}
          options={CONDITIONS}
        />
      </div>
      <Select
        label="Category"
        required
        value={form.category_id}
        onChange={(e) => update('category_id', e.target.value)}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City" required value={form.city} onChange={(e) => update('city', e.target.value)} />
        <Input
          label="Neighborhood"
          value={form.neighborhood}
          onChange={(e) => update('neighborhood', e.target.value)}
        />
      </div>

      {error && <p className="text-clay text-sm font-body">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
