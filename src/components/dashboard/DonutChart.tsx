'use client';

/**
 * DonutChart — used for media mix and content type breakdowns.
 * Brand-colored slices, soft inner shadow, center label.
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fmtNum, typeColor } from '@/lib/format';

type Slice = { label: string; value: number; color?: string };

type Props = {
  data: Slice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
};

export default function DonutChart({ data, size = 180, centerLabel, centerValue, showLegend = true }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);

  const enriched = data.map((d) => ({
    ...d,
    color: d.color || typeColor(d.label),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{ width: size, height: size, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={enriched}
              dataKey="value"
              nameKey="label"
              innerRadius={size * 0.32}
              outerRadius={size * 0.46}
              paddingAngle={1.5}
              startAngle={90}
              endAngle={-270}
              stroke="var(--paper)"
              strokeWidth={2}
            >
              {enriched.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--paper)',
                border: '1px solid rgba(42,59,88,.12)',
                borderRadius: 'var(--r-card-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                padding: '0.5rem 0.75rem',
              }}
              formatter={(value: number) => [
                `${fmtNum(value)} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                '',
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue !== undefined) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            <div>
              {centerValue !== undefined && (
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--t-display-md)',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    lineHeight: 1,
                  }}
                >
                  {centerValue}
                </div>
              )}
              {centerLabel && (
                <div
                  style={{
                    fontSize: 'var(--t-eyebrow)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-70)',
                    marginTop: '0.25rem',
                  }}
                >
                  {centerLabel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showLegend && (
        <ul
          style={{
            listStyle: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem 1rem',
            justifyContent: 'center',
            margin: 0,
            padding: 0,
            fontSize: 'var(--t-small)',
          }}
        >
          {enriched.map((d) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <li key={d.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: d.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--ink)', textTransform: 'capitalize' }}>{d.label}</span>
                <span style={{ color: 'var(--ink-70)' }}>· {pct}%</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
