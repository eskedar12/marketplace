export const CONDITIONS = [
  { value: 'brand_new', label: 'Brand new' },
  { value: 'lightly_used', label: 'Lightly used' },
  { value: 'fair_condition', label: 'Used' },
];

// Optional `t` (from useTranslation()) translates the condition label;
// callers that don't pass one still get the English default above, so
// this stays backward compatible with any code that hasn't been
// updated to pass a translation function yet.
export function conditionLabel(value, t) {
  if (t) {
    const key = { brand_new: 'formatters.brandNew', lightly_used: 'formatters.lightlyUsed', fair_condition: 'formatters.fairCondition' }[value];
    if (key) return t(key);
  }
  return CONDITIONS.find((c) => c.value === value)?.label || value;
}

export function formatPrice(price) {
  const n = Number(price);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB`;
}

// Optional `t` (from useTranslation()) translates the "Xm/h/d ago"
// wording; without one this falls back to the English phrasing.
export function timeAgo(dateString, t) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return t ? t('formatters.minsAgo', { n: mins }) : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t ? t('formatters.hoursAgo', { n: hours }) : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return t ? t('formatters.daysAgo', { n: days }) : `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}
