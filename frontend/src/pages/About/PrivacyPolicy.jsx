import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with a real privacy policy.
export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.privacyPolicy')}
      intro="Last updated: [date]" // TODO: replace with real last-updated date
    >
      <InfoSection title="1. Information we collect">
        [List what you collect — account details, listing content, messages, location for city
        filters, etc.]
      </InfoSection>

      <InfoSection title="2. How we use your information">
        [Explain how the data is used — e.g. to operate the marketplace, connect buyers and
        sellers, improve the service.]
      </InfoSection>

      <InfoSection title="3. Sharing your information">
        [Explain what's shared with other users (e.g. your name and city on a listing) vs. what
        stays private.]
      </InfoSection>

      <InfoSection title="4. Data storage and security">
        [Describe how data is stored and protected.]
      </InfoSection>

      <InfoSection title="5. Your choices">
        [Explain how users can update or delete their info, or close their account.]
      </InfoSection>

      <InfoSection title="6. Contact">
        Questions about this policy? Reach out via our Contact Support page.
      </InfoSection>
    </InfoPage>
  );
}
