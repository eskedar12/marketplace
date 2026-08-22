import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with a real privacy policy.
export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.privacyPolicy')}
      intro={t('privacyPolicyPage.lastUpdated')}
    >
      <InfoSection title={t('privacyPolicyPage.section1Title')}>
        {t('privacyPolicyPage.section1Body')}
      </InfoSection>

      <InfoSection title={t('privacyPolicyPage.section2Title')}>
        {t('privacyPolicyPage.section2Body')}
      </InfoSection>

      <InfoSection title={t('privacyPolicyPage.section3Title')}>
        {t('privacyPolicyPage.section3Body')}
      </InfoSection>

      <InfoSection title={t('privacyPolicyPage.section4Title')}>
        {t('privacyPolicyPage.section4Body')}
      </InfoSection>

      <InfoSection title={t('privacyPolicyPage.section5Title')}>
        {t('privacyPolicyPage.section5Body')}
      </InfoSection>

      <InfoSection title={t('privacyPolicyPage.section6Title')}>
        {t('privacyPolicyPage.section6Body')}
      </InfoSection>
    </InfoPage>
  );
}
