'use client';

/**
 * LinkedInView — composes the dashboard for the LinkedIn channel.
 * Shows: KPI grid · trend chart · post breakdown · top posts · demographics.
 */

import KpiCard from './KpiCard';
import TrendChart from './TrendChart';
import DonutChart from './DonutChart';
import HBarList from './HBarList';
import TopPostsList from './TopPostsList';
import Card from './Card';
import InsightsPanel from './InsightsPanel';
import { Icons } from '@/components/brand';
import type { LinkedInWindow, WindowKey } from '@/lib/types';
import { generateInsights } from '@/lib/insights';
import { computeTrend, fmtNum } from '@/lib/format';

type Props = {
  data: LinkedInWindow;
  window: WindowKey;
};

export default function LinkedInView({ data, window }: Props) {
  const k = data.kpis;
  const insights = generateInsights('linkedin', window, data);

  // Sparkline trends
  const viewsTrend = computeTrend(data.series.map((s) => s.pageViews));
  const engTrend = computeTrend(data.series.map((s) => s.engagements));

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
          label="New followers"
          value={k.newFollowers}
          accent="teal"
          icon={<span style={{ fontSize: 16, color: 'var(--ink)' }}><Icons.heartChat size={18} /></span>}
          hint={`100% organic`}
        />
        <KpiCard
          label="Page views"
          value={k.pageViews}
          accent="purple"
          icon={<Icons.bulb size={18} />}
          trend={viewsTrend}
        />
        <KpiCard
          label="Unique visitors"
          value={k.uniqueVisitors}
          accent="sage"
          icon={<Icons.chat size={18} />}
        />
        <KpiCard
          label="Impressions"
          value={k.impressions}
          accent="pink"
          icon={<Icons.rocket size={18} />}
        />
        <KpiCard
          label="Engagements"
          value={k.engagements}
          accent="yellow"
          icon={<Icons.speech size={18} />}
          trend={engTrend}
          hint={`${k.engagementRate}% rate`}
        />
        <KpiCard
          label="Posts published"
          value={k.postCount}
          accent="peach"
          icon={<Icons.puzzle size={18} />}
        />
      </div>

      {/* TREND + INSIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem' }} className="li-grid">
        <Card
          eyebrow="Performance over time"
          title={window === '30d' ? 'Daily activity' : 'Daily activity'}
          description="Page views and post engagements across the period."
        >
          <TrendChart
            data={data.series}
            series={[
              { key: 'pageViews', label: 'Page views', color: 'var(--teal)' },
              { key: 'engagements', label: 'Engagements', color: 'var(--pink)' },
            ]}
            height={280}
          />
        </Card>
        <Card eyebrow="Insights" title="What stood out">
          <InsightsPanel insights={insights} />
        </Card>
      </div>

      {/* PAGE BREAKDOWN + DEVICE + TOP POSTS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)',
          gap: '1.25rem',
        }}
        className="li-second-row"
      >
        <Card eyebrow="Where they look" title="Page breakdown">
          <DonutChart
            data={[
              { label: 'Overview', value: data.pageBreakdown.overview, color: 'var(--teal)' },
              { label: 'Jobs', value: data.pageBreakdown.jobs, color: 'var(--purple)' },
              { label: 'Life', value: data.pageBreakdown.life, color: 'var(--sage)' },
            ]}
            centerValue={fmtNum(k.pageViews)}
            centerLabel="Page views"
          />
        </Card>
        <Card eyebrow="How they look" title="Device split">
          <DonutChart
            data={[
              { label: 'Desktop', value: data.deviceSplit.desktop, color: 'var(--ink)' },
              { label: 'Mobile', value: data.deviceSplit.mobile, color: 'var(--peach)' },
            ]}
            centerValue={`${k.mobileShare.toFixed(0)}%`}
            centerLabel="Mobile"
          />
        </Card>
        <Card
          eyebrow="Top performers"
          title="Highest engagement posts"
          description="Ranked by engagement rate (impressions ≥ 50 to avoid noise)."
        >
          <TopPostsList
            channel="linkedin"
            posts={data.topPosts.slice(0, 5).map((p) => ({
              date: p.date,
              caption: p.caption,
              link: p.link,
              type: p.postType,
              primaryMetric: { label: 'engagement rate', value: `${(p.engRate * 100).toFixed(1)}%` },
              secondaryMetrics: [
                { label: 'impressions', value: p.impressions },
                { label: 'likes', value: p.likes },
                { label: 'comments', value: p.comments },
              ],
            }))}
          />
        </Card>
      </div>

      {/* AUDIENCE BREAKDOWNS */}
      <Card
        eyebrow="Audience composition"
        title="Who follows onDiem on LinkedIn"
        description={`Cumulative profile of all ${fmtNum(k.newFollowers > 0 ? k.newFollowers + (data.followerDemographics.location?.[0]?.value ?? 0) : 0)} followers — geography, role, and industry mix.`}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h4 style={demoTitle}>Top locations</h4>
            <HBarList data={data.followerDemographics.location} max={6} color="var(--teal)" />
          </div>
          <div>
            <h4 style={demoTitle}>Job functions</h4>
            <HBarList data={data.followerDemographics.jobFunction} max={6} color="var(--sage)" />
          </div>
          <div>
            <h4 style={demoTitle}>Industries</h4>
            <HBarList data={data.followerDemographics.industry} max={6} color="var(--purple)" />
          </div>
          <div>
            <h4 style={demoTitle}>Seniority</h4>
            <HBarList data={data.followerDemographics.seniority} max={6} color="var(--pink)" />
          </div>
          <div>
            <h4 style={demoTitle}>Company size</h4>
            <HBarList data={data.followerDemographics.companySize} max={6} color="var(--peach)" />
          </div>
        </div>
      </Card>

      <style>{`
        @media (max-width: 1024px) {
          .li-grid { grid-template-columns: 1fr !important; }
          .li-second-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const demoTitle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--t-eyebrow)',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-70)',
  marginBottom: '0.75rem',
};
