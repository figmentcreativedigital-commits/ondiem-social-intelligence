import { NextResponse } from "next/server";
import { google } from "googleapis";

async function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
  let key = process.env.GOOGLE_PRIVATE_KEY || "";
  if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
  key = key.replace(/\\n/g, "\n");
  const { JWT } = google.auth;
  const client = new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  return google.sheets({ version: "v4", auth: client });
}

async function fetchRange(sheets: any, range: string) {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: process.env.GOOGLE_SHEET_ID, range });
  return res.data.values || [];
}

export async function GET() {
  try {
    const sheets = await getSheets();
    const [overviewRows, postRows, audienceRows, fbFormatRows] = await Promise.all([
      fetchRange(sheets, "'Overview Metrics'!A3:R100"),
      fetchRange(sheets, "'Post Performance'!A3:O100"),
      fetchRange(sheets, "'Audience Data'!A3:P100"),
      fetchRange(sheets, "'FB Content Formats'!A2:G4"),
    ]);

    const latest = overviewRows[0];
    if (!latest) return NextResponse.json({ error: "No data found" }, { status: 404 });

    // Overview: 0:WeekStart 1:WeekEnd 2:Slug 3:IGFollowers 4:IGNewFollowers 5:IGReach 6:IGViews 7:IGEngagements 8:IGER
    // 9:FBFollows 10:FBViews 11:FBViewers 12:FBVisits 13:FBInteractions 14:CombinedReach 15:CombinedViews 16:CombinedEngagements 17:CombinedER
    let periodStr = latest[0] + " - " + latest[1];
    try {
      const s = new Date(latest[0]), e = new Date(latest[1]);
      const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      periodStr = m[s.getMonth()] + " " + s.getDate() + " - " + m[e.getMonth()] + " " + e.getDate() + ", " + e.getFullYear();
    } catch {}

    // Posts: 0:WeekStart 1:Slug 2:Platform 3:Title 4:Type 5:Views 6:Reach 7:Likes 8:Comments 9:Saves 10:Shares 11:Clicks 12:IsTop 13:URL 14:Caption
    const weekPosts = postRows.filter((r: string[]) => r[0] === latest[0]).map((r: string[], i: number) => ({
      id: i + 1, platform: r[2] || "Instagram", title: r[3] || "Post " + (i+1), type: r[4] || "Post",
      views: Number(r[5]) || 0, reach: Number(r[6]) || 0, likes: Number(r[7]) || 0,
      comments: Number(r[8]) || 0, saves: Number(r[9]) || 0, shares: Number(r[10]) || 0,
      clicks: Number(r[11]) || 0, isTop: (r[12] || "").toUpperCase() === "TRUE", url: r[13] || "",
    }));

    // IG content mix from posts
    const igPosts = weekPosts.filter((p: any) => p.platform === "Instagram");
    const igTypes: Record<string, number> = {};
    igPosts.forEach((p: any) => { const t = p.type.toLowerCase(); igTypes[t] = (igTypes[t] || 0) + 1; });
    const igTotal = igPosts.length || 1;

    // Audience: 0:WeekStart 1:Slug 2:Male 3:Female 4-9:Age brackets 10:FBRetPrimary 11:FBRetSecondary
    const aud = audienceRows.find((r: string[]) => r[0] === latest[0]) || audienceRows[0];

    // FB Content Formats: row0=published counts, row1=views, row2=interactions
    const fbPub = fbFormatRows[0] || [];
    const fbContentMix = {
      stories: Number(fbPub[1]) || 0,
      photos: Number(fbPub[2]) || 0,
      reels: Number(fbPub[3]) || 0,
      multiPhoto: Number(fbPub[4]) || 0,
    };

    return NextResponse.json({
      client: { name: "OnDiem", fullName: "OnDiem", period: periodStr },
      ig: {
        followers: Number(latest[3]) || 0, newFollowers: Number(latest[4]) || 0,
        reach: Number(latest[5]) || 0, views: Number(latest[6]) || 0,
        engagements: Number(latest[7]) || 0, er: Number(latest[8]) || 0,
      },
      fb: {
        follows: Number(latest[9]) || 0, views: Number(latest[10]) || 0,
        viewers: Number(latest[11]) || 0, visits: Number(latest[12]) || 0,
        interactions: Number(latest[13]) || 0,
      },
      combined: {
        reach: Number(latest[14]) || 0, views: Number(latest[15]) || 0,
        engagements: Number(latest[16]) || 0, er: Number(latest[17]) || 0,
      },
      posts: weekPosts,
      contentMix: {
        posts: Math.round(((igTypes["post"] || 0) / igTotal) * 100),
        reels: Math.round(((igTypes["reel"] || 0) / igTotal) * 100),
        stories: Math.round(((igTypes["story"] || 0) / igTotal) * 100),
      },
      fbContentMix,
      audience: aud ? {
        gender: { male: Number(aud[2]) || 50, female: Number(aud[3]) || 50 },
        age: [
          { range: "18-24", pct: Number(aud[4]) || 0 }, { range: "25-34", pct: Number(aud[5]) || 0 },
          { range: "35-44", pct: Number(aud[6]) || 0 }, { range: "45-54", pct: Number(aud[7]) || 0 },
          { range: "55-64", pct: Number(aud[8]) || 0 }, { range: "65+", pct: Number(aud[9]) || 0 },
        ],
      } : { gender: { male: 50, female: 50 }, age: [{range:"18-24",pct:0},{range:"25-34",pct:0},{range:"35-44",pct:0},{range:"45-54",pct:0},{range:"55-64",pct:0},{range:"65+",pct:0}] },
      viewerSplit: { followers: 60, nonFollowers: 40 },
    });
  } catch (err: any) {
    console.error("Sheets API error:", err?.message || err);
    return NextResponse.json({ error: "Failed to fetch sheet data", details: err?.message }, { status: 500 });
  }
}
