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
      intro={t('safetyCenterPage.intro')}
    >
      <InfoSection title={t('footer.meetSafePlaces')}>
        {t('safetyCenterPage.meetSafePlacesBody')}
      </InfoSection>

      <InfoSection title={t('footer.checkBeforeBuy')}>
        {t('safetyCenterPage.checkBeforeBuyBody')}
      </InfoSection>

      <InfoSection title={t('footer.avoidScams')}>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('safetyCenterPage.avoidScams1')}</li>
          <li>{t('safetyCenterPage.avoidScams2')}</li>
          <li>{t('safetyCenterPage.avoidScams3')}</li>
        </ul>
      </InfoSection>

      <InfoSection title={t('footer.reportFraud')}>
        {t('safetyCenterPage.reportFraudBefore')}
        <Link to="/help/contact" className="text-juniper font-medium hover:text-mustard">
          {t('footer.contactSupport')}
        </Link>
        {t('safetyCenterPage.reportFraudAfter')}
      </InfoSection>
    </InfoPage>
  );
}
