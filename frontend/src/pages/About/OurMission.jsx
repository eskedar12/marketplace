import React from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder copy below with real content.
export default function OurMission() {
  const { t } = useLanguage();

  return (
    <InfoPage
      title={t('footer.ourMission')}
      intro="Making it easy for anyone in Ethiopia to buy and sell quality used goods, affordably and safely."
    >
      <InfoSection title="Our mission">
        [State your mission in one or two sentences — what problem you're solving and for whom.]
      </InfoSection>

      <InfoSection title="What we stand for">
        <ul className="list-disc pl-5 space-y-1">
          <li>[Value 1 — e.g. Trust and safety between buyers and sellers]</li>
          <li>[Value 2 — e.g. Affordable, sustainable second-hand shopping]</li>
          <li>[Value 3 — e.g. Supporting local communities]</li>
        </ul>
      </InfoSection>
    </InfoPage>
  );
}
