// app/api/admin/scrape-improved/route.ts
import { NextRequest, NextResponse } from "next/server";

import { ImprovedSubsidyScraper } from "@/lib/scraper/improvedSubsidyScraper";

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 改良版スクレイピング開始...");

    const scraper = new ImprovedSubsidyScraper();

    await scraper.scrapeImproved();

    return NextResponse.json({
      message: "改良版スクレイピングが完了しました",
      timestamp: new Date().toISOString(),
      status: "success",
    });
  } catch (error) {
    console.error("❌ 改良版スクレイピングエラー:", error);

    return NextResponse.json(
      {
        error: "改良版スクレイピング中にエラーが発生しました",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
