import React from 'react';
import InfoPage, { InfoStep, InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function HowToSell() {
  const { t } = useLanguage();

  return (
    <InfoPage
      crumbs={[{ label: t('footer.helpCenter'), to: '/help' }, { label: t('footer.howToSell') }]}
      title={t('footer.howToSell')}
      intro={t('howToSellPage.intro')}
    >
      <div className="space-y-6">
        <InfoStep number="1" title={t('howToSellPage.step1Title')}>
          {t('howToSellPage.step1Body')}
        </InfoStep>
        <InfoStep number="2" title={t('howToSellPage.step2Title')}>
          {t('howToSellPage.step2Body')}
        </InfoStep>
        <InfoStep number="3" title={t('howToSellPage.step3Title')}>
          {t('howToSellPage.step3Body')}
        </InfoStep>
        <InfoStep number="4" title={t('howToSellPage.step4Title')}>
          {t('howToSellPage.step4Body')}
        </InfoStep>
        <InfoStep number="5" title={t('howToSellPage.step5Title')}>
          {t('howToSellPage.step5Body')}
        </InfoStep>
      </div>

      <InfoSection title={t('howToSellPage.tipsTitle')}>
        {t('howToSellPage.tipsBody')}
      </InfoSection>
    </InfoPage>
  );
}
