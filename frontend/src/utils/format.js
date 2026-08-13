export const CONDITIONS = [
  { value: 'brand_new', label: 'Brand new' },
  { value: 'lightly_used', label: 'Lightly used' },
  { value: 'fair_condition', label: 'Fair condition' },
];

export function conditionLabel(value) {
  return CONDITIONS.find((c) => c.value === value)?.label || value;
}

export function formatPrice(price) {
  const n = Number(price);
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB`;
}

export function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}
