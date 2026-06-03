'use client';

/**
 * Card — a consistent paper-surface panel for dashboard sections.
 * Title, optional eyebrow + description, and slot for content.
 */

import { ReactNode } from 'react';

type Props = {
  title?: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  span?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  flush?: boolean;
};

export default function Card({ title, eyebrow, description, children, span = 1, rowSpan = 1, flush = false }: Props) {
  return (
    <section
      className="dash-card"
      style={{
        background: 'var(--paper)',
        borderRadius: 'var(--r-card)',
        padding: flush ? '1.25rem' : '1.5rem',
        boxShadow: 'var(--shadow-card)',
        gridColumn: `span ${span}`,
        gridRow: `span ${rowSpan}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: 0,
      }}
    >
      {(title || eyebrow || description) && (
        <header style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {eyebrow && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--t-eyebrow)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-70)',
              }}
            >
              {eyebrow}
            </span>
          )}
          {title && (
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--t-display-sm)',
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                letterSpacing: '-0.005em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p style={{ color: 'var(--ink-70)', fontSize: 'var(--t-small)', lineHeight: 1.5, margin: 0 }}>
              {description}
            </p>
          )}
        </header>
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>{children}</div>
    </section>
  );
}
