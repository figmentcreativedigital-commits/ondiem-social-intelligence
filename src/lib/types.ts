/**
 * Type definitions for the OnDiem dashboard snapshot.
 * Mirrors the shape produced by build_snapshot.py.
 */

export type ChannelName = 'facebook' | 'instagram' | 'linkedin';
export type WindowKey = '30d' | '7d';

// — Common —
export type SeriesPoint = {
  date: string;
  [metric: string]: string | number;
};

export type DemographicEntry = {
  label: string;
  value: number;
};

// — LinkedIn —
export type LinkedInPost = {
  date: string;
  caption: string;
  link: string | null;
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  reposts: number;
  engRate: number;
  postType: string;
};

export type LinkedInKpis = {
  newFollowers: number;
  pageViews: number;
  uniqueVisitors: number;
  mobileShare: number;
  impressions: number;
  clicks: number;
  reactions: number;
  comments: number;
  reposts: number;
  engagements: number;
  engagementRate: number;
  postCount: number;
};

export type LinkedInWindow = {
  kpis: LinkedInKpis;
  series: Array<{ date: string; pageViews: number; uniqueVisitors: number; impressions: number; engagements: number; newFollowers: number }>;
  topPosts: LinkedInPost[];
  pageBreakdown: { overview: number; jobs: number; life: number };
  deviceSplit: { desktop: number; mobile: number };
  followerDemographics: {
    location: DemographicEntry[];
    jobFunction: DemographicEntry[];
    seniority: DemographicEntry[];
    industry: DemographicEntry[];
    companySize: DemographicEntry[];
  };
  visitorDemographics: {
    location: DemographicEntry[];
    jobFunction: DemographicEntry[];
    seniority: DemographicEntry[];
    industry: DemographicEntry[];
    companySize: DemographicEntry[];
  };
};

// — Instagram —
export type InstagramPost = {
  date: string;
  caption: string;
  link: string | null;
  mediaType: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  engagements: number;
  engRate: number;
};

export type InstagramKpis = {
  totalFollowers: number;
  followerChange: number;
  totalViews: number;
  totalReach: number;
  totalReposts?: number;
  totalPosts: number;
  totalEngagements: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  totalShares: number;
  avgEngagementRate: number;
  mediaMix: Record<string, number>;
};

export type InstagramWindow = {
  kpis: InstagramKpis;
  prev?: { views?: number; engagements?: number };
  series: Array<{ date: string; followers: number; views: number; reach: number }>;
  topPosts: InstagramPost[];
  reels?: { count: number; totalViews: number; avgEngRate: number };
  audienceHeatmap?: Array<{ hour: number; [day: string]: number }>;
  snapshot90d?: {
    views: number;
    reach: number;
    interactions: number;
    accountsEngaged: number;
    totalFollowers: number;
    profileVisits: number;
    externalLinkTaps: number;
    reelsShareViews: number;
    postsShareViews: number;
    storiesShareViews: number;
    reelsShareInteractions: number;
    postsShareInteractions: number;
    storiesShareInteractions: number;
    followerViewShare: number;
    nonFollowerViewShare: number;
  };
};

// — Facebook —
export type FacebookPost = {
  date: string;
  caption: string;
  link: string | null;
  postType: string;
  views: number;
  reach: number;
  reactions: number;
  comments: number;
  shares: number;
  totalClicks: number;
  engRate: number;
};

export type FacebookKpis = {
  totalPosts: number;
  totalViews: number;
  totalReach: number;
  totalReactions: number;
  totalComments: number;
  totalShares: number;
  totalEngagements: number;
  totalClicks: number;
  totalLinkClicks: number;
  avgEngagementRate: number;
  postTypeMix: Record<string, number>;
};

export type FacebookWindow = {
  kpis: FacebookKpis;
  prev?: { views?: number; engagements?: number };
  series: Array<{ date: string; views: number; reach: number; engagements: number; posts: number }>;
  topPosts: FacebookPost[];
  contentFormats?: {
    interactions: Record<string, number>;
    views: Record<string, number>;
    published: Record<string, number>;
  };
};

// — Combined —
export type ChannelWindow = LinkedInWindow | InstagramWindow | FacebookWindow;

export type Snapshot = {
  generatedAt: string;
  periodEnd: string;
  channels: {
    facebook: { '30d': FacebookWindow; '7d': FacebookWindow };
    instagram: { '30d': InstagramWindow; '7d': InstagramWindow };
    linkedin: { '30d': LinkedInWindow; '7d': LinkedInWindow };
  };
};
