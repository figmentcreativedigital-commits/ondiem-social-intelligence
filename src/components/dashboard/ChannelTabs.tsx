'use client';

/**
 * ChannelTabs — segmented control for channel + window selection.
 * Channels: Facebook, Instagram, LinkedIn.
 * Windows: 30 days, 365 days.
 * Uses brand pill aesthetic with active state colored per channel.
 */

import { ChannelName, WindowKey } from '@/lib/types';

type ChannelTab = {
  key: ChannelName;
  label: string;
  accent: string;
};

const CHANNELS: ChannelTab[] = [
  { key: 'facebook', label: 'Facebook', accent: 'var(--purple)' },
  { key: 'instagram', label: 'Instagram', accent: 'var(--pink)' },
  { key: 'linkedin', label: 'LinkedIn', accent: 'var(--teal)' },
];

type Props = {
  channel: ChannelName;
  window: WindowKey;
  onChannelChange: (c: ChannelName) => void;
  onWindowChange: (w: WindowKey) => void;
};

export default function ChannelTabs({ channel, window, onChannelChange, onWindowChange }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div
        role="tablist"
        aria-label="Channels"
        style={{
          display: 'inline-flex',
          padding: '0.3rem',
          background: 'var(--paper)',
          borderRadius: 'var(--r-pill)',
          boxShadow: 'var(--shadow-card)',
          gap: '0.2rem',
        }}
      >
        {CHANNELS.map((c) => {
          const active = c.key === channel;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChannelChange(c.key)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--r-pill)',
                border: 'none',
                background: active ? c.accent : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-70)',
                transition: 'all var(--dur-base) var(--ease-out)',
                letterSpacing: '0.02em',
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div
        role="tablist"
        aria-label="Time window"
        style={{
          display: 'inline-flex',
          padding: '0.25rem',
          background: 'var(--paper)',
          borderRadius: 'var(--r-pill)',
          boxShadow: 'var(--shadow-card)',
          gap: '0.2rem',
        }}
      >
        {(['30d', '365d'] as WindowKey[]).map((w) => {
          const active = w === window;
          return (
            <button
              key={w}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onWindowChange(w)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--r-pill)',
                border: 'none',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--canvas)' : 'var(--ink-70)',
                transition: 'all var(--dur-base) var(--ease-out)',
                letterSpacing: '0.02em',
              }}
            >
              {w === '30d' ? 'Last 30 days' : 'Past year'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
