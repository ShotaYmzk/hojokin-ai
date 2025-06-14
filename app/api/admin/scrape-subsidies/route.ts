// スクレイピング実行用のAPI
// app/api/admin/scrape-subsidies/route.ts
import { NextRequest, NextResponse } from "next/server";

import { SubsidyScraper } from "@/lib/scraper/subsidyScraper";

export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック（簡易版）
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // 開発環境では簡易的に認証をスキップ
    if (
      process.env.NODE_ENV === "development" ||
      token === "development_token"
    ) {
      console.log("開発環境でのスクレイピング実行を開始します...");
    } else {
      // 本番環境では適切な認証チェックを実装
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const scraper = new SubsidyScraper();

    await scraper.scrapeAll();

    return NextResponse.json({
      message: "スクレイピングが完了しました",
      timestamp: new Date().toISOString(),
      status: "success",
    });
  } catch (error) {
    console.error("スクレイピングエラー:", error);

    return NextResponse.json(
      {
        error: "スクレイピング中にエラーが発生しました",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
