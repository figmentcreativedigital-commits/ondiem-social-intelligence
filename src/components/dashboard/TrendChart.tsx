'use client';

/**
 * TrendChart — line/area chart in onDiem brand style.
 * Wraps Recharts and applies brand tokens for axis lines, grid, and stroke.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fmtDate, fmtNum } from '@/lib/format';

type Series = {
  key: string;
  label: string;
  color: string;
};

type Props = {
  data: Array<Record<string, number | string>>;
  series: Series[];
  height?: number;
  yAxisLabel?: string;
  area?: boolean;
};

export default function TrendChart({ data, series, height = 260, area = true }: Props) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(42,59,88,.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => fmtDate(String(v))}
            stroke="rgba(42,59,88,.3)"
            tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'rgba(42,59,88,.7)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(42,59,88,.12)' }}
          />
          <YAxis
            stroke="rgba(42,59,88,.3)"
            tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'rgba(42,59,88,.7)' }}
            tickFormatter={(v) => fmtNum(Number(v))}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--paper)',
              border: '1px solid rgba(42,59,88,.12)',
              borderRadius: 'var(--r-card-sm)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              padding: '0.625rem 0.875rem',
              boxShadow: 'var(--shadow-card)',
            }}
            labelStyle={{ color: 'var(--ink)', fontWeight: 600, marginBottom: '0.25rem' }}
            labelFormatter={(v) => fmtDate(String(v), 'long')}
            formatter={(value: number, name: string) => [fmtNum(value), name]}
          />
          {series.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: '0.5rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                color: 'var(--ink-70)',
              }}
              iconType="circle"
              iconSize={8}
            />
          )}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.5}
              fill={area ? `url(#grad-${s.key})` : 'none'}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: 'var(--paper)', strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
