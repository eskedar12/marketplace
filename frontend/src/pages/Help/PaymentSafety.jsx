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
      intro="How payments work on ReGebeya, and how to keep your money and personal information safe."
    >
      <InfoSection title="Accepted payment methods">
        Cash on pickup, and [list any supported digital payment options — e.g. Chapa, bank
        transfer, mobile money] once verified.
      </InfoSection>

      <InfoSection title="Before you pay">
        <ul className="list-disc pl-5 space-y-1">
          <li>Always inspect the item in person before paying.</li>
          <li>Never send money in advance for an item you haven't seen.</li>
          <li>Avoid wiring money or sharing one-time codes with anyone.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Protecting your information">
        Don't share your password, ID numbers, or bank PINs with anyone claiming to be from
        ReGebeya — our team will never ask for these over chat.
      </InfoSection>

      <InfoSection title="Something feel off?">
        If a buyer or seller asks you to pay outside the platform or pressures you to act quickly,
        treat it as a red flag. See our{' '}
        <Link to="/safety" className="text-juniper font-medium hover:text-mustard">
          {t('footer.safetyCenter')}
        </Link>{' '}
        for more, or{' '}
        <Link to="/help/contact" className="text-juniper font-medium hover:text-mustard">
          {t('footer.contactSupport')}
        </Link>
        .
      </InfoSection>
    </InfoPage>
  );
}
