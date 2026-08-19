export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function padNumber(n: number, pad: number = 2): string {
  return n.toString().padStart(pad, '0');
}

export function pct(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

export function minutesToHM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
