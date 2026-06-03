/**
 * Rule-based insights engine
 * Derives plain-language observations from the channel + window snapshot.
 */

import type { ChannelWindow, FacebookWindow, InstagramWindow, LinkedInWindow } from './types';

export type Insight = {
  kind: 'positive' | 'caution' | 'neutral';
  headline: string;
  body: string;
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000) return Math.round(n / 1000) + 'K';
  if (n >= 1_000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function generateInsights(
  channel: 'facebook' | 'instagram' | 'linkedin',
  window: '30d' | '7d',
  data: ChannelWindow,
): Insight[] {
  const insights: Insight[] = [];
  const k = data.kpis as Record<string, number | object>;
  const windowLabel = window === '30d' ? 'last 30 days' : 'past year';

  if (channel === 'instagram') {
    const ig = data as InstagramWindow;
    const igk = ig.kpis;
    if (igk.followerChange > 0) {
      insights.push({
        kind: 'positive',
        headline: `+${igk.followerChange} followers in the ${windowLabel}`,
        body: `Reached ${fmtNum(igk.totalFollowers)} total followers. Organic growth driven by event content and educational reels.`,
      });
    }
    if (igk.totalViews > 0 && igk.totalEngagements > 0) {
      const er = igk.avgEngagementRate;
      if (er >= 2) {
        insights.push({
          kind: 'positive',
          headline: `${er}% average engagement rate on posts`,
          body: `${fmtNum(igk.totalEngagements)} interactions across ${igk.totalPosts} ${igk.totalPosts === 1 ? 'post' : 'posts'} — well above the dental industry benchmark of ~1%.`,
        });
      } else {
        insights.push({
          kind: 'neutral',
          headline: `${er}% average engagement rate`,
          body: `${fmtNum(igk.totalViews)} total views with ${fmtNum(igk.totalReach)} unique accounts reached.`,
        });
      }
    }
    // Top post highlight
    if (ig.topPosts.length > 0) {
      const tp = ig.topPosts[0];
      insights.push({
        kind: 'neutral',
        headline: `Top post: ${tp.engRate}% engagement rate`,
        body: `${tp.mediaType.charAt(0).toUpperCase() + tp.mediaType.slice(1)} from ${tp.date} reached ${fmtNum(tp.reach)} accounts with ${fmtNum(tp.engagements)} engagements.`,
      });
    }
    // Media mix
    if (igk.mediaMix) {
      const mix = igk.mediaMix as Record<string, number>;
      const total = Object.values(mix).reduce((a, b) => a + b, 0);
      const top = Object.entries(mix).sort((a, b) => b[1] - a[1])[0];
      if (top && total > 0) {
        const pct = Math.round((top[1] / total) * 100);
        insights.push({
          kind: 'neutral',
          headline: `${pct}% of posts are ${top[0]}s`,
          body: `Mixing ${Object.keys(mix).join(', ')} formats. Carousels typically drive saves; reels drive reach.`,
        });
      }
    }
  }

  if (channel === 'linkedin') {
    const li = data as LinkedInWindow;
    const lk = li.kpis;
    if (lk.newFollowers > 0) {
      insights.push({
        kind: 'positive',
        headline: `+${lk.newFollowers} new followers`,
        body: `All organic — no paid follower campaigns running. ${fmtNum(lk.uniqueVisitors)} unique visitors to the company page.`,
      });
    }
    if (lk.engagementRate > 2) {
      insights.push({
        kind: 'positive',
        headline: `${lk.engagementRate}% engagement rate on impressions`,
        body: `${fmtNum(lk.engagements)} reactions, comments, and reposts on ${fmtNum(lk.impressions)} organic impressions.`,
      });
    }
    if (lk.clicks > lk.impressions * 0.1) {
      insights.push({
        kind: 'positive',
        headline: `Strong click-through on content`,
        body: `${fmtNum(lk.clicks)} clicks across ${fmtNum(lk.impressions)} impressions — a CTR of ${((lk.clicks / lk.impressions) * 100).toFixed(1)}%.`,
      });
    }
    if (lk.mobileShare && lk.mobileShare > 30) {
      insights.push({
        kind: 'neutral',
        headline: `${lk.mobileShare}% of page views are mobile`,
        body: `Desktop still dominates LinkedIn page views. Continue optimizing visuals for both surfaces.`,
      });
    }
    if (li.topPosts.length > 0) {
      const tp = li.topPosts[0];
      insights.push({
        kind: 'neutral',
        headline: `Top post: ${(tp.engRate * 100).toFixed(1)}% engagement rate`,
        body: `From ${tp.date} — earned ${tp.likes} likes, ${tp.comments} comments, ${tp.reposts} reposts on ${fmtNum(tp.impressions)} impressions.`,
      });
    }
  }

  if (channel === 'facebook') {
    const fb = data as FacebookWindow;
    const fk = fb.kpis;
    if (fk.totalPosts === 0) {
      insights.push({
        kind: 'caution',
        headline: 'No posts in this window',
        body: 'Consider a more frequent publishing cadence to maintain audience visibility.',
      });
      return insights;
    }
    if (fk.avgEngagementRate >= 2) {
      insights.push({
        kind: 'positive',
        headline: `${fk.avgEngagementRate}% engagement rate on reach`,
        body: `${fmtNum(fk.totalEngagements)} reactions, comments, and shares across ${fmtNum(fk.totalReach)} reached accounts.`,
      });
    } else {
      insights.push({
        kind: 'neutral',
        headline: `${fk.avgEngagementRate}% engagement rate`,
        body: `${fmtNum(fk.totalEngagements)} interactions across ${fk.totalPosts} ${fk.totalPosts === 1 ? 'post' : 'posts'}.`,
      });
    }
    if (fk.totalViews > 0) {
      insights.push({
        kind: 'neutral',
        headline: `${fmtNum(fk.totalViews)} total views`,
        body: `${fmtNum(fk.totalReach)} unique accounts reached. ${fk.totalLinkClicks} link clicks drove traffic to ondiem.com.`,
      });
    }
    if (fb.topPosts.length > 0) {
      const tp = fb.topPosts[0];
      const cap = (tp.caption || '').slice(0, 80);
      insights.push({
        kind: 'neutral',
        headline: `Top post: ${tp.engRate}% engagement rate`,
        body: `${tp.postType} from ${tp.date}${cap ? ': "' + cap + '..."' : ''}`,
      });
    }
    if (fk.postTypeMix) {
      const mix = fk.postTypeMix as Record<string, number>;
      const total = Object.values(mix).reduce((a, b) => a + b, 0);
      const photos = mix['Photos'] || 0;
      if (photos / total > 0.6) {
        insights.push({
          kind: 'neutral',
          headline: `Photo-heavy posting mix`,
          body: `${photos} of ${total} posts are photo posts. Reels and link posts may unlock different reach patterns.`,
        });
      }
    }
  }

  return insights;
}
