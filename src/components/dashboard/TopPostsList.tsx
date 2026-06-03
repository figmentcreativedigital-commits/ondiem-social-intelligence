'use client';

/**
 * TopPostsList — feed of best-performing posts for a window.
 * Each row shows date, snippet, type pill, and key metrics.
 */

import { fmtDate, fmtNum, truncate, typeColor } from '@/lib/format';

type PostRow = {
  date: string;
  caption: string;
  link?: string | null;
  type: string;
  primaryMetric: { label: string; value: string | number };
  secondaryMetrics?: Array<{ label: string; value: string | number }>;
};

type Props = {
  posts: PostRow[];
  channel: 'facebook' | 'instagram' | 'linkedin';
};

export default function TopPostsList({ posts, channel }: Props) {
  if (!posts || posts.length === 0) {
    return (
      <p style={{ color: 'var(--ink-70)', fontSize: 'var(--t-small)' }}>
        No posts in this period.
      </p>
    );
  }

  return (
    <ol
      style={{
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        margin: 0,
        padding: 0,
      }}
    >
      {posts.map((p, i) => {
        const accent = typeColor(p.type);
        return (
          <li
            key={i}
            style={{
              padding: '0.875rem 1rem',
              background: 'var(--canvas-warm)',
              borderRadius: 'var(--r-card-sm)',
              border: '1px solid var(--ink-08)',
              transition: 'transform var(--dur-quick) var(--ease-out), border-color var(--dur-quick) var(--ease-out)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '0.875rem',
              alignItems: 'center',
            }}
          >
            <div
              aria-hidden
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: accent,
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--ink)',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>

            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.275rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: 'var(--t-eyebrow)',
                  color: 'var(--ink-70)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span>{fmtDate(p.date, 'short')}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-30)' }} />
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.6rem',
                  background: accent,
                  color: 'var(--ink)',
                  borderRadius: 'var(--r-pill)',
                  fontSize: 'var(--t-eyebrow)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {p.type}
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--ink)',
                  lineHeight: 1.45,
                  margin: 0,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.link ? (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted var(--ink-30)' }}
                  >
                    {truncate(p.caption || `View on ${channel}`, 220)}
                  </a>
                ) : (
                  truncate(p.caption || '(no caption)', 220)
                )}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.875rem',
                  marginTop: '0.125rem',
                  fontSize: 'var(--t-small)',
                }}
              >
                <Metric label={p.primaryMetric.label} value={p.primaryMetric.value} primary />
                {p.secondaryMetrics?.map((m, j) => (
                  <Metric key={j} label={m.label} value={m.value} />
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Metric({ label, value, primary }: { label: string; value: string | number; primary?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'baseline' }}>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          color: primary ? 'var(--ink)' : 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          fontSize: primary ? '0.95rem' : 'var(--t-body)',
        }}
      >
        {typeof value === 'number' ? fmtNum(value) : value}
      </span>
      <span style={{ color: 'var(--ink-70)', textTransform: 'lowercase' }}>{label}</span>
    </span>
  );
}
