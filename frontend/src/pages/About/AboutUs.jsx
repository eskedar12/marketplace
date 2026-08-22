import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function AboutUs() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.aboutUs')}
      intro={t('aboutUsPage.intro')}
    >
      <InfoSection title={t('aboutUsPage.whoTitle')}>
        {t('aboutUsPage.whoBody')}
      </InfoSection>

      <InfoSection title={t('aboutUsPage.whatTitle')}>
        {t('aboutUsPage.whatBody')}
      </InfoSection>

      <InfoSection title={t('aboutUsPage.whereTitle')}>
        {t('aboutUsPage.whereBody')}
      </InfoSection>
    </InfoPage>
  );
}
