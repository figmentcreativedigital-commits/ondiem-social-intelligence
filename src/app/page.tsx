"use client";
import { useState, useEffect } from "react";

const FALLBACK_DATA = {
  client: { name: "OnDiem", fullName: "OnDiem", period: "Loading..." },
  ig: { followers: 0, newFollowers: 0, reach: 0, views: 0, engagements: 0, er: 0 },
  fb: { follows: 0, views: 0, viewers: 0, visits: 0, interactions: 0 },
  combined: { reach: 0, views: 0, engagements: 0, er: 0 },
  posts: [] as any[],
  contentMix: { posts: 0, reels: 0, stories: 0 },
  fbContentMix: { stories: 0, photos: 0, reels: 0, multiPhoto: 0 },
  audience: { gender: { male: 50, female: 50 }, age: [{ range: "18-24", pct: 0 },{ range: "25-34", pct: 0 },{ range: "35-44", pct: 0 },{ range: "45-54", pct: 0 },{ range: "55-64", pct: 0 },{ range: "65+", pct: 0 }] },
  viewerSplit: { followers: 50, nonFollowers: 50 },
};
type RD = typeof FALLBACK_DATA;

function genInsights(d: RD) {
  const ins: { title: string; body: string; severity: string }[] = [];
  const opps: typeof ins = [];
  const recs: { text: string; priority: string }[] = [];
  const alerts: typeof ins = [];

  // IG insights
  if (d.ig.er < 3) ins.push({ title: "Instagram: Engagement Below Benchmark", body: "Instagram engagement rate of " + d.ig.er + "% is below the 3%+ target for B2B SaaS accounts. With " + d.ig.views.toLocaleString() + " views, content is being seen but not converting to interactions.", severity: "warning" });
  if (d.ig.newFollowers > 10) ins.push({ title: "Instagram: Healthy Follower Growth", body: "+" + d.ig.newFollowers + " new Instagram followers this week bringing the total to " + d.ig.followers.toLocaleString() + ". Steady organic growth signals rising brand awareness in the dental staffing space.", severity: "success" });
  else opps.push({ title: "Instagram: Follower Growth Stalling", body: "+" + d.ig.newFollowers + " Instagram followers this week. With " + d.ig.reach.toLocaleString() + " reach, the follow-through rate could improve. Strengthen profile CTAs and pin top content.", severity: "warning" });

  // FB insights
  ins.push({ title: "Facebook: Page Visit Activity", body: d.fb.visits + " page visits and " + d.fb.viewers + " viewers this week. Facebook is driving discovery — " + d.fb.interactions + " content interactions and " + d.fb.views + " views show the audience is actively engaging with the page.", severity: "info" });
  opps.push({ title: "Facebook: Video Content Gap", body: "Only " + d.fbContentMix.reels + " Reel published on Facebook vs " + d.fbContentMix.stories + " Stories. Crossposting Instagram Reels to Facebook could significantly boost FB views and engagement with zero extra effort.", severity: "info" });

  // Content insights
  const igSaves = d.posts.filter((p: any) => p.platform === "Instagram").reduce((s: number, p: any) => s + (p.saves || 0), 0);
  if (igSaves < 3) alerts.push({ title: "Instagram: Low Save Behavior", body: "Only " + igSaves + " saves on Instagram this week. Saves are the #1 algorithmic signal — create bookmark-worthy career tips, salary guides, and industry checklists.", severity: "danger" });

  const topAge = d.audience.age.reduce((a, b) => (a.pct > b.pct ? a : b));
  ins.push({ title: "Audience: Core Demographics", body: "Primary audience is " + topAge.range + " (" + topAge.pct + "%) with " + d.audience.gender.female + "% female — well-aligned with dental hygienist and assistant demographics, OnDiem's core user base.", severity: "success" });

  recs.push(
    { text: "Instagram: Create carousel posts with dental career tips — these drive the highest saves and shares in the staffing niche", priority: "high" },
    { text: "Facebook: Crosspost all Instagram Reels to Facebook to double reach with zero additional content creation", priority: "high" },
    { text: "Instagram: Feature real OnDiem users with testimonials and day-in-the-life content from dental professionals", priority: "medium" },
    { text: "Facebook: Boost the Women in DSO post (622 views, 33 clicks) — it has strong organic traction worth amplifying", priority: "medium" },
    { text: "Facebook: Optimize page CTA button for app downloads — " + d.fb.visits + " weekly visits represent untapped conversion potential", priority: "medium" },
    { text: "Both: Post between 9-11 AM and 6-8 PM when dental professionals are most active (before/after shifts)", priority: "low" },
  );
  return { ins, opps, recs, alerts };
}

function AN({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => { if (typeof value !== "number") return; let s = 0; const step = (ts: number) => { if (!s) s = ts; const p = Math.min((ts - s) / 1400, 1); setDisp(Math.floor((1 - Math.pow(1 - p, 4)) * value)); if (p < 1) requestAnimationFrame(step); else setDisp(value); }; requestAnimationFrame(step); }, [value]);
  if (typeof value !== "number") return <span>{value}{suffix}</span>;
  return <span>{disp.toLocaleString()}{suffix}</span>;
}

function Donut({ data, size = 130, stroke = 18, colors }: { data: { value: number }[]; size?: number; stroke?: number; colors: string[] }) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r; let off = 0;
  const total = Math.max(data.reduce((s, x) => s + x.value, 0), 1);
  return (<svg width={size} height={size} viewBox={"0 0 " + size + " " + size} style={{ transform: "rotate(-90deg)" }}>{data.map((d, i) => { const dash = (d.value / total) * C, gap = C - dash, o = off; off += dash; return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={colors[i]} strokeWidth={stroke} strokeDasharray={dash + " " + gap} strokeDashoffset={-o} strokeLinecap="round" style={{ transition: "all 1.2s cubic-bezier(.4,0,.2,1)" }} />; })}</svg>);
}

export default function Dashboard() {
  const [tab, setTab] = useState("instagram");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState<RD>(FALLBACK_DATA);
  const [mediaUrls, setMediaUrls] = useState<Record<number, string>>({});
  const [editingMedia, setEditingMedia] = useState<number | null>(null);
  const [mediaInput, setMediaInput] = useState("");
  const engine = genInsights(d);

  useEffect(() => {
    fetch("/api/sheets").then(r => r.json()).then(data => {
      if (!data.error) { setD(data); const urls: Record<number, string> = {}; (data.posts || []).forEach((p: any) => { if (p.url) urls[p.id] = p.url; }); setMediaUrls(urls); }
      setLoading(false); setTimeout(() => setLoaded(true), 80);
    }).catch(() => { setLoading(false); setTimeout(() => setLoaded(true), 80); });
  }, []);

  const handleMediaSave = (id: number) => { if (mediaInput.trim()) setMediaUrls(p => ({ ...p, [id]: mediaInput.trim() })); setEditingMedia(null); setMediaInput(""); };
  const handleMediaRemove = (id: number) => { setMediaUrls(p => { const n = { ...p }; delete n[id]; return n; }); };
  const isVideo = (u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u);
  const isIgEmbed = (u: string) => /instagram\.com\/(p|reel)\//i.test(u);

  const igPosts = d.posts.filter((p: any) => p.platform === "Instagram");
  const fbPosts = d.posts.filter((p: any) => p.platform === "Facebook");

  const sev: Record<string, { bg: string; border: string; dot: string }> = {
    success: { bg: "rgba(127,207,209,0.10)", border: "rgba(127,207,209,0.30)", dot: "#7FCFD1" },
    warning: { bg: "rgba(242,217,125,0.12)", border: "rgba(242,217,125,0.35)", dot: "#F2D97D" },
    danger: { bg: "rgba(241,137,181,0.10)", border: "rgba(241,137,181,0.30)", dot: "#F189B5" },
    info: { bg: "rgba(117,139,253,0.08)", border: "rgba(117,139,253,0.25)", dot: "#758BFD" },
  };

  function IC({ title, body, severity }: { title: string; body: string; severity: string }) {
    const s = sev[severity] || sev.info;
    return (<div style={{ background: s.bg, border: "1px solid " + s.border, borderRadius: 14, padding: "18px 22px", marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}><div style={{ width: 8, height: 8, borderRadius: 99, background: s.dot, flexShrink: 0 }} /><span style={{ fontWeight: 800, fontSize: 13, color: "#2A3B58" }}>{title}</span></div><div style={{ fontSize: 13, lineHeight: 1.7, color: "#3D4F6A" }}>{body}</div></div>);
  }

  function PostCard({ p, maxViews }: { p: any; maxViews: number }) {
    const url = mediaUrls[p.id];
    const isEd = editingMedia === p.id;
    return (
      <div className={"postcard " + (p.isTop ? "postcard-top" : "")}>
        <div className="postcard-header"><div className="postcard-type-badge">{p.type}</div>{p.isTop && <div className="postcard-top-badge">{"\u2605"} Top Post</div>}</div>
        <div className="postcard-title">{p.title}</div>
        <div className={"postcard-media " + (url ? "has-media" : "")}>
          {!url && !isEd && (<div className="postcard-media-empty" onClick={() => { setEditingMedia(p.id); setMediaInput(""); }}><div className="postcard-empty-inner"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8694A8" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span className="postcard-empty-label">Add Visual</span></div></div>)}
          {isEd && (<div className="postcard-media-input"><input className="media-input" type="text" placeholder="Paste URL..." value={mediaInput} onChange={e => setMediaInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleMediaSave(p.id); if (e.key === "Escape") { setEditingMedia(null); setMediaInput(""); } }} autoFocus /><div className="media-btn-row"><button className="media-btn secondary" onClick={() => { setEditingMedia(null); setMediaInput(""); }}>Cancel</button><button className="media-btn primary" onClick={() => handleMediaSave(p.id)}>Save</button></div></div>)}
          {url && !isEd && (<div className="postcard-media-filled">{isIgEmbed(url) ? (<div className="postcard-ig-crop"><iframe src={url.replace(/\/?(\?.*)?$/, "/embed")} title={p.title} scrolling="no" allowFullScreen /></div>) : isVideo(url) ? (<video controls playsInline><source src={url} /></video>) : (<img src={url} alt={p.title} />)}<div className="postcard-media-actions"><button onClick={() => { setEditingMedia(p.id); setMediaInput(url); }}>{"\u270E"}</button><button onClick={() => handleMediaRemove(p.id)}>{"\u2715"}</button></div></div>)}
        </div>
        <div className="postcard-primary"><div className="postcard-hero-metric"><span className="postcard-hero-val">{p.views?.toLocaleString()}</span><span className="postcard-hero-label">Views</span></div><div className="postcard-hero-divider" /><div className="postcard-hero-metric"><span className="postcard-hero-val">{p.reach?.toLocaleString()}</span><span className="postcard-hero-label">Reach</span></div></div>
        <div className="postcard-perf-bar"><div className="postcard-perf-fill" style={{ width: (p.views / maxViews) * 100 + "%" }} /></div>
        <div className="postcard-secondary">{[{ val: p.likes, label: "Likes" },{ val: p.shares, label: "Shares" },{ val: p.comments, label: "Comments" },{ val: p.saves || 0, label: p.platform === "Facebook" ? "Clicks" : "Saves" }].map(m => (<div key={m.label} className={"postcard-sec-item " + (m.val === 0 ? "zero" : "")}><span className="postcard-sec-val">{m.val}</span><span className="postcard-sec-label">{m.label}</span></div>))}</div>
        {p.clicks > 0 && p.platform === "Facebook" && <div style={{ marginTop: 10, textAlign: "center" as const, fontSize: 11, fontWeight: 700, color: "#758BFD" }}>{p.clicks} total link clicks</div>}
      </div>
    );
  }

  if (loading) return (<div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFAF5", fontFamily: "'Montserrat', sans-serif" }}><div style={{ width: 40, height: 40, border: "3px solid rgba(127,207,209,0.3)", borderTopColor: "#2A3B58", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><div style={{ marginTop: 16, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8694A8" }}>Loading report...</div><style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style></div>);

  return (
    <div className={"root " + (loaded ? "on" : "")}>
      <div className="hdr"><div className="hdr-top"><div><div className="hdr-brand">Figment Creative &middot; Social Intelligence</div><div className="hdr-title">{d.client.fullName}</div><div className="hdr-sub">Social Media Performance &middot; {d.client.period}</div></div><div className="hdr-badge"><div className="hdr-pulse" />Weekly Report</div></div></div>
      <div className="tabs">{[
        { id: "instagram", label: "Instagram", icon: "\u25C9" },
        { id: "facebook", label: "Facebook", icon: "\u25CE" },
        { id: "audience", label: "Audience", icon: "\u25EB" },
        { id: "insights", label: "Insights", icon: "\u2726" },
      ].map(t => (<button key={t.id} className={"tab " + (tab === t.id ? "on" : "")} onClick={() => setTab(t.id)}><span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}</button>))}</div>

      <div className="grid">

        {/* ──────── INSTAGRAM TAB ──────── */}
        {tab === "instagram" && (<>
          <div className="kpi-row">
            {[
              { label: "Followers", value: d.ig.followers, change: d.ig.newFollowers, delay: 0 },
              { label: "Reach", value: d.ig.reach, delay: 80 },
              { label: "Views", value: d.ig.views, delay: 160 },
              { label: "Engagements", value: d.ig.engagements, delay: 240 },
              { label: "Engagement Rate", value: d.ig.er, suffix: "%", delay: 320 },
            ].map((k: any, i) => (<div key={i} className="kpi" style={{ animationDelay: k.delay + "ms" }}><div className="kpi-label">{k.label}</div><div className="kpi-val"><AN value={k.value} suffix={k.suffix || ""} /></div>{k.change > 0 && <div className="kpi-delta"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L12 8H2L7 2Z" fill="#7FCFD1" /></svg>+{k.change} this week</div>}</div>))}
          </div>

          <div className="exec"><div className="card-hd">Instagram Summary</div><div className="exec-cols">
            <div><div className="exec-col-title">Growth</div><div className="exec-col-body">+{d.ig.newFollowers} new followers this week bringing the total to {d.ig.followers.toLocaleString()}. Steady organic growth in the dental staffing community.</div></div>
            <div><div className="exec-col-title">Content</div><div className="exec-col-body">Content mix is {d.contentMix.posts}% Posts, {d.contentMix.reels}% Reels, {d.contentMix.stories}% Stories. Event coverage (Hinman Meeting) generated the highest engagement this week.</div></div>
            <div><div className="exec-col-title">Engagement</div><div className="exec-col-body">{d.ig.er}% rate with {d.ig.engagements} total interactions. Saves remain the critical gap — focus on creating bookmark-worthy career content.</div></div>
          </div></div>

          <div className="cols2">
            <div className="card"><div className="card-hd">Content Mix</div><div style={{ display: "flex", alignItems: "center", gap: 28 }}><Donut data={[{ value: d.contentMix.posts },{ value: d.contentMix.reels },{ value: d.contentMix.stories }]} colors={["#2A3B58","#7FCFD1","#F189B5"]} size={120} stroke={18} /><div style={{ flex: 1 }}>{[{ label: "Posts", value: d.contentMix.posts, color: "#2A3B58" },{ label: "Reels", value: d.contentMix.reels, color: "#7FCFD1" },{ label: "Stories", value: d.contentMix.stories, color: "#F189B5" }].map(item => (<div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}><div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} /><span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.label}</span><span className="display-num">{item.value}%</span></div>))}</div></div></div>
            <div className="card"><div className="card-hd">Engagement Breakdown</div><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{[{ label: "Likes", value: igPosts.reduce((s: number, p: any) => s + (p.likes||0), 0), color: "#2A3B58" },{ label: "Shares", value: igPosts.reduce((s: number, p: any) => s + (p.shares||0), 0), color: "#7FCFD1" },{ label: "Saves", value: igPosts.reduce((s: number, p: any) => s + (p.saves||0), 0), color: "#F189B5" },{ label: "Comments", value: igPosts.reduce((s: number, p: any) => s + (p.comments||0), 0), color: "#758BFD" }].map(m => (<div key={m.label} style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 80, fontSize: 13, fontWeight: 600 }}>{m.label}</div><div style={{ flex: 1, height: 10, background: "rgba(42,59,88,0.05)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: Math.max((m.value / 25) * 100, 2) + "%", height: "100%", background: m.color, borderRadius: 99, transition: "width 1.2s ease" }} /></div><div className="display-num" style={{ width: 30, textAlign: "right" as const }}>{m.value}</div></div>))}</div></div>
          </div>

          {/* IG Posts */}
          <div style={{ marginTop: 4 }}><div className="section-label">Instagram Posts This Week</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
            {igPosts.map((p: any) => <PostCard key={p.id} p={p} maxViews={Math.max(...igPosts.map((x: any) => x.views), 1)} />)}
          </div>
          {engine.alerts.length > 0 && <div>{engine.alerts.map((a, i) => <IC key={i} {...a} />)}</div>}
        </>)}

        {/* ──────── FACEBOOK TAB ──────── */}
        {tab === "facebook" && (<>
          <div className="kpi-row">
            {[
              { label: "New Follows", value: d.fb.follows, delay: 0 },
              { label: "Page Views", value: d.fb.views, delay: 80 },
              { label: "Unique Viewers", value: d.fb.viewers, delay: 160 },
              { label: "Page Visits", value: d.fb.visits, delay: 240 },
              { label: "Interactions", value: d.fb.interactions, delay: 320 },
            ].map((k: any, i) => (<div key={i} className="kpi" style={{ animationDelay: k.delay + "ms" }}><div className="kpi-label">{k.label}</div><div className="kpi-val"><AN value={k.value} /></div></div>))}
          </div>

          <div className="exec"><div className="card-hd">Facebook Summary</div><div className="exec-cols">
            <div><div className="exec-col-title">Visibility</div><div className="exec-col-body">{d.fb.views} page views from {d.fb.viewers} unique viewers. {d.fb.visits} page visits indicate active discovery — people are seeking out the OnDiem Facebook page directly.</div></div>
            <div><div className="exec-col-title">Content</div><div className="exec-col-body">{d.fbContentMix.stories + d.fbContentMix.photos + d.fbContentMix.reels} items published: {d.fbContentMix.stories} Stories, {d.fbContentMix.photos} Photo{d.fbContentMix.photos !== 1 ? "s" : ""}, {d.fbContentMix.reels} Reel{d.fbContentMix.reels !== 1 ? "s" : ""}. Stories dominate the publishing cadence.</div></div>
            <div><div className="exec-col-title">Engagement</div><div className="exec-col-body">{d.fb.interactions} content interactions this week. The Women in DSO post led with 33 total clicks and 11 reactions — event and community content outperforms on Facebook.</div></div>
          </div></div>

          <div className="cols2">
            <div className="card"><div className="card-hd">Published Content</div><div style={{ display: "flex", alignItems: "center", gap: 28 }}><Donut data={[{ value: d.fbContentMix.stories },{ value: d.fbContentMix.photos },{ value: d.fbContentMix.reels }]} colors={["#F189B5","#F9B78E","#7FCFD1"]} size={120} stroke={18} /><div style={{ flex: 1 }}>{[{ label: "Stories", value: d.fbContentMix.stories, color: "#F189B5" },{ label: "Photos", value: d.fbContentMix.photos, color: "#F9B78E" },{ label: "Reels", value: d.fbContentMix.reels, color: "#7FCFD1" }].map(item => (<div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}><div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} /><span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.label}</span><span className="display-num">{item.value}</span></div>))}</div></div></div>
            <div className="card"><div className="card-hd">Facebook Views by Format</div><div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{[{ label: "Stories", value: 1216, color: "#F189B5" },{ label: "Multi-Photo", value: 676, color: "#758BFD" },{ label: "Reels", value: 153, color: "#7FCFD1" },{ label: "Photos", value: 140, color: "#F9B78E" },{ label: "Links", value: 31, color: "#F2D97D" }].map(m => (<div key={m.label} style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 90, fontSize: 13, fontWeight: 600 }}>{m.label}</div><div style={{ flex: 1, height: 10, background: "rgba(42,59,88,0.05)", borderRadius: 99, overflow: "hidden" }}><div style={{ width: Math.max((m.value / 1300) * 100, 1) + "%", height: "100%", background: m.color, borderRadius: 99, transition: "width 1.2s ease" }} /></div><div className="display-num" style={{ width: 50, textAlign: "right" as const }}>{m.value.toLocaleString()}</div></div>))}</div></div>
          </div>

          {/* FB Posts */}
          <div style={{ marginTop: 4 }}><div className="section-label">Facebook Posts This Period</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
            {fbPosts.map((p: any) => <PostCard key={p.id} p={p} maxViews={Math.max(...fbPosts.map((x: any) => x.views), 1)} />)}
          </div>
          {fbPosts.length === 0 && <div className="card" style={{ textAlign: "center" as const, padding: 40, color: "#8694A8" }}>No Facebook posts in the current reporting period. Stories and crossposted content appear in the metrics above.</div>}
        </>)}

        {/* ──────── AUDIENCE TAB ──────── */}
        {tab === "audience" && (<>
          <div className="cols2">
            <div className="card"><div className="card-hd">Gender Split (Instagram)</div><div style={{ display: "flex", alignItems: "center", gap: 28 }}><Donut data={[{ value: d.audience.gender.female },{ value: d.audience.gender.male }]} colors={["#F189B5","#2A3B58"]} size={130} stroke={20} /><div style={{ flex: 1 }}>{[{ l: "Female", v: d.audience.gender.female, c: "#F189B5" },{ l: "Male", v: d.audience.gender.male, c: "#2A3B58" }].map(g => (<div key={g.l} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}><div style={{ width: 12, height: 12, borderRadius: 4, background: g.c }} /><span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{g.l}</span><span className="display-num-lg">{g.v}%</span></div>))}</div></div></div>
            <div className="card"><div className="card-hd">Age Distribution (Instagram)</div>{d.audience.age.map(a => (<div key={a.range} className="age-row"><div className="age-label">{a.range}</div><div className="age-track"><div className="age-fill" style={{ width: (a.pct / 35) * 100 + "%", background: a.pct >= 28 ? "#2A3B58" : a.pct >= 20 ? "#7FCFD1" : a.pct >= 15 ? "#758BFD" : "#F9B78E" }} /></div><div className="age-pct">{a.pct}%</div></div>))}</div>
          </div>
          <div className="card"><div className="card-hd">Audience Intelligence</div>
            <IC title="Core User Demographic" body={d.audience.gender.female + "% female audience aligns with dental hygienist and assistant demographics. The 25-44 age range (" + ((d.audience.age[1]?.pct||0) + (d.audience.age[2]?.pct||0)) + "%) represents career-active professionals most likely to use the OnDiem platform."} severity="success" />
            <IC title="Content Strategy by Audience" body="Content should serve both dental professionals (job seekers) and practice owners (hirers). Consider splitting themes: career tips for pros (Mon/Wed/Fri) and staffing solutions for practices (Tue/Thu) across both Instagram and Facebook." severity="info" />
          </div>
        </>)}

        {/* ──────── INSIGHTS TAB ──────── */}
        {tab === "insights" && (<>
          <div className="cols2">
            <div><div className="section-label">Key Insights</div>{engine.ins.map((x, i) => <IC key={i} {...x} />)}</div>
            <div><div className="section-label">Growth Opportunities</div>{engine.opps.map((x, i) => <IC key={i} {...x} />)}{engine.alerts.map((a, i) => <IC key={"a" + i} {...a} />)}</div>
          </div>
          <div className="card"><div className="card-hd">Strategic Recommendations</div>{engine.recs.map((r, i) => (<div key={i} className="rec"><span className={"rec-badge " + r.priority}>{r.priority}</span><span style={{ fontSize: 13, lineHeight: 1.6 }}>{r.text}</span></div>))}</div>
        </>)}

        <div className="footer"><span>OnDiem &middot; Powered by Figment Creative</span></div>
      </div>
    </div>
  );
}
