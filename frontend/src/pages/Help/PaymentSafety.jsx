import React from 'react';
import { Link } from 'react-router-dom';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function PaymentSafety() {
  const { t } = useLanguage();

  return (
    <InfoPage
      crumbs={[{ label: t('footer.helpCenter'), to: '/help' }, { label: t('footer.paymentSafety') }]}
      title={t('footer.paymentSafety')}
      intro={t('paymentSafetyPage.intro')}
    >
      <InfoSection title={t('paymentSafetyPage.acceptedTitle')}>
        {t('paymentSafetyPage.acceptedBody')}
      </InfoSection>

      <InfoSection title={t('paymentSafetyPage.beforeTitle')}>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t('paymentSafetyPage.before1')}</li>
          <li>{t('paymentSafetyPage.before2')}</li>
          <li>{t('paymentSafetyPage.before3')}</li>
        </ul>
      </InfoSection>

      <InfoSection title={t('paymentSafetyPage.protectingTitle')}>
        {t('paymentSafetyPage.protectingBody')}
      </InfoSection>

      <InfoSection title={t('paymentSafetyPage.offTitle')}>
        {t('paymentSafetyPage.offBefore')}
        <Link to="/safety" className="text-juniper font-medium hover:text-mustard">
          {t('footer.safetyCenter')}
        </Link>
        {t('paymentSafetyPage.offMiddle')}
        <Link to="/help/contact" className="text-juniper font-medium hover:text-mustard">
          {t('footer.contactSupport')}
        </Link>
        {t('paymentSafetyPage.offAfter')}
      </InfoSection>
    </InfoPage>
  );
}
