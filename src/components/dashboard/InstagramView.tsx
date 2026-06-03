'use client';

/**
 * InstagramView — composes the dashboard for the Instagram channel.
 * Shows: KPI grid · follower trend · media mix · top posts · 90d snapshot · activity heatmap.
 */

import KpiCard from './KpiCard';
import TrendChart from './TrendChart';
import DonutChart from './DonutChart';
import TopPostsList from './TopPostsList';
import Card from './Card';
import InsightsPanel from './InsightsPanel';
import { Icons } from '@/components/brand';
import type { InstagramWindow, WindowKey } from '@/lib/types';
import { generateInsights } from '@/lib/insights';
import { computeTrend, fmtNum } from '@/lib/format';

type Props = {
  data: InstagramWindow;
  window: WindowKey;
};

export default function InstagramView({ data, window }: Props) {
  const k = data.kpis;
  const insights = generateInsights('instagram', window, data);

  // Trends
  const followerSeries = data.series.filter((s) => s.followers > 0).map((s) => s.followers);
  const followerTrend = computeTrend(followerSeries);
  const viewsTrend = computeTrend(data.series.map((s) => s.views || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* KPI ROW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <KpiCard
          label="Total followers"
          value={k.totalFollowers}
          accent="pink"
          icon={<Icons.heartChat size={18} />}
          trend={followerTrend}
          hint={k.followerChange > 0 ? `+${k.followerChange} in period` : undefined}
        />
        <KpiCard
          label="Views"
          value={k.totalViews}
          accent="purple"
          icon={<Icons.bulb size={18} />}
          trend={viewsTrend}
        />
        <KpiCard
          label="Reach"
          value={k.totalReach}
          accent="teal"
          icon={<Icons.rocket size={18} />}
        />
        <KpiCard
          label="Engagements"
          value={k.totalEngagements}
          accent="yellow"
          icon={<Icons.speech size={18} />}
          hint={`${k.avgEngagementRate}% rate`}
        />
        <KpiCard
          label="Posts published"
          value={k.totalPosts}
          accent="sage"
          icon={<Icons.puzzle size={18} />}
        />
        <KpiCard
          label="Saves"
          value={k.totalSaves}
          accent="peach"
          icon={<Icons.tooth size={18} />}
          hint={`${k.totalShares} shares`}
        />
      </div>

      {/* TREND + INSIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem' }} className="ig-grid">
        <Card
          eyebrow="Account growth"
          title={window === '30d' ? 'Daily followers & views' : 'Daily followers & views'}
          description="Follower count over time, paired with content view volume."
        >
          <TrendChart
            data={data.series}
            series={[
              { key: 'followers', label: 'Followers', color: 'var(--pink)' },
              { key: 'views', label: 'Views', color: 'var(--purple)' },
            ]}
            height={280}
          />
        </Card>
        <Card eyebrow="Insights" title="What stood out">
          <InsightsPanel insights={insights} />
        </Card>
      </div>

      {/* MEDIA MIX + 90d SNAPSHOT (only when 365d window) + TOP POSTS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: window === '7d' && data.snapshot90d
            ? 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)'
            : 'minmax(0, 1fr) minmax(0, 2fr)',
          gap: '1.25rem',
        }}
        className="ig-second-row"
      >
        <Card eyebrow="Format mix" title="What we published">
          <DonutChart
            data={Object.entries(k.mediaMix).map(([label, value]) => ({ label, value: value as number }))}
            centerValue={k.totalPosts}
            centerLabel="Posts"
          />
        </Card>

        {window === '7d' && data.snapshot90d && (
          <Card eyebrow="Last 90 days" title="Native IG snapshot">
            <DonutChart
              data={[
                { label: 'Reels', value: data.snapshot90d.reelsShareViews, color: 'var(--pink)' },
                { label: 'Posts', value: data.snapshot90d.postsShareViews, color: 'var(--purple)' },
                { label: 'Stories', value: data.snapshot90d.storiesShareViews, color: 'var(--yellow)' },
              ]}
              centerValue={fmtNum(data.snapshot90d.views)}
              centerLabel="90d views"
            />
            <div style={{ marginTop: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              <SnapshotMetric label="Reach" value={fmtNum(data.snapshot90d.reach)} />
              <SnapshotMetric label="Interactions" value={fmtNum(data.snapshot90d.interactions)} />
              <SnapshotMetric label="Profile visits" value={fmtNum(data.snapshot90d.profileVisits)} />
              <SnapshotMetric label="Link taps" value={fmtNum(data.snapshot90d.externalLinkTaps)} />
            </div>
          </Card>
        )}

        <Card
          eyebrow="Top performers"
          title="Highest engagement posts"
          description={`Ranked by engagement rate (≥50 views).`}
        >
          <TopPostsList
            channel="instagram"
            posts={data.topPosts.slice(0, 5).map((p) => ({
              date: p.date,
              caption: p.caption,
              link: p.link,
              type: p.mediaType,
              primaryMetric: { label: 'engagement rate', value: `${p.engRate}%` },
              secondaryMetrics: [
                { label: 'views', value: p.views },
                { label: 'reach', value: p.reach },
                { label: 'likes', value: p.likes },
              ],
            }))}
          />
        </Card>
      </div>

      {/* AUDIENCE HEATMAP - 30d only since data is per-week */}
      {window === '30d' && data.audienceHeatmap && data.audienceHeatmap.length > 0 && (
        <Card
          eyebrow="When followers are active"
          title="Most active times (week of Apr 15–21)"
          description="Followers online, hour by hour. Use this to time your posts."
        >
          <ActivityHeatmap data={data.audienceHeatmap} />
        </Card>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .ig-grid { grid-template-columns: 1fr !important; }
          .ig-second-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SnapshotMetric({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--canvas-warm)',
        padding: '0.625rem 0.75rem',
        borderRadius: 'var(--r-card-sm)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--t-eyebrow)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--ink-70)',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginTop: '0.125rem',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActivityHeatmap({ data }: { data: Array<{ hour: number; [day: string]: number }> }) {
  const days = Object.keys(data[0]).filter((k) => k !== 'hour');
  // Find max value
  let max = 0;
  data.forEach((row) => {
    days.forEach((d) => {
      const v = Number(row[d] ?? 0);
      if (v > max) max = v;
    });
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 'var(--t-small)', minWidth: 600 }}>
        <thead>
          <tr>
            <th />
            {days.map((d) => (
              <th
                key={d}
                style={{
                  padding: '0.4rem 0.4rem',
                  fontWeight: 600,
                  color: 'var(--ink-70)',
                  fontSize: 'var(--t-eyebrow)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                {d.split(' ')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            // Show every 2 hours to keep table compact
            const hour = row.hour;
            if (hour % 2 !== 0) return null;
            return (
              <tr key={hour}>
                <th
                  style={{
                    padding: '0.3rem 0.5rem 0.3rem 0',
                    textAlign: 'right',
                    color: 'var(--ink-70)',
                    fontWeight: 500,
                    fontSize: 'var(--t-eyebrow)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {hour === 0 ? '12a' : hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`}
                </th>
                {days.map((d) => {
                  const v = Number(row[d] ?? 0);
                  const intensity = max > 0 ? v / max : 0;
                  return (
                    <td
                      key={d}
                      title={`${d} ${hour}:00 — ${v.toLocaleString()} active`}
                      style={{
                        padding: 0,
                        height: 22,
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          margin: '2px',
                          height: 18,
                          background: `rgba(241, 137, 181, ${0.06 + intensity * 0.94})`,
                          borderRadius: 4,
                          color: intensity > 0.6 ? 'var(--ink)' : 'transparent',
                          fontSize: 10,
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 600,
                        }}
                      >
                        {intensity > 0.5 ? fmtNum(v) : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
