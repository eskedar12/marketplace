import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real terms.
export default function TermsOfUse() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.termsOfUse')}
      intro="Last updated: [date]" // TODO: replace with real last-updated date
    >
      <InfoSection title="1. Acceptance of terms">
        By using ReGebeya, you agree to these terms. [Add details about what using the platform
        means the user accepts.]
      </InfoSection>

      <InfoSection title="2. Listings and accounts">
        [Explain rules for creating listings and accounts — accurate info, one account per
        person, prohibited items, etc.]
      </InfoSection>

      <InfoSection title="3. Buying and selling">
        [Explain that ReGebeya connects buyers and sellers but isn't a party to the transaction
        between them, and any related liability limits.]
      </InfoSection>

      <InfoSection title="4. Prohibited conduct">
        [List things users may not do — fraud, harassment, posting illegal items, etc.]
      </InfoSection>

      <InfoSection title="5. Changes to these terms">
        [Explain how and when you may update these terms.]
      </InfoSection>

      <InfoSection title="6. Contact">
        Questions about these terms? Reach out via our Contact Support page.
      </InfoSection>
    </InfoPage>
  );
}
