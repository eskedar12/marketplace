import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function AboutUs() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.aboutUs')}
      intro="ReGebeya is Ethiopia's trusted marketplace for buying and selling used items easily and safely."
    >
      <InfoSection title="Who we are">
        [Write a short story about the company — when it started, who's behind it, and why you
        built ReGebeya.]
      </InfoSection>

      <InfoSection title="What we do">
        We connect buyers and sellers across Ethiopia, making it simple to list an item, find a
        good deal, and meet up to complete the exchange.
      </InfoSection>

      <InfoSection title="Where we're headed">
        [Add anything about future plans, growth, or values you'd like visitors to know.]
      </InfoSection>
    </InfoPage>
  );
}
