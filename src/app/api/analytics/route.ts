import { NextRequest, NextResponse } from "next/server";
import { readDb, recordAnalyticsEvent } from "@/lib/db";
import { isAdminRequestAuthorized, sanitizeText } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`analytics-post:${ip}`, 120, 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = await req.json();
    recordAnalyticsEvent({
      type: body.type || "pageview",
      path: sanitizeText(body.path, 200) || "/",
      productId: sanitizeText(body.productId, 120) || undefined,
      productTitle: sanitizeText(body.productTitle, 200) || undefined,
      divisionId: sanitizeText(body.divisionId, 80) || undefined,
      phoneLine:
        body.phoneLine === "01862-679456" || body.phoneLine === "01309-816266"
          ? body.phoneLine
          : undefined,
      searchQuery: sanitizeText(body.searchQuery, 120) || undefined,
      lang: body.lang === "bn" ? "bn" : "en",
      device: body.device === "desktop" ? "desktop" : "mobile",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequestAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = readDb();

  // Compute top viewed products
  const topViewedProducts = [...db.products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      title: p.title.en,
      divisionId: p.divisionId,
      views: p.views || 0,
      whatsappClicks: p.whatsappClicks || 0,
    }));

  // Compute top WhatsApp clicked products
  const topWhatsappProducts = [...db.products]
    .sort((a, b) => (b.whatsappClicks || 0) - (a.whatsappClicks || 0))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      title: p.title.en,
      divisionId: p.divisionId,
      whatsappClicks: p.whatsappClicks || 0,
      views: p.views || 0,
    }));

  // Extract top search queries
  const searchCounts: Record<string, number> = {};
  for (const evt of db.analyticsEvents) {
    if (evt.type === "search_query" && evt.searchQuery) {
      const q = evt.searchQuery.toLowerCase().trim();
      if (q.length >= 2) {
        searchCounts[q] = (searchCounts[q] || 0) + 1;
      }
    }
  }
  const topSearchQueries = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return NextResponse.json({
    counters: db.counters,
    topViewedProducts,
    topWhatsappProducts,
    topSearchQueries,
    recentEvents: db.analyticsEvents.slice(0, 40),
    totalProducts: db.products.length,
    totalRfqLeads: db.rfqLeads.length,
  });
}
