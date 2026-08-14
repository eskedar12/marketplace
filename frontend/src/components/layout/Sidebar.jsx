import React from 'react';

// A generic layout shell for side content — used on the Home page to
// host <FilterBar />. Kept generic (not filter-specific) so it can
// wrap other side content later (e.g. a category tree) without
// renaming anything.
export default function Sidebar({ title, children, className = 'lg:w-64 shrink-0' }) {
  return (
    <aside className={className}>
      {title && <h2 className="font-display font-600 text-sm uppercase tracking-wide text-ink/60 mb-3">{title}</h2>}
      <div className="bg-white border border-line rounded-2xl p-4 space-y-4">{children}</div>
    </aside>
  );
}
