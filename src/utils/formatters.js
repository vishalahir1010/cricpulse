export function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMatchTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/** CricAPI score entries look like { r, w, o, inning }. */
export function formatScore(scoreEntry) {
  if (!scoreEntry) return null;
  const { r, w, o } = scoreEntry;
  if (r == null) return null;
  const wickets = w != null ? w : 10;
  return `${r}/${wickets}${o != null ? ` (${o} ov)` : ''}`;
}

export function strikeRate(runs, balls) {
  if (!balls) return '0.00';
  return ((runs / balls) * 100).toFixed(2);
}

export function economyRate(runsConceded, overs) {
  if (!overs) return '0.00';
  return (runsConceded / overs).toFixed(2);
}

export function truncate(text, max = 140) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max).trim()}…` : text;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}
