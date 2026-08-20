import React from 'react';
import { Link } from 'react-router-dom';
import InfoPage from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
const TOPICS = [
  {
    to: '/help/how-to-buy',
    titleKey: 'howToBuy',
    body: 'Browsing listings, messaging sellers, and arranging a safe pickup.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" />
      </svg>
    ),
  },
  {
    to: '/help/how-to-sell',
    titleKey: 'howToSell',
    body: 'Creating a listing, adding photos, pricing your item, and closing a sale.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    to: '/help/payment-safety',
    titleKey: 'paymentSafety',
    body: 'Accepted payment methods and how to keep your money and info safe.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
      </svg>
    ),
  },
  {
    to: '/help/contact',
    titleKey: 'contactSupport',
    body: "Can't find what you're looking for? Get in touch with our team.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
      </svg>
    ),
  },
];

export default function HelpCenter() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.helpCenter')}
      intro="Find answers to common questions about buying, selling, payments, and staying safe on ReGebeya." // TODO: replace with real intro copy
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {TOPICS.map((topic) => (
          <Link
            key={topic.to}
            to={topic.to}
            className="flex items-start gap-3 p-4 rounded-2xl border border-line hover:border-mustard hover:shadow-sm transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-mustard/15 text-mustard flex items-center justify-center flex-shrink-0">
              {topic.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-sm mb-0.5">{t(`footer.${topic.titleKey}`)}</h3>
              <p className="text-xs font-body text-ink/60 leading-relaxed">{topic.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </InfoPage>
  );
}
