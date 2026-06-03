/**
 * Utility helpers for the dashboard
 */

export function fmtNum(n: number, opts?: { compact?: boolean }): string {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (opts?.compact !== false && n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (opts?.compact !== false && n >= 10_000) return Math.round(n / 1000) + 'K';
  if (opts?.compact !== false && n >= 1_000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function fmtPct(n: number, decimals: number = 1): string {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

export function fmtDate(iso: string, fmt: 'short' | 'long' = 'short'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  if (fmt === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function truncate(s: string, n: number): string {
  if (!s) return '';
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}

/**
 * Map a media type or post type to a brand color CSS variable.
 */
export function typeColor(type: string): string {
  const t = (type || '').toLowerCase();
  if (t.includes('image') || t.includes('photo')) return 'var(--teal)';
  if (t.includes('video') || t.includes('reel')) return 'var(--pink)';
  if (t.includes('carousel') || t.includes('multi')) return 'var(--purple)';
  if (t.includes('stor')) return 'var(--yellow)';
  if (t.includes('link')) return 'var(--peach)';
  if (t.includes('text')) return 'var(--sage)';
  return 'var(--ink-30)';
}

/**
 * Compute period-over-period change (used for sparklines / trend arrows)
 */
export function computeTrend(series: number[]): { dir: 'up' | 'down' | 'flat'; pct: number } {
  if (!series || series.length < 2) return { dir: 'flat', pct: 0 };
  // Compare first half vs second half averages
  const mid = Math.floor(series.length / 2);
  const firstHalf = series.slice(0, mid);
  const secondHalf = series.slice(mid);
  const a = firstHalf.reduce((s, v) => s + v, 0) / Math.max(1, firstHalf.length);
  const b = secondHalf.reduce((s, v) => s + v, 0) / Math.max(1, secondHalf.length);
  if (a === 0 && b === 0) return { dir: 'flat', pct: 0 };
  if (a === 0) return { dir: 'up', pct: 100 };
  const pct = ((b - a) / a) * 100;
  if (Math.abs(pct) < 5) return { dir: 'flat', pct: 0 };
  return { dir: pct > 0 ? 'up' : 'down', pct: Math.abs(pct) };
}

/**
 * True period-over-period change vs an explicit prior-period total.
 * Returns null when no prior value is supplied, so callers can fall back
 * to the within-window heuristic (computeTrend).
 */
export function trendFromPrev(
  current: number,
  prev?: number | null,
): { dir: 'up' | 'down' | 'flat'; pct: number } | null {
  if (prev === undefined || prev === null) return null;
  if (prev === 0) return current > 0 ? { dir: 'up', pct: 100 } : { dir: 'flat', pct: 0 };
  const pct = ((current - prev) / Math.abs(prev)) * 100;
  if (Math.abs(pct) < 0.5) return { dir: 'flat', pct: 0 };
  return { dir: pct > 0 ? 'up' : 'down', pct: Math.abs(pct) };
}
