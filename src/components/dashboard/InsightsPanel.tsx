'use client';

/**
 * InsightsPanel — surfaces automatic observations from the data.
 * Each insight is rendered as a soft-colored callout with the brand
 * portal accent.
 */

import type { Insight } from '@/lib/insights';

const ACCENT_FOR: Record<Insight['kind'], string> = {
  positive: 'var(--sage)',
  caution: 'var(--peach)',
  neutral: 'var(--teal)',
};

const BG_FOR: Record<Insight['kind'], string> = {
  positive: 'rgba(127, 201, 168, 0.12)',
  caution: 'rgba(249, 183, 142, 0.16)',
  neutral: 'rgba(127, 207, 209, 0.12)',
};

type Props = {
  insights: Insight[];
};

export default function InsightsPanel({ insights }: Props) {
  if (!insights || insights.length === 0) {
    return (
      <p style={{ color: 'var(--ink-70)', fontSize: 'var(--t-small)' }}>
        Not enough data to surface insights yet.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: 0, padding: 0 }}>
      {insights.map((ins, i) => (
        <li
          key={i}
          style={{
            padding: '0.875rem 1rem 0.875rem 0.875rem',
            background: BG_FOR[ins.kind],
            borderRadius: 'var(--r-card-sm)',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '0.875rem',
            alignItems: 'flex-start',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: ACCENT_FOR[ins.kind],
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-portal)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink)', fontSize: '0.95rem' }}>
              {ins.kind === 'positive' ? '↗' : ins.kind === 'caution' ? '!' : '✦'}
            </span>
          </span>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {ins.headline}
            </p>
            <p
              style={{
                marginTop: '0.25rem',
                fontSize: 'var(--t-small)',
                color: 'var(--ink-90)',
                lineHeight: 1.55,
              }}
            >
              {ins.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
