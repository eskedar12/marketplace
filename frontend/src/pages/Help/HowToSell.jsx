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
      intro="Everything you need to know to list an item and sell it on ReGebeya."
    >
      <div className="space-y-6">
        <InfoStep number="1" title="Create a listing">
          Tap "Sell" and fill in your item's title, description, category, and condition.
        </InfoStep>
        <InfoStep number="2" title="Add good photos">
          Clear, well-lit photos from multiple angles help your item sell faster. Add at least one
          photo, up to five.
        </InfoStep>
        <InfoStep number="3" title="Set a fair price">
          Check similar listings in your category to price competitively.
        </InfoStep>
        <InfoStep number="4" title="Respond to buyers">
          Answer questions promptly and confirm details before agreeing to meet.
        </InfoStep>
        <InfoStep number="5" title="Complete the sale">
          Meet in a safe, public place, let the buyer inspect the item, and collect payment before
          handing it over.
        </InfoStep>
      </div>

      <InfoSection title="Tips for selling faster">
        Write an honest, detailed description, be responsive to messages, and keep your price
        realistic for the item's condition.
      </InfoSection>
    </InfoPage>
  );
}
