import React from 'react';
import { Link } from 'react-router-dom';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function SafetyCenter() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.safetyCenter')}
      intro="A few simple habits keep buying and selling on ReGebeya safe for everyone."
    >
      <InfoSection title={t('footer.meetSafePlaces')}>
        Meet in a public, well-lit place — a busy café, mall, or police station forecourt works
        well. Avoid meeting alone at night or inviting strangers to your home.
      </InfoSection>

      <InfoSection title={t('footer.checkBeforeBuy')}>
        Inspect the item in person before paying. Test electronics, check for damage, and make
        sure it matches the listing description and photos.
      </InfoSection>

      <InfoSection title={t('footer.avoidScams')}>
        <ul className="list-disc pl-5 space-y-1">
          <li>Be wary of prices that seem too good to be true.</li>
          <li>Never pay in advance for an item you haven't seen.</li>
          <li>Don't share personal, banking, or login details with a buyer or seller.</li>
        </ul>
      </InfoSection>

      <InfoSection title={t('footer.reportFraud')}>
        If you suspect a listing or user is fraudulent, report it directly from the listing or
        profile page, or{' '}
        <Link to="/help/contact" className="text-juniper font-medium hover:text-mustard">
          {t('footer.contactSupport')}
        </Link>{' '}
        and our team will look into it.
      </InfoSection>
    </InfoPage>
  );
}
