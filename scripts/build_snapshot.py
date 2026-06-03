"""
Build the comprehensive snapshot.json for the OnDiem Social Performance Dashboard.

Output structure:
{
  generated_at: ISO,
  period_label: "Apr 27, 2026",
  channels: {
    facebook: { "365d": {...}, "30d": {...} },
    instagram: { "365d": {...}, "30d": {...} },
    linkedin: { "365d": {...}, "30d": {...} }
  }
}

Per-window content:
  kpis: { followers, reach, engagement, views, ... }
  series: [{date, ...}]    // time-series for charts
  posts: [{date, caption, type, eng_rate, likes, comments, ...}]    // top posts
  breakdowns: { mediaType, location, jobFunction, etc. }
"""
import pandas as pd
import json
import re
from datetime import datetime
from pathlib import Path

DATA = Path('/home/claude/data')

# -------------------------------------------------------------------- helpers
def pct_to_float(s):
    """'1.4%' -> 0.014"""
    if pd.isna(s) or s == '': return None
    if isinstance(s, (int, float)): return float(s)
    return float(str(s).replace('%','').strip()) / 100.0

def safe_int(v):
    if pd.isna(v) or v == '': return 0
    try: return int(float(v))
    except: return 0

def safe_float(v):
    if pd.isna(v) or v == '': return 0.0
    try: return float(v)
    except: return 0.0

def parse_date(s, fmts):
    if pd.isna(s): return None
    for fmt in fmts:
        try: return datetime.strptime(str(s), fmt)
        except ValueError: continue
    return None

# -------------------------------------------------------------------- LinkedIn
def build_linkedin():
    fxls = pd.ExcelFile(DATA / 'linkedin_followers.xls')
    vxls = pd.ExcelFile(DATA / 'linkedin_visitors.xls')
    cxls = pd.ExcelFile(DATA / 'linkedin_content.xls')

    # Followers daily new
    nf = pd.read_excel(fxls, 'New followers')
    nf.columns = ['date','sponsored','organic','auto_invited','total_new']
    nf['date'] = pd.to_datetime(nf['date'])

    # Visitor metrics daily
    vm = pd.read_excel(vxls, 'Visitor metrics')
    vm['Date'] = pd.to_datetime(vm['Date'])

    # Content metrics daily
    cm = pd.read_excel(cxls, 'Metrics', header=1)
    cm['Date'] = pd.to_datetime(cm['Date'])

    # All posts
    posts = pd.read_excel(cxls, 'All posts', header=1)
    posts['Created date'] = pd.to_datetime(posts['Created date'], errors='coerce')

    # Demographics (cumulative)
    def demo(xls, sheet, top=10):
        df = pd.read_excel(xls, sheet)
        df.columns = ['label','value']
        df['value'] = pd.to_numeric(df['value'], errors='coerce').fillna(0).astype(int)
        df = df.sort_values('value', ascending=False).head(top)
        return [{'label': r['label'], 'value': int(r['value'])} for _, r in df.iterrows()]

    follower_demo = {
        'location': demo(fxls, 'Location'),
        'jobFunction': demo(fxls, 'Job function'),
        'seniority': demo(fxls, 'Seniority'),
        'industry': demo(fxls, 'Industry'),
        'companySize': demo(fxls, 'Company size'),
    }
    visitor_demo = {
        'location': demo(vxls, 'Location'),
        'jobFunction': demo(vxls, 'Job function'),
        'seniority': demo(vxls, 'Seniority'),
        'industry': demo(vxls, 'Industry'),
        'companySize': demo(vxls, 'Company size'),
    }

    # Build aggregates for both windows
    def slice_window(days):
        nf_w = nf.tail(days).copy()
        vm_w = vm.tail(days).copy()
        cm_w = cm.tail(days).copy()
        # Posts in window
        cutoff = vm['Date'].max() - pd.Timedelta(days=days)
        p_w = posts[posts['Created date'] >= cutoff].copy()

        kpis = {
            'newFollowers': int(nf_w['total_new'].sum()),
            'pageViews': int(vm_w['Total page views (total)'].sum()),
            'uniqueVisitors': int(vm_w['Total unique visitors (total)'].sum()),
            'mobileShare': round(vm_w['Total page views (mobile)'].sum() /
                                 max(1, vm_w['Total page views (total)'].sum()) * 100, 1),
            'impressions': int(cm_w['Impressions (organic)'].sum()),
            'clicks': int(cm_w['Clicks (organic)'].sum()),
            'reactions': int(cm_w['Reactions (organic)'].sum()),
            'comments': int(cm_w['Comments (organic)'].sum()),
            'reposts': int(cm_w['Reposts (organic)'].sum()),
            'engagements': int(cm_w['Reactions (organic)'].sum() +
                               cm_w['Comments (organic)'].sum() +
                               cm_w['Reposts (organic)'].sum()),
            'engagementRate': round(
                (cm_w['Reactions (organic)'].sum() + cm_w['Comments (organic)'].sum() +
                 cm_w['Reposts (organic)'].sum()) /
                max(1, cm_w['Impressions (organic)'].sum()) * 100, 2),
            'postCount': int(len(p_w)),
        }

        # Series (downsample 365 -> weekly, 30 stays daily)
        if days > 30:
            series_df = vm_w.set_index('Date').resample('W').sum().reset_index()
            cm_series = cm_w.set_index('Date').resample('W').sum().reset_index()
            nf_series = nf_w.set_index('date').resample('W').sum().reset_index()
        else:
            series_df = vm_w.copy()
            cm_series = cm_w.copy()
            nf_series = nf_w.copy()

        # Merge into single time series
        series = []
        for _, row in series_df.iterrows():
            d = row['Date'].strftime('%Y-%m-%d')
            cm_match = cm_series[cm_series['Date'] == row['Date']]
            nf_match = nf_series[nf_series['date'] == row['Date']]
            series.append({
                'date': d,
                'pageViews': int(row['Total page views (total)']),
                'uniqueVisitors': int(row['Total unique visitors (total)']),
                'impressions': int(cm_match['Impressions (organic)'].iloc[0]) if len(cm_match) else 0,
                'engagements': int(cm_match['Reactions (organic)'].iloc[0] +
                                  cm_match['Comments (organic)'].iloc[0] +
                                  cm_match['Reposts (organic)'].iloc[0]) if len(cm_match) else 0,
                'newFollowers': int(nf_match['total_new'].iloc[0]) if len(nf_match) else 0,
            })

        # Top posts (by engagement rate, must have >= 50 impressions to be meaningful)
        p_sorted = p_w[p_w['Impressions'] >= 50].sort_values('Engagement rate', ascending=False).head(8)
        top_posts = []
        for _, row in p_sorted.iterrows():
            title = str(row['Post title'])[:200] if pd.notna(row['Post title']) else ''
            title = re.sub(r'\s+', ' ', title).strip()
            top_posts.append({
                'date': row['Created date'].strftime('%Y-%m-%d'),
                'caption': title,
                'link': row['Post link'] if pd.notna(row['Post link']) else None,
                'impressions': safe_int(row['Impressions']),
                'clicks': safe_int(row['Clicks']),
                'likes': safe_int(row['Likes']),
                'comments': safe_int(row['Comments']),
                'reposts': safe_int(row['Reposts']),
                'engRate': safe_float(row['Engagement rate']),
                'postType': row['Post type'] if pd.notna(row['Post type']) else 'Organic',
            })

        return {
            'kpis': kpis,
            'series': series,
            'topPosts': top_posts,
            'pageBreakdown': {
                'overview': int(vm_w['Overview page views (total)'].sum()),
                'jobs': int(vm_w['Jobs page views (total)'].sum()),
                'life': int(vm_w['Life page views (total)'].sum()),
            },
            'deviceSplit': {
                'desktop': int(vm_w['Total page views (desktop)'].sum()),
                'mobile': int(vm_w['Total page views (mobile)'].sum()),
            },
            'followerDemographics': follower_demo,
            'visitorDemographics': visitor_demo,
        }

    return {
        '365d': slice_window(365),
        '30d': slice_window(30),
    }

# -------------------------------------------------------------------- Instagram
def build_instagram():
    g30 = pd.read_csv(DATA / 'Profile_Growth_and_Discovery_27-03-2026_to_27-04-2026.CSV')
    g365 = pd.read_csv(DATA / 'Profile_Growth_and_Discovery_01-07-2025_to_27-04-2026.CSV')
    p30 = pd.read_csv(DATA / 'Detailed_Post_Performance_29-03-2026_to_29-04-2026.CSV')
    p365 = pd.read_csv(DATA / 'Detailed_Post_Performance_27-04-2025_to_27-04-2026.CSV')
    reels = pd.read_csv(DATA / 'Detailed_Reel_Performance_29-03-2026_to_29-04-2026.CSV')
    ae = pd.read_csv(DATA / 'Audience_Engagement_16-04-2026_to_22-04-2026.CSV')

    # Parse dates
    for df in [g30, g365]:
        df['date_parsed'] = pd.to_datetime(df['Date'], format='%B %d, %Y', errors='coerce')
    for df in [p30, p365]:
        df['date_parsed'] = pd.to_datetime(df['Time Posted'], format='%b %d, %Y %I:%M:%S %p', errors='coerce')
    reels['date_parsed'] = pd.to_datetime(reels['Time Posted'], format='%b %d, %Y %I:%M:%S %p', errors='coerce')

    # Clean engagement rate to numeric
    def cer(s):
        if pd.isna(s): return 0.0
        if isinstance(s, str): return float(s.replace('%','').strip())/100.0
        return float(s)/100.0 if s > 1 else float(s)
    for df in [p30, p365]:
        df['eng_rate'] = df['Engagement Rate'].apply(cer)
        for col in ['Engagements','Followers','Views','Reach','Likes','Comments','Saves','Shares','Reposts']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

    reels['eng_rate'] = reels['Engagement Rate'].apply(cer)

    # 90-day screenshot KPIs from the user
    snapshot_90d = {
        'views': 45937,
        'reach': 6158,
        'interactions': 1318,
        'accountsEngaged': 798,
        'totalFollowers': 3055,
        'profileVisits': 440,
        'externalLinkTaps': 76,
        'reelsShareViews': 82.2,
        'postsShareViews': 10.6,
        'storiesShareViews': 7.2,
        'reelsShareInteractions': 81.7,
        'postsShareInteractions': 18.1,
        'storiesShareInteractions': 0.2,
        'followerViewShare': 23.8,
        'nonFollowerViewShare': 76.2,
    }

    # Audience engagement heatmap (1 week, hourly x day-of-week)
    # Cols: Time, Sun..Sat (April 19-25 2026, with 4/15-18 also referenced)
    # Reorder columns by day of week, simple 7-day matrix using parsed date
    day_cols = [c for c in ae.columns if c != 'Time']
    heatmap = []
    for _, row in ae.iterrows():
        # parse hour from "12:00 AM, -04:00 UTC" -> 0 .. 23
        hour_str = str(row['Time']).split(',')[0].strip()  # "12:00 AM"
        hour = datetime.strptime(hour_str, '%I:%M %p').hour
        rec = {'hour': hour}
        for c in day_cols:
            rec[c] = safe_int(row[c])
        heatmap.append(rec)

    def aggregate_posts(df):
        if len(df) == 0: return {}
        eng_total = int(df['Engagements'].sum())
        views_total = int(df['Views'].sum())
        reach_total = int(df['Reach'].sum())
        likes_total = int(df['Likes'].sum())
        comments_total = int(df['Comments'].sum())
        saves_total = int(df['Saves'].sum())
        shares_total = int(df['Shares'].sum())
        # avg engagement rate (weighted by views)
        if views_total > 0:
            avg_er = (eng_total / views_total) * 100
        else:
            avg_er = float(df['eng_rate'].mean() * 100) if len(df) else 0
        # Media type breakdown
        type_counts = df['Media Type (Image, Video, Carousel)'].value_counts().to_dict()
        return {
            'totalPosts': len(df),
            'totalEngagements': eng_total,
            'totalViews': views_total,
            'totalReach': reach_total,
            'totalLikes': likes_total,
            'totalComments': comments_total,
            'totalSaves': saves_total,
            'totalShares': shares_total,
            'avgEngagementRate': round(avg_er, 2),
            'mediaMix': type_counts,
        }

    def top_posts(df, n=8):
        if len(df) == 0: return []
        # Filter to posts with >= 50 views to ensure stability
        d = df[df['Views'] >= 50].copy().sort_values('eng_rate', ascending=False).head(n)
        result = []
        for _, row in d.iterrows():
            cap = str(row['Caption'])[:250] if pd.notna(row['Caption']) else ''
            cap = re.sub(r'\\#', '#', cap)  # Unescape hashtags
            cap = re.sub(r'\s+', ' ', cap).strip()
            d_parsed = row['date_parsed']
            result.append({
                'date': d_parsed.strftime('%Y-%m-%d') if pd.notna(d_parsed) else '',
                'caption': cap,
                'link': row['Instagram Post'] if pd.notna(row['Instagram Post']) else None,
                'mediaType': row['Media Type (Image, Video, Carousel)'],
                'views': safe_int(row['Views']),
                'reach': safe_int(row['Reach']),
                'likes': safe_int(row['Likes']),
                'comments': safe_int(row['Comments']),
                'saves': safe_int(row['Saves']),
                'shares': safe_int(row['Shares']),
                'engagements': safe_int(row['Engagements']),
                'engRate': round(safe_float(row['eng_rate']) * 100, 2),
            })
        return result

    # Daily series from g30 (chronological)
    series_30 = []
    for _, row in g30.sort_values('date_parsed').iterrows():
        if pd.isna(row['date_parsed']): continue
        series_30.append({
            'date': row['date_parsed'].strftime('%Y-%m-%d'),
            'followers': safe_int(row['Followers']),
            'views': safe_int(row['Views']),
            'reach': safe_int(row['Reach']),
        })

    # Weekly series from g365 - dataset is messy (has 'followers only' rows + 'engagement only' rows)
    # The first ~35 rows are followers-by-week; next rows are views/reach-by-week
    g365_followers = g365[g365['Followers'].notna()].sort_values('date_parsed')
    g365_engagement = g365[g365['Followers'].isna() & g365['Views'].notna()].sort_values('date_parsed')

    series_365 = []
    for _, row in g365_followers.iterrows():
        if pd.isna(row['date_parsed']): continue
        series_365.append({
            'date': row['date_parsed'].strftime('%Y-%m-%d'),
            'followers': safe_int(row['Followers']),
            'views': 0,
            'reach': 0,
        })
    # Merge the engagement rows
    eng_lookup = {}
    for _, row in g365_engagement.iterrows():
        if pd.isna(row['date_parsed']): continue
        eng_lookup[row['date_parsed'].strftime('%Y-%m-%d')] = {
            'views': safe_int(row['Views']),
            'reach': safe_int(row['Reach']),
        }
    # Find nearest follower-week for each engagement-week (data is offset slightly)
    for entry in series_365:
        if entry['date'] in eng_lookup:
            entry.update(eng_lookup[entry['date']])
    # Also try ±3 day match
    for entry in series_365:
        if entry['views'] == 0:
            d = datetime.strptime(entry['date'], '%Y-%m-%d')
            for k, v in eng_lookup.items():
                kd = datetime.strptime(k, '%Y-%m-%d')
                if abs((d - kd).days) <= 3:
                    entry['views'] = v['views']
                    entry['reach'] = v['reach']
                    break

    # 30d window
    latest_followers_30 = next((r['followers'] for r in reversed(series_30) if r['followers'] > 0), 3061)
    earliest_followers_30 = next((r['followers'] for r in series_30 if r['followers'] > 0), 3054)
    g30_views_total = int(g30['Views'].fillna(0).sum())
    g30_reach_total = int(g30['Reach'].fillna(0).sum())

    win_30 = {
        'kpis': {
            'totalFollowers': latest_followers_30,
            'followerChange': latest_followers_30 - earliest_followers_30,
            'totalViews': g30_views_total,
            'totalReach': g30_reach_total,
            'totalReposts': int(g30['Reposts'].fillna(0).sum()),
            **{k: v for k, v in aggregate_posts(p30).items() if k != 'mediaMix'},
            'mediaMix': aggregate_posts(p30).get('mediaMix', {}),
        },
        'series': series_30,
        'topPosts': top_posts(p30),
        'reels': {
            'count': len(reels),
            'totalViews': int(reels['Views'].fillna(0).astype(int).sum() if len(reels) else 0),
            'avgEngRate': round(reels['eng_rate'].mean() * 100, 2) if len(reels) else 0,
        },
        'audienceHeatmap': heatmap,
    }

    # 365d window — IG export uses weekly cadence
    latest_followers_365 = max([r['followers'] for r in series_365 if r['followers'] > 0])
    earliest_followers_365 = min([r['followers'] for r in series_365 if r['followers'] > 0])
    win_365 = {
        'kpis': {
            'totalFollowers': latest_followers_30,  # use latest from 30d (most recent)
            'followerChange': latest_followers_365 - earliest_followers_365,
            'totalViews': sum(r['views'] for r in series_365),
            'totalReach': sum(r['reach'] for r in series_365),
            **{k: v for k, v in aggregate_posts(p365).items() if k != 'mediaMix'},
            'mediaMix': aggregate_posts(p365).get('mediaMix', {}),
        },
        'series': series_365,
        'topPosts': top_posts(p365, n=10),
        'snapshot90d': snapshot_90d,
    }

    return {'365d': win_365, '30d': win_30}

# -------------------------------------------------------------------- Facebook
def build_facebook():
    fb = pd.read_csv(DATA / 'Jul-01-2025_Apr-27-2026_1296136025813332.csv')
    fb['Publish time'] = pd.to_datetime(fb['Publish time'], format='%m/%d/%Y %H:%M', errors='coerce')

    # Parse FB content formats (stacked tables, UTF-16)
    with open(DATA / 'ondiem-top_content_formats-facebook.csv', 'rb') as f:
        raw = f.read().decode('utf-16')
    lines = [l for l in raw.split('\n') if l.strip() and not l.startswith('sep=')]
    # Three sections: interactions / views / published
    def parse_section(start_idx):
        title = lines[start_idx].strip().strip('"')
        cols = [c.strip().strip('"') for c in lines[start_idx+1].split(',')]
        vals = [int(c.strip().strip('"')) for c in lines[start_idx+2].split(',')]
        return title, dict(zip(cols, vals))

    interactions = parse_section(0)[1]
    views = parse_section(3)[1]
    published = parse_section(6)[1]

    fb_content_formats = {
        'interactions': interactions,
        'views': views,
        'published': published,
    }

    # Determine windows
    latest_date = fb['Publish time'].max()
    cutoff_30 = latest_date - pd.Timedelta(days=30)
    cutoff_365 = latest_date - pd.Timedelta(days=365)

    def window_aggregate(df_w):
        if len(df_w) == 0:
            return {}
        # Strip ad/paid columns - we focus on organic only
        return {
            'totalPosts': len(df_w),
            'totalViews': safe_int(df_w['Views'].sum()),
            'totalReach': safe_int(df_w['Reach'].sum()),
            'totalReactions': safe_int(df_w['Reactions'].sum()),
            'totalComments': safe_int(df_w['Comments'].sum()),
            'totalShares': safe_int(df_w['Shares'].sum()),
            'totalEngagements': safe_int(
                df_w['Reactions'].sum() + df_w['Comments'].sum() + df_w['Shares'].sum()
            ),
            'totalClicks': safe_int(df_w['Total clicks'].sum()),
            'totalLinkClicks': safe_int(df_w['Link Clicks'].sum()),
            'avgEngagementRate': round(
                (df_w['Reactions'].sum() + df_w['Comments'].sum() + df_w['Shares'].sum()) /
                max(1, df_w['Reach'].sum()) * 100, 2),
            'postTypeMix': df_w['Post type'].value_counts().to_dict(),
        }

    def top_posts_fb(df_w, n=8):
        if len(df_w) == 0: return []
        # Use engagement (R+C+S) / Reach as engagement rate
        d = df_w[df_w['Reach'] >= 50].copy()
        d['er'] = (d['Reactions'] + d['Comments'] + d['Shares']) / d['Reach'].replace(0, 1)
        d = d.sort_values('er', ascending=False).head(n)
        result = []
        for _, row in d.iterrows():
            cap = str(row['Title'])[:250] if pd.notna(row['Title']) else ''
            cap = re.sub(r'\s+', ' ', cap).strip()
            result.append({
                'date': row['Publish time'].strftime('%Y-%m-%d') if pd.notna(row['Publish time']) else '',
                'caption': cap,
                'link': row['Permalink'] if pd.notna(row['Permalink']) else None,
                'postType': row['Post type'] if pd.notna(row['Post type']) else '',
                'views': safe_int(row['Views']),
                'reach': safe_int(row['Reach']),
                'reactions': safe_int(row['Reactions']),
                'comments': safe_int(row['Comments']),
                'shares': safe_int(row['Shares']),
                'totalClicks': safe_int(row['Total clicks']),
                'engRate': round(float(row['er']) * 100, 2),
            })
        return result

    # Build series
    def build_series(df_w, freq):
        s = df_w.copy()
        s['date'] = s['Publish time'].dt.to_period(freq).dt.start_time
        agg = s.groupby('date').agg(
            views=('Views','sum'),
            reach=('Reach','sum'),
            engagements=('Reactions','sum'),
            comments=('Comments','sum'),
            shares=('Shares','sum'),
            posts=('Post ID','count')
        ).reset_index()
        return [{'date': r['date'].strftime('%Y-%m-%d'),
                 'views': int(r['views']), 'reach': int(r['reach']),
                 'engagements': int(r['engagements'] + r['comments'] + r['shares']),
                 'posts': int(r['posts'])} for _, r in agg.iterrows()]

    fb_30 = fb[fb['Publish time'] >= cutoff_30]
    fb_365 = fb[fb['Publish time'] >= cutoff_365]

    return {
        '365d': {
            'kpis': window_aggregate(fb_365),
            'series': build_series(fb_365, 'W'),
            'topPosts': top_posts_fb(fb_365, n=10),
            'contentFormats': fb_content_formats,
        },
        '30d': {
            'kpis': window_aggregate(fb_30),
            'series': build_series(fb_30, 'D'),
            'topPosts': top_posts_fb(fb_30, n=8),
        },
    }

# -------------------------------------------------------------------- main
def main():
    snapshot = {
        'generatedAt': datetime.utcnow().isoformat() + 'Z',
        'periodEnd': '2026-04-28',
        'channels': {
            'facebook': build_facebook(),
            'instagram': build_instagram(),
            'linkedin': build_linkedin(),
        }
    }
    out = DATA / 'snapshot.json'
    with open(out, 'w') as f:
        json.dump(snapshot, f, indent=2, default=str)
    print(f'Wrote {out} ({out.stat().st_size:,} bytes)')

    # Quick sanity check
    print()
    print('=== SANITY CHECK ===')
    for ch in ['facebook','instagram','linkedin']:
        for w in ['365d','30d']:
            kpis = snapshot['channels'][ch][w].get('kpis', {})
            top_n = len(snapshot['channels'][ch][w].get('topPosts', []))
            print(f'  {ch:>10s} {w}: {len(kpis)} kpis, {top_n} top posts')

if __name__ == '__main__':
    main()
