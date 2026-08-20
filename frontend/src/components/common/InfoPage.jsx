import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.js';

// Shared shell for static content pages (Help Center, How to Buy, Safety
// Center, etc). Handles the breadcrumb + title so each page only has to
// supply its body. `crumbs` is a list of { label, to? } — the last one
// renders as plain text (current page).
export default function InfoPage({ crumbs = [], title, intro, children }) {
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-1.5 text-xs font-body text-ink/50 mb-4 flex-wrap">
        <Link to="/" className="hover:text-mustard transition-colors">{t('common.home')}</Link>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span>/</span>
            {c.to ? (
              <Link to={c.to} className="hover:text-mustard transition-colors">{c.label}</Link>
            ) : (
              <span className="text-ink/70">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink mb-3">{title}</h1>
      {intro && <p className="text-ink/60 font-body leading-relaxed mb-8">{intro}</p>}

      <div className="space-y-8">{children}</div>
    </div>
  );
}

// A titled block of body copy used inside an InfoPage.
export function InfoSection({ title, children }) {
  return (
    <section>
      {title && <h2 className="font-display font-bold text-lg text-ink mb-2">{title}</h2>}
      <div className="text-sm font-body text-ink/70 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

// Numbered step used on the How to Buy / How to Sell walkthroughs.
export function InfoStep({ number, title, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mustard/15 text-mustard font-display font-bold flex items-center justify-center">
        {number}
      </div>
      <div>
        <h3 className="font-display font-bold text-ink mb-1">{title}</h3>
        <p className="text-sm font-body text-ink/70 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
