import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real terms.
export default function TermsOfUse() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.termsOfUse')}
      intro={t('termsOfUsePage.lastUpdated')}
    >
      <InfoSection title={t('termsOfUsePage.section1Title')}>
        {t('termsOfUsePage.section1Body')}
      </InfoSection>

      <InfoSection title={t('termsOfUsePage.section2Title')}>
        {t('termsOfUsePage.section2Body')}
      </InfoSection>

      <InfoSection title={t('termsOfUsePage.section3Title')}>
        {t('termsOfUsePage.section3Body')}
      </InfoSection>

      <InfoSection title={t('termsOfUsePage.section4Title')}>
        {t('termsOfUsePage.section4Body')}
      </InfoSection>

      <InfoSection title={t('termsOfUsePage.section5Title')}>
        {t('termsOfUsePage.section5Body')}
      </InfoSection>

      <InfoSection title={t('termsOfUsePage.section6Title')}>
        {t('termsOfUsePage.section6Body')}
      </InfoSection>
    </InfoPage>
  );
}
