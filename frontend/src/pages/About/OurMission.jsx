import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function OurMission() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.ourMission')}
      intro={t('ourMissionPage.intro')}
    >
      <InfoSection title={t('ourMissionPage.missionTitle')}>
        {t('ourMissionPage.missionBody')}
      </InfoSection>

      <InfoSection title={t('ourMissionPage.valuesTitle')}>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('ourMissionPage.value1')}</li>
          <li>{t('ourMissionPage.value2')}</li>
          <li>{t('ourMissionPage.value3')}</li>
        </ul>
      </InfoSection>
    </InfoPage>
  );
}
