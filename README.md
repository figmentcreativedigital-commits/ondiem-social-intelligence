# OnDiem Social Performance Dashboard

A weekly social-media intelligence dashboard for **OnDiem**, rebuilt by **Figment Creative** to align with onDiem's FY25 brand guidelines.

Three channels (Facebook · Instagram · LinkedIn) — each with a 30-day and 365-day view. **All metrics are organic; no advertising or paid spend is shown.**

## What's in this rebuild

```
ondiem-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css            ← Brand tokens, type, geometry, motion
│   │   ├── layout.tsx             ← Tinos + Montserrat via next/font
│   │   └── page.tsx               ← Dashboard root (channel + window state)
│   ├── components/
│   │   ├── brand/                 ← Foundation primitives (Logo, Pill, Portal, Header, Icons)
│   │   └── dashboard/             ← New dashboard pieces (KpiCard, TrendChart, DonutChart…)
│   ├── data/
│   │   └── snapshot.json          ← Pre-aggregated channel × window data
│   └── lib/
│       ├── types.ts               ← TS shape of snapshot.json
│       ├── format.ts              ← fmtNum, fmtDate, computeTrend, typeColor
│       └── insights.ts            ← Rule-based insight generator
├── package.json
├── tsconfig.json
└── next.config.js
```

## Data pipeline

`snapshot.json` is built by a Python script (in this project: `/home/claude/data/build_snapshot.py`) that ingests the raw exports:

| File | Source | Shape |
| --- | --- | --- |
| `linkedin_followers.xls` | LinkedIn admin export | Daily new followers + 5 demographic sheets |
| `linkedin_visitors.xls` | LinkedIn admin export | Daily 25-col page metrics + 5 demographic sheets |
| `linkedin_content.xls` | LinkedIn admin export | Daily aggregated metrics + per-post details |
| `Profile_Growth_and_Discovery_*.CSV` (×2) | Instagram via Loomly | Daily / weekly followers, views, reach |
| `Detailed_Post_Performance_*.CSV` (×2) | Instagram via Loomly | Per-post data with caption, media type, metrics |
| `Detailed_Reel_Performance_*.CSV` | Instagram via Loomly | Reel-specific metrics |
| `Audience_Engagement_*.CSV` | Instagram via Loomly | Hourly × day-of-week activity |
| `Jul-01-2025_Apr-27-2026_*.csv` | Facebook Meta Suite | Per-post metrics (paid columns dropped) |
| `ondiem-top_content_formats-facebook.csv` | Meta Suite | Aggregate format breakdowns |

`build_snapshot.py` produces a single JSON document with `kpis`, `series`, `topPosts`, and `breakdowns` for each `channel × window` combination — six datasets in total.

To regenerate after new data drops, replace the source files in the data directory and re-run the script.

## Design language

This dashboard uses the design foundation from the FY25 OnDiem brand guidelines:

- **Ink/Navy** `#2A3B58` for type and primary surfaces
- **Canvas** `#FFFAF5` everywhere except chart inks
- **Secondary palette** — Teal · Sage · Pink · Purple · Yellow · Peach. Used as channel + chart accents.
- **Tinos** (display) + **Montserrat** (body) — the open-source equivalents to brand-spec'd TeX Gyre Termes Bold + Montserrat Bold.
- **Pill highlights** in serif headlines — onDiem's most repeatable brand device.
- **Portal discs** — the colored circles with single-line icons — for KPI cards and decorative clusters.

A note on the sage hex: the FY25 PDF mis-prints it as `#003A50` (which is navy). The visual sample is reconstructed here as `#7FC9A8`.

## Channel notes

### LinkedIn
- 365-day data covers Apr 29 2025 → Apr 28 2026 (daily granularity downsampled to weekly for the year view).
- Demographics are cumulative — the breakdown lists are stable across windows. Top locations: NYC Metro, SF Bay Area, Dallas-Fort Worth, LA Metro, Phoenix.

### Instagram
- 365-day series uses **weekly cadence** (Loomly export limitation). 30-day view is daily.
- The 365-day view also exposes the **90-day native IG snapshot** (Views 45,937; Reach 6,158; 3,055 followers) — these come from a UI screenshot the client provided and are baked in alongside the time-series data.
- Audience activity heatmap shows a single representative week (Apr 15–21) — IG only exposes one week at a time.

### Facebook
- The source CSV contains paid-ad columns (Ad CPM, Ad Impressions, Estimated Earnings, Seconds Viewed). **None are shown** — all dashboard metrics are organic only.
- Date range: Jul 1 2025 → Apr 27 2026 (~10 months); the 365-day view shows the full period.

## What changed from the previous version

The previous dashboard (https://ondiem-social-dash.vercel.app/) pulled from Google Sheets via an API route, used auth, and offered an OpenAI-powered insights feature plus PPTX export and email reports. The rebuild simplifies dramatically:

- **Dropped:** auth, OpenAI, PPTX export, Resend email, Google Sheets / `googleapis`. Auto-publishing infrastructure.
- **Kept:** rule-based insights (rewritten for the new data shape), KPI cards, top-post lists, donut charts.
- **New:** channel tabs replacing single-page-with-everything layout, dual-window toggle, brand foundation throughout, 90-day IG snapshot card.

## Local development

```bash
npm install
npm run dev
```

The dashboard is fully static once `snapshot.json` is built — no API routes or runtime data fetching.

## Refresh cadence

Update `src/data/snapshot.json` whenever new platform exports are dropped in the source folder, then redeploy. Snapshot regeneration takes a few seconds and the build is idempotent.
