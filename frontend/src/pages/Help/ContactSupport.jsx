import React, { useState } from 'react';
import InfoPage, { InfoSection } from '../../components/common/InfoPage.jsx';
import { Input, Textarea } from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

// TODO: replace placeholder contact details with real info, and wire
// handleSubmit up to a real support endpoint / email service — right
// now it just shows a local "sent" confirmation.
export default function ContactSupport() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // TODO: replace with a real API call, e.g. supportApi.sendMessage(form)
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    setSent(true);
  }

  return (
    <InfoPage
      crumbs={[{ label: t('footer.helpCenter'), to: '/help' }, { label: t('footer.contactSupport') }]}
      title={t('footer.contactSupport')}
      intro={t('contactSupportPage.intro')}
    >
      <div className="grid sm:grid-cols-5 gap-8">
        <form onSubmit={handleSubmit} className="sm:col-span-3 space-y-4">
          {sent ? (
            <div className="p-4 rounded-xl bg-juniper/10 border border-juniper/30 text-sm font-body text-ink">
              {t('contactSupportPage.sent')}
            </div>
          ) : (
            <>
              <Input
                label={t('contactSupportPage.name')}
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
              <Input
                label={t('contactSupportPage.email')}
                type="email"
                required
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              <Input
                label={t('contactSupportPage.subject')}
                required
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
              />
              <Textarea
                label={t('contactSupportPage.message')}
                required
                rows={5}
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? t('common.saving') : t('common.send')}
              </Button>
            </>
          )}
        </form>

        <div className="sm:col-span-2">
          <InfoSection title={t('contactSupportPage.otherWays')}>
            <ul className="space-y-2">
              <li>+251 91 123 4567</li>
              <li>hello@regebeya.com</li>
              <li>{t('footer.address')}</li>
            </ul>
          </InfoSection>
        </div>
      </div>
    </InfoPage>
  );
}
