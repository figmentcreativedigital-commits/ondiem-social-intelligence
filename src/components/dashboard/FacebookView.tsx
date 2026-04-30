'use client';

/**
 * FacebookView — composes the dashboard for the Facebook channel.
 * Note: all metrics shown are organic — paid metrics from the source CSV
 * are intentionally excluded per project scope.
 */

import KpiCard from './KpiCard';
import TrendChart from './TrendChart';
import DonutChart from './DonutChart';
import TopPostsList from './TopPostsList';
import Card from './Card';
import InsightsPanel from './InsightsPanel';
import { Icons } from '@/components/brand';
import type { FacebookWindow, WindowKey } from '@/lib/types';
import { generateInsights } from '@/lib/insights';
import { computeTrend, fmtNum } from '@/lib/format';

type Props = {
  data: FacebookWindow;
  window: WindowKey;
};

export default function FacebookView({ data, window }: Props) {
  const k = data.kpis;
  const insights = generateInsights('facebook', window, data);
  const viewsTrend = computeTrend(data.series.map((s) => s.views));
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
          label="Posts published"
          value={k.totalPosts}
          accent="purple"
          icon={<Icons.puzzle size={18} />}
        />
        <KpiCard
          label="Views"
          value={k.totalViews}
          accent="teal"
          icon={<Icons.bulb size={18} />}
          trend={viewsTrend}
        />
        <KpiCard
          label="Reach"
          value={k.totalReach}
          accent="sage"
          icon={<Icons.rocket size={18} />}
        />
        <KpiCard
          label="Engagements"
          value={k.totalEngagements}
          accent="pink"
          icon={<Icons.speech size={18} />}
          trend={engTrend}
          hint={`${k.avgEngagementRate}% rate`}
        />
        <KpiCard
          label="Total clicks"
          value={k.totalClicks}
          accent="yellow"
          icon={<Icons.heartChat size={18} />}
        />
        <KpiCard
          label="Link clicks"
          value={k.totalLinkClicks}
          accent="peach"
          icon={<Icons.plane size={18} />}
          hint="To ondiem.com"
        />
      </div>

      {/* TREND + INSIGHTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.25rem' }} className="fb-grid">
        <Card
          eyebrow="Performance over time"
          title={window === '30d' ? 'Daily activity' : 'Weekly activity'}
          description="Aggregate views and engagements by publish-week. All organic."
        >
          <TrendChart
            data={data.series}
            series={[
              { key: 'views', label: 'Views', color: 'var(--purple)' },
              { key: 'engagements', label: 'Engagements', color: 'var(--pink)' },
            ]}
            height={280}
          />
        </Card>
        <Card eyebrow="Insights" title="What stood out">
          <InsightsPanel insights={insights} />
        </Card>
      </div>

      {/* CONTENT FORMAT BREAKDOWN + TOP POSTS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: data.contentFormats
            ? 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr)'
            : 'minmax(0, 1fr) minmax(0, 2fr)',
          gap: '1.25rem',
        }}
        className="fb-second-row"
      >
        <Card eyebrow="Format mix" title="Posts by type">
          <DonutChart
            data={Object.entries(k.postTypeMix).map(([label, value]) => ({
              label,
              value: value as number,
            }))}
            centerValue={k.totalPosts}
            centerLabel="Posts"
          />
        </Card>

        {data.contentFormats && (
          <Card eyebrow="Where views come from" title="Views by content type">
            <DonutChart
              data={Object.entries(data.contentFormats.views)
                .filter(([, v]) => (v as number) > 0)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5)
                .map(([label, value]) => ({ label, value: value as number }))}
              centerValue={fmtNum(
                Object.values(data.contentFormats.views).reduce((a, b) => a + (b as number), 0),
              )}
              centerLabel="Total views"
            />
          </Card>
        )}

        <Card
          eyebrow="Top performers"
          title="Highest engagement posts"
          description="Ranked by engagement rate on reach (≥50 reached)."
        >
          <TopPostsList
            channel="facebook"
            posts={data.topPosts.slice(0, 5).map((p) => ({
              date: p.date,
              caption: p.caption,
              link: p.link,
              type: p.postType,
              primaryMetric: { label: 'engagement rate', value: `${p.engRate}%` },
              secondaryMetrics: [
                { label: 'views', value: p.views },
                { label: 'reach', value: p.reach },
                { label: 'reactions', value: p.reactions },
              ],
            }))}
          />
        </Card>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .fb-grid { grid-template-columns: 1fr !important; }
          .fb-second-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
