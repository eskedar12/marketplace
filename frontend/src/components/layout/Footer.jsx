import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.js';
import { CATEGORY_VISUALS } from '../../utils/categoryIcons.jsx';

// Pulled from the same source of truth as the navbar's Categories
// dropdown, so the footer never lists a category slug that doesn't
// actually exist in the database (e.g. the old "Home Appliances" /
// household-appliances category, which was merged into Furniture &
// Home and no longer exists).
const CATEGORY_LINKS = CATEGORY_VISUALS.slice(0, 5).map((c) => ({
  name: c.name,
  slug: c.dbSlug,
}));

const HELP_LINKS = ['helpCenter', 'howToBuy', 'howToSell', 'paymentSafety', 'contactSupport'];
const SAFETY_LINKS = ['meetSafePlaces', 'checkBeforeBuy', 'avoidScams', 'reportFraud', 'safetyCenter'];
const ABOUT_LINKS = ['aboutUs', 'ourMission', 'termsOfUse', 'privacyPolicy'];

const SOCIALS = [
  {
    name: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0022 12z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M21.9 4.6L18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L18 6.1c.42-.37-.1-.58-.65-.2L6.5 12.9l-4.95-1.55c-1.08-.34-1.1-1.08.23-1.6l19.3-7.44c.9-.33 1.68.2 1.4 1.3z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 5.9c-.7.3-1.5.55-2.3.65a4 4 0 001.75-2.2 8 8 0 01-2.53.97 4 4 0 00-6.8 3.6A11.3 11.3 0 013.15 4.6a4 4 0 001.24 5.3c-.62-.02-1.2-.2-1.72-.47v.05a4 4 0 003.2 3.9 4 4 0 01-1.8.07 4 4 0 003.73 2.77A8 8 0 012 18.4a11.3 11.3 0 006.1 1.8c7.3 0 11.3-6.05 11.3-11.3v-.5A8 8 0 0022 5.9z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-ink mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center font-display font-extrabold text-xl tracking-tight">
              <span className="text-mustard">Re</span>
              <span className="text-white">Gebeya</span>
            </Link>
            <p className="text-sm font-body text-white/50 leading-relaxed mt-3 max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 mt-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-mustard text-white flex items-center justify-center transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2.5 text-sm font-body text-white/60">
              {CATEGORY_LINKS.map((c) => (
                <li key={c.slug}>
                  <Link to={`/category/${c.slug}`} className="hover:text-mustard transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/listings" className="text-mustard font-medium hover:text-mustard-dark transition-colors">
                  {t('footer.viewAllCategories')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-4">{t('footer.helpSupport')}</h4>
            <ul className="space-y-2.5 text-sm font-body text-white/60">
              {HELP_LINKS.map((key) => (
                <li key={key}>
                  <a href="#" className="hover:text-mustard transition-colors">{t(`footer.${key}`)}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Tips */}
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-4">{t('footer.safetyTips')}</h4>
            <ul className="space-y-2.5 text-sm font-body text-white/60">
              {SAFETY_LINKS.map((key) => (
                <li key={key}>
                  <a href="#" className="hover:text-mustard transition-colors">{t(`footer.${key}`)}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Contact */}
          <div>
            <h4 className="font-display font-bold text-sm text-white mb-4">{t('footer.about')}</h4>
            <ul className="space-y-2.5 text-sm font-body text-white/60 mb-6">
              {ABOUT_LINKS.map((key) => (
                <li key={key}>
                  <a href="#" className="hover:text-mustard transition-colors">{t(`footer.${key}`)}</a>
                </li>
              ))}
            </ul>

            <h4 className="font-display font-bold text-sm text-white mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2.5 text-sm font-body text-white/60">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-mustard flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2l2 5-2 1a11 11 0 006 6l1-2 5 2v2a2 2 0 01-2 2A15 15 0 013 5z" />
                </svg>
                +251 91 123 4567
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-mustard flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
                </svg>
                hello@regebeya.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-mustard flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.66 16.66L13.4 20.9a2 2 0 01-2.83 0l-4.24-4.24a8 8 0 1111.31 0z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                {t('footer.address')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/40 font-body">
          &copy; {new Date().getFullYear()} {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
