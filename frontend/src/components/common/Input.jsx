import React from 'react';

const fieldClass =
  'w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mustard focus:ring-1 focus:ring-mustard/30 bg-white transition-colors';

export function Input({ label, hint, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-body text-ink/70 mb-1">{label}</label>}
      <input className={`${fieldClass} ${className}`} {...props} />
      {hint && !error && <p className="text-xs text-ink/40 mt-1">{hint}</p>}
      {error && <p className="text-xs text-clay mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-body text-ink/70 mb-1">{label}</label>}
      <textarea className={`${fieldClass} ${className}`} {...props} />
      {hint && !error && <p className="text-xs text-ink/40 mt-1">{hint}</p>}
      {error && <p className="text-xs text-clay mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, options, placeholder = 'Select…', className = '', ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-body text-ink/70 mb-1">{label}</label>}
      <select className={`${fieldClass} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
