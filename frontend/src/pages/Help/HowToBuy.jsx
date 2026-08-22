import React from 'react';
import InfoPage, { InfoStep, InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function HowToBuy() {
  const { t } = useLanguage();

  return (
    <InfoPage
      crumbs={[{ label: t('footer.helpCenter'), to: '/help' }, { label: t('footer.howToBuy') }]}
      title={t('footer.howToBuy')}
      intro={t('howToBuyPage.intro')}
    >
      <div className="space-y-6">
        <InfoStep number="1" title={t('howToBuyPage.step1Title')}>
          {t('howToBuyPage.step1Body')}
        </InfoStep>
        <InfoStep number="2" title={t('howToBuyPage.step2Title')}>
          {t('howToBuyPage.step2Body')}
        </InfoStep>
        <InfoStep number="3" title={t('howToBuyPage.step3Title')}>
          {t('howToBuyPage.step3Body')}
        </InfoStep>
        <InfoStep number="4" title={t('howToBuyPage.step4Title')}>
          {t('howToBuyPage.step4Body')}
        </InfoStep>
        <InfoStep number="5" title={t('howToBuyPage.step5Title')}>
          {t('howToBuyPage.step5Body')}
        </InfoStep>
      </div>

      <InfoSection title={t('howToBuyPage.needHelpTitle')}>
        {t('howToBuyPage.needHelpBody')}
      </InfoSection>
    </InfoPage>
  );
}
