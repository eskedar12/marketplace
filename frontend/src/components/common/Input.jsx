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
  // Options can optionally carry a `group` field (e.g. a subcategory
  // tagged with its parent category's name) — when any option has one,
  // render real <optgroup> sections instead of a flat list, so a
  // 2-level category tree stays readable as a single <select>.
  const hasGroups = options.some((opt) => opt.group);
  const groups = hasGroups
    ? options.reduce((acc, opt) => {
        const key = opt.group || '';
        (acc[key] = acc[key] || []).push(opt);
        return acc;
      }, {})
    : null;

  return (
    <div>
      {label && <label className="block text-sm font-body text-ink/70 mb-1">{label}</label>}
      <select className={`${fieldClass} ${className}`} {...props}>
        <option value="">{placeholder}</option>
        {hasGroups
          ? Object.entries(groups).map(([group, opts]) =>
              group ? (
                <optgroup key={group} label={group}>
                  {opts.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                opts.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              )
            )
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
    </div>
  );
}