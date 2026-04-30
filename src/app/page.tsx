'use client';

/**
 * Dashboard root page.
 *
 * Three-tab layout: Facebook · Instagram · LinkedIn.
 * Each channel has its own 30d / 365d toggle.
 * All metrics are organic — no advertising mentions.
 */

import { useState } from 'react';
import { Header, PortalCluster, Pill } from '@/components/brand';
import ChannelTabs from '@/components/dashboard/ChannelTabs';
import LinkedInView from '@/components/dashboard/LinkedInView';
import InstagramView from '@/components/dashboard/InstagramView';
import FacebookView from '@/components/dashboard/FacebookView';
import type { ChannelName, Snapshot, WindowKey } from '@/lib/types';
import snapshotData from '@/data/snapshot.json';

const snapshot = snapshotData as unknown as Snapshot;

export default function Page() {
  const [channel, setChannel] = useState<ChannelName>('linkedin');
  const [window, setWindow] = useState<WindowKey>('30d');

  const generated = new Date(snapshot.generatedAt);
  const periodEnd = new Date(snapshot.periodEnd);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <Header
        period={`Period ending ${periodEnd.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}`}
        headline={
          <>
            This <Pill color="teal">Week</Pill> in Social
          </>
        }
      />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '1.5rem 1.5rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <ChannelTabs
          channel={channel}
          window={window}
          onChannelChange={setChannel}
          onWindowChange={setWindow}
        />

        {channel === 'linkedin' && <LinkedInView data={snapshot.channels.linkedin[window]} window={window} />}
        {channel === 'instagram' && <InstagramView data={snapshot.channels.instagram[window]} window={window} />}
        {channel === 'facebook' && <FacebookView data={snapshot.channels.facebook[window]} window={window} />}

        {/* Footer with refresh metadata */}
        <footer
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--ink-08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span style={{ fontSize: 'var(--t-small)', color: 'var(--ink-70)' }}>
            Snapshot generated {generated.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            {' · '}
            Prepared by Figment Creative
          </span>
          <PortalCluster variant="compact" />
        </footer>
      </div>
    </main>
  );
}
