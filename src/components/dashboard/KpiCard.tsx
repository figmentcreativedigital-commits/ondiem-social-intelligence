'use client';

/**
 * KpiCard — the primary metric tile.
 * Uses the off-white card surface with brand ink type and a single bright
 * accent (a portal disc) for visual rhythm.
 */

import { ReactNode } from 'react';
import { fmtNum } from '@/lib/format';

type Props = {
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
  trend?: { dir: 'up' | 'down' | 'flat'; pct: number };
  accent?: 'teal' | 'pink' | 'sage' | 'purple' | 'yellow' | 'peach';
  icon?: ReactNode;
  format?: 'number' | 'string' | 'pct';
  size?: 'sm' | 'md' | 'lg';
};

export default function KpiCard({
  label,
  value,
  unit,
  hint,
  trend,
  accent = 'teal',
  icon,
  format = 'number',
  size = 'md',
}: Props) {
  const display =
    format === 'number' && typeof value === 'number'
      ? fmtNum(value)
      : format === 'pct' && typeof value === 'number'
      ? `${value.toFixed(1)}%`
      : String(value);

  return (
    <div
      className="kpi-card"
      style={{
        background: 'var(--paper)',
        borderRadius: 'var(--r-card)',
        padding: size === 'lg' ? '1.5rem 1.5rem 1.625rem' : '1.25rem 1.25rem 1.375rem',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
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
          {label}
        </span>
        {icon && (
          <div
            aria-hidden
            style={{
              width: size === 'lg' ? 40 : 32,
              height: size === 'lg' ? 40 : 32,
              borderRadius: '50%',
              background: `var(--${accent})`,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-portal)',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'lg' ? 'var(--t-display-xl)' : 'var(--t-display-lg)',
          fontWeight: 700,
          color: 'var(--ink)',
          lineHeight: 1.05,
          marginTop: '0.5rem',
          letterSpacing: '-0.01em',
        }}
      >
        {display}
        {unit && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.55em',
              fontWeight: 600,
              color: 'var(--ink-70)',
              marginLeft: '0.375rem',
            }}
          >
            {unit}
          </span>
        )}
      </div>

      {(hint || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.625rem' }}>
          {trend && trend.dir !== 'flat' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: 'var(--t-small)',
                fontWeight: 600,
                color: trend.dir === 'up' ? '#1f8a5e' : '#a23a3a',
                background: trend.dir === 'up' ? 'rgba(127, 201, 168, 0.18)' : 'rgba(241, 137, 181, 0.18)',
                padding: '0.18rem 0.5rem',
                borderRadius: 'var(--r-pill)',
              }}
            >
              {trend.dir === 'up' ? '↑' : '↓'} {trend.pct.toFixed(0)}%
            </span>
          )}
          {hint && (
            <span style={{ fontSize: 'var(--t-small)', color: 'var(--ink-70)' }}>{hint}</span>
          )}
        </div>
      )}
    </div>
  );
}
