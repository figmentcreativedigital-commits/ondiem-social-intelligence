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
  ins.push({ title: "Cross-Platform Performance", body: "Combined " + d.combined.views.toLocaleString() + " views and " + d.combined.reach.toLocaleString() + " reach across Instagram and Facebook. Instagram drives " + Math.round((d.ig.views / Math.max(d.combined.views, 1)) * 100) + "% of total views while Facebook adds " + d.fb.views + " views with " + d.fb.interactions + " content interactions and " + d.fb.visits + " page visits.", severity: "info" });
  if (d.combined.er < 3) ins.push({ title: "Engagement Below B2B Benchmark", body: "Combined engagement rate of " + d.combined.er + "% is below the 3%+ target. Content generates views but needs stronger CTAs and interactive formats to convert to interactions.", severity: "warning" });
  const totalSaves = d.posts.reduce((s: number, p: any) => s + (p.saves || 0), 0);
  if (totalSaves < 3) alerts.push({ title: "Low Save Behavior", body: "Only " + totalSaves + " saves across all posts. Create more bookmark-worthy career tips and industry content.", severity: "danger" });
  if (d.ig.newFollowers > 10) ins.push({ title: "Instagram Follower Growth", body: "+" + d.ig.newFollowers + " Instagram followers this week to " + d.ig.followers.toLocaleString() + ". Steady organic growth indicates rising brand awareness.", severity: "success" });
  else opps.push({ title: "IG Growth Opportunity", body: "+" + d.ig.newFollowers + " followers. Strengthen profile CTAs and pin top content to improve conversion.", severity: "warning" });
  opps.push({ title: "Facebook Video Potential", body: "Facebook Reels and video are underutilized. Crossposting IG Reels to Facebook could double reach with zero extra effort.", severity: "info" });
  const topAge = d.audience.age.reduce((a, b) => (a.pct > b.pct ? a : b));
  ins.push({ title: "Audience Alignment", body: "Core audience is " + topAge.range + " (" + topAge.pct + "%) with " + d.audience.gender.female + "% female — aligned with dental hygienist and assistant demographics.", severity: "success" });
  recs.push(
    { text: "Crosspost Instagram Reels to Facebook to maximize reach with zero additional content creation", priority: "high" },
    { text: "Create carousel posts with dental career tips — multi-photo drove highest FB interactions", priority: "high" },
    { text: "Feature real OnDiem users: testimonials, day-in-the-life, success stories", priority: "medium" },
    { text: "Boost top IG posts to Facebook Ads targeting dental professionals in key markets", priority: "medium" },
    { text: "Optimize Facebook page CTA button for app downloads — 49 weekly visits = conversion potential", priority: "low" },
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
  const [tab, setTab] = useState("overview");
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

  function PB({ platform }: { platform: string }) {
    const isIG = platform === "Instagram";
    return <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: isIG ? "linear-gradient(135deg, #F189B5, #D08CE3)" : "#2A3B58", color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>{isIG ? "IG" : "FB"}</span>;
  }

  if (loading) return (<div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFAF5", fontFamily: "'Montserrat', sans-serif" }}><div style={{ width: 40, height: 40, border: "3px solid rgba(127,207,209,0.3)", borderTopColor: "#2A3B58", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><div style={{ marginTop: 16, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8694A8" }}>Loading report...</div><style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style></div>);

  return (
    <div className={"root " + (loaded ? "on" : "")}>
      <div className="hdr"><div className="hdr-top"><div><div className="hdr-brand">Figment Creative &middot; Social Intelligence</div><div className="hdr-title">{d.client.fullName}</div><div className="hdr-sub">Instagram + Facebook Performance &middot; {d.client.period}</div></div><div className="hdr-badge"><div className="hdr-pulse" />Weekly Report</div></div></div>
      <div className="tabs">{[{ id: "overview", label: "Overview", icon: "\u25C9" },{ id: "content", label: "Content", icon: "\u25EB" },{ id: "platforms", label: "Platforms", icon: "\u25CE" },{ id: "insights", label: "Insights", icon: "\u2726" }].map(t => (<button key={t.id} className={"tab " + (tab === t.id ? "on" : "")} onClick={() => setTab(t.id)}><span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}</button>))}</div>

      <div className="grid">
        {tab === "overview" && (<>
          <div className="kpi-row">
            {[
              { label: "IG Followers", value: d.ig.followers, change: d.ig.newFollowers, delay: 0 },
              { label: "Combined Reach", value: d.combined.reach, delay: 80 },
              { label: "Combined Views", value: d.combined.views, delay: 160 },
              { label: "Combined Engagements", value: d.combined.engagements, delay: 240 },
              { label: "Combined ER", value: d.combined.er, suffix: "%", delay: 320 },
              { label: "FB Page Visits", value: d.fb.visits, delay: 400 },
            ].map((k: any, i) => (<div key={i} className="kpi" style={{ animationDelay: k.delay + "ms" }}><div className="kpi-label">{k.label}</div><div className="kpi-val"><AN value={k.value} suffix={k.suffix || ""} /></div>{k.change > 0 && <div className="kpi-delta"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L12 8H2L7 2Z" fill="#7FCFD1" /></svg>+{k.change} this week</div>}</div>))}
          </div>
          <div className="exec"><div className="card-hd">Executive Summary</div><div className="exec-cols">
            <div><div className="exec-col-title">Cross-Platform</div><div className="exec-col-body">{d.combined.views.toLocaleString()} combined views across IG ({d.ig.views.toLocaleString()}) and FB ({d.fb.views}). Instagram drives the majority while Facebook adds {d.fb.visits} page visits and {d.fb.interactions} interactions.</div></div>
            <div><div className="exec-col-title">Engagement</div><div className="exec-col-body">{d.combined.er}% combined rate with {d.combined.engagements} interactions. Event coverage (Hinman) generated strongest engagement. Saves remain the key gap to address.</div></div>
            <div><div className="exec-col-title">Growth</div><div className="exec-col-body">+{d.ig.newFollowers} IG followers, +{d.fb.follows} FB follows. Stories dominate Facebook content while Instagram focuses on Posts and Reels.</div></div>
          </div></div>
          <div className="cols2">
            <div className="card"><div className="card-hd">Views by Platform</div><div style={{ display: "flex", alignItems: "center", gap: 28 }}><Donut data={[{ value: d.ig.views },{ value: d.fb.views }]} colors={["#F189B5","#2A3B58"]} size={120} stroke={18} /><div style={{ flex: 1 }}>{[{ label: "Instagram", value: d.ig.views, color: "#F189B5" },{ label: "Facebook", value: d.fb.views, color: "#2A3B58" }].map(item => (<div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}><div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} /><span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.label}</span><span className="display-num">{item.value.toLocaleString()}</span></div>))}</div></div></div>
            <div className="card"><div className="card-hd">Reach by Platform</div><div style={{ display: "flex", alignItems: "center", gap: 28 }}><Donut data={[{ value: d.ig.reach },{ value: d.fb.viewers }]} colors={["#7FCFD1","#758BFD"]} size={120} stroke={18} /><div style={{ flex: 1 }}>{[{ label: "IG Reach", value: d.ig.reach, color: "#7FCFD1" },{ label: "FB Viewers", value: d.fb.viewers, color: "#758BFD" }].map(item => (<div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}><div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} /><span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.label}</span><span className="display-num">{item.value.toLocaleString()}</span></div>))}</div></div></div>
          </div>
          {engine.alerts.length > 0 && <div>{engine.alerts.map((a, i) => <IC key={i} {...a} />)}</div>}
        </>)}

        {tab === "content" && (<>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
            {d.posts.map((p: any) => { const url = mediaUrls[p.id]; const isEd = editingMedia === p.id; const mx = Math.max(...d.posts.map((x: any) => x.views), 1); return (
              <div key={p.id} className={"postcard " + (p.isTop ? "postcard-top" : "")}>
                <div className="postcard-header"><div style={{ display: "flex", gap: 6, alignItems: "center" }}><PB platform={p.platform} /><div className="postcard-type-badge">{p.type}</div></div>{p.isTop && <div className="postcard-top-badge">&starf; Top</div>}</div>
                <div className="postcard-title">{p.title}</div>
                <div className={"postcard-media " + (url ? "has-media" : "")}>
                  {!url && !isEd && (<div className="postcard-media-empty" onClick={() => { setEditingMedia(p.id); setMediaInput(""); }}><div className="postcard-empty-inner"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8694A8" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span className="postcard-empty-label">Add Visual</span></div></div>)}
                  {isEd && (<div className="postcard-media-input"><input className="media-input" type="text" placeholder="Paste URL..." value={mediaInput} onChange={e => setMediaInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleMediaSave(p.id); if (e.key === "Escape") { setEditingMedia(null); setMediaInput(""); } }} autoFocus /><div className="media-btn-row"><button className="media-btn secondary" onClick={() => { setEditingMedia(null); setMediaInput(""); }}>Cancel</button><button className="media-btn primary" onClick={() => handleMediaSave(p.id)}>Save</button></div></div>)}
                  {url && !isEd && (<div className="postcard-media-filled">{isIgEmbed(url) ? (<div className="postcard-ig-crop"><iframe src={url.replace(/\/?(\?.*)?$/, "/embed")} title={p.title} scrolling="no" allowFullScreen /></div>) : isVideo(url) ? (<video controls playsInline><source src={url} /></video>) : (<img src={url} alt={p.title} />)}<div className="postcard-media-actions"><button onClick={() => { setEditingMedia(p.id); setMediaInput(url); }}>{"\u270E"}</button><button onClick={() => handleMediaRemove(p.id)}>{"\u2715"}</button></div></div>)}
                </div>
                <div className="postcard-primary"><div className="postcard-hero-metric"><span className="postcard-hero-val">{p.views?.toLocaleString()}</span><span className="postcard-hero-label">Views</span></div><div className="postcard-hero-divider" /><div className="postcard-hero-metric"><span className="postcard-hero-val">{p.reach?.toLocaleString()}</span><span className="postcard-hero-label">Reach</span></div></div>
                <div className="postcard-perf-bar"><div className="postcard-perf-fill" style={{ width: (p.views / mx) * 100 + "%" }} /></div>
                <div className="postcard-secondary">{[{ val: p.likes, label: "Likes" },{ val: p.shares, label: "Shares" },{ val: p.comments, label: "Comments" },{ val: p.saves || 0, label: "Saves" }].map(m => (<div key={m.label} className={"postcard-sec-item " + (m.val === 0 ? "zero" : "")}><span className="postcard-sec-val">{m.val}</span><span className="postcard-sec-label">{m.label}</span></div>))}</div>
                {p.clicks > 0 && <div style={{ marginTop: 10, textAlign: "center" as const, fontSize: 11, fontWeight: 700, color: "#758BFD" }}>{p.clicks} link clicks</div>}
              </div>); })}
          </div>
        </>)}

        {tab === "platforms" && (<>
          <div className="cols2">
            <div className="card" style={{ borderTop: "3px solid #F189B5" }}>
              <div className="card-hd" style={{ color: "#F189B5" }}>Instagram</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ l: "Followers", v: d.ig.followers.toLocaleString() },{ l: "New", v: "+" + d.ig.newFollowers },{ l: "Reach", v: d.ig.reach.toLocaleString() },{ l: "Views", v: d.ig.views.toLocaleString() },{ l: "Engagements", v: String(d.ig.engagements) },{ l: "Eng. Rate", v: d.ig.er + "%" }].map(m => (
                  <div key={m.l} style={{ padding: 12, background: "rgba(241,137,181,0.06)", borderRadius: 12, textAlign: "center" as const }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1E2B42" }}>{m.v}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#8694A8", marginTop: 2 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ borderTop: "3px solid #2A3B58" }}>
              <div className="card-hd" style={{ color: "#2A3B58" }}>Facebook</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ l: "New Follows", v: "+" + d.fb.follows },{ l: "Page Visits", v: String(d.fb.visits) },{ l: "Viewers", v: String(d.fb.viewers) },{ l: "Views", v: String(d.fb.views) },{ l: "Interactions", v: String(d.fb.interactions) },{ l: "Published", v: String(d.fbContentMix.stories + d.fbContentMix.photos + d.fbContentMix.reels) }].map(m => (
                  <div key={m.l} style={{ padding: 12, background: "rgba(42,59,88,0.04)", borderRadius: 12, textAlign: "center" as const }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#1E2B42" }}>{m.v}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#8694A8", marginTop: 2 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="cols2">
            <div className="card"><div className="card-hd">Gender Split</div><div style={{ display: "flex", alignItems: "center", gap: 28 }}><Donut data={[{ value: d.audience.gender.female },{ value: d.audience.gender.male }]} colors={["#F189B5","#2A3B58"]} size={130} stroke={20} /><div style={{ flex: 1 }}>{[{ l: "Female", v: d.audience.gender.female, c: "#F189B5" },{ l: "Male", v: d.audience.gender.male, c: "#2A3B58" }].map(g => (<div key={g.l} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}><div style={{ width: 12, height: 12, borderRadius: 4, background: g.c }} /><span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{g.l}</span><span className="display-num-lg">{g.v}%</span></div>))}</div></div></div>
            <div className="card"><div className="card-hd">Age Distribution</div>{d.audience.age.map(a => (<div key={a.range} className="age-row"><div className="age-label">{a.range}</div><div className="age-track"><div className="age-fill" style={{ width: (a.pct / 35) * 100 + "%", background: a.pct >= 28 ? "#2A3B58" : a.pct >= 20 ? "#7FCFD1" : a.pct >= 15 ? "#758BFD" : "#F9B78E" }} /></div><div className="age-pct">{a.pct}%</div></div>))}</div>
          </div>
        </>)}

        {tab === "insights" && (<>
          <div className="cols2">
            <div><div className="section-label">Key Insights</div>{engine.ins.map((x, i) => <IC key={i} {...x} />)}</div>
            <div><div className="section-label">Growth Opportunities</div>{engine.opps.map((x, i) => <IC key={i} {...x} />)}{engine.alerts.map((a, i) => <IC key={"a" + i} {...a} />)}</div>
          </div>
          <div className="card"><div className="card-hd">Strategic Recommendations</div>{engine.recs.map((r, i) => (<div key={i} className="rec"><span className={"rec-badge " + r.priority}>{r.priority}</span><span style={{ fontSize: 13, lineHeight: 1.6 }}>{r.text}</span></div>))}</div>
        </>)}

        <div className="footer"><span>OnDiem &middot; Instagram + Facebook &middot; Powered by Figment Creative</span></div>
      </div>
    </div>
  );
}
