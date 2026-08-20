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
      intro="A quick walkthrough of buying an item on ReGebeya, from search to pickup."
    >
      <div className="space-y-6">
        <InfoStep number="1" title="Search or browse a category">
          Use the search bar or browse by category to find what you're looking for. Filter by city,
          price, and condition to narrow things down.
        </InfoStep>
        <InfoStep number="2" title="Check the listing carefully">
          Look at all the photos, read the full description, and check the seller's profile and
          rating before reaching out.
        </InfoStep>
        <InfoStep number="3" title="Message the seller">
          Ask any questions you have and confirm the item is still available before agreeing to
          meet.
        </InfoStep>
        <InfoStep number="4" title="Agree on a time and place">
          Pick a public, well-lit location to meet — see our Safety Center for tips on meeting
          safely.
        </InfoStep>
        <InfoStep number="5" title="Inspect, pay, and collect">
          Check the item in person before paying. Once you're happy with it, complete the payment
          and take your item.
        </InfoStep>
      </div>

      <InfoSection title="Need help with a purchase?">
        If something doesn't go as planned, reach out to our support team or report the listing
        directly from the item page.
      </InfoSection>
    </InfoPage>
  );
}
