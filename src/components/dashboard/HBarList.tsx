'use client';

/**
 * HBarList — horizontal bar chart for top-N rankings (locations, industries…).
 * Uses brand teal/sage gradients with soft rounded ends.
 */

import { fmtNum } from '@/lib/format';
import type { DemographicEntry } from '@/lib/types';

type Props = {
  data: DemographicEntry[];
  max?: number;
  color?: string;
  emptyMessage?: string;
};

export default function HBarList({ data, max = 8, color = 'var(--teal)', emptyMessage = 'No data' }: Props) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--ink-70)', fontSize: 'var(--t-small)' }}>{emptyMessage}</p>;
  }

  const trimmed = data.slice(0, max);
  const peak = Math.max(...trimmed.map((d) => d.value), 1);

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: 0, padding: 0 }}>
      {trimmed.map((d) => {
        const pct = (d.value / peak) * 100;
        return (
          <li key={d.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.275rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'baseline' }}>
              <span
                style={{
                  fontSize: 'var(--t-body)',
                  color: 'var(--ink)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%',
                }}
                title={d.label}
              >
                {d.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--t-small)',
                  color: 'var(--ink-70)',
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {fmtNum(d.value)}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 8,
                background: 'var(--ink-08)',
                borderRadius: 'var(--r-pill)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 'var(--r-pill)',
                  transition: 'width var(--dur-slow) var(--ease-out)',
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
