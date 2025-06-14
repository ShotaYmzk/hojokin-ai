// app/api/debug/scrape-test/route.ts
import { NextRequest, NextResponse } from "next/server";

import { DebugSubsidyScraper } from "@/lib/scraper/debugSubsidyScraper";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 デバッグスクレイピング開始...");

    const debugScraper = new DebugSubsidyScraper();
    const results = await debugScraper.debugScrapeAll();

    // 結果をコンソールに出力
    console.log("\n📊 デバッグ結果サマリー:");
    console.log("=====================================");

    results.forEach((result) => {
      console.log(`\n🌐 ${result.siteName}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   成功: ${result.success ? "✅" : "❌"}`);
      console.log(`   HTML長: ${result.htmlLength.toLocaleString()} 文字`);
      console.log(`   要素発見数: ${result.foundElements.length}`);

      if (result.foundElements.length > 0) {
        result.foundElements.forEach((element) => {
          console.log(`   🎯 ${element.selector}: ${element.count}件`);
          if (element.sampleText.length > 0) {
            console.log(
              `      サンプル: "${element.sampleText[0].substring(0, 50)}..."`,
            );
          }
        });
      }

      if (result.error) {
        console.log(`   ❌ エラー: ${result.error}`);
      }
    });

    // デバッグ結果を保存
    await debugScraper.saveDebugResults(results);

    return NextResponse.json({
      message: "デバッグスクレイピング完了",
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        totalSites: results.length,
        successfulSites: results.filter((r) => r.success).length,
        totalElementsFound: results.reduce(
          (sum, r) => sum + r.foundElements.length,
          0,
        ),
      },
    });
  } catch (error) {
    console.error("❌ デバッグスクレイピングエラー:", error);

    return NextResponse.json(
      {
        error: "デバッグスクレイピング中にエラーが発生しました",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // POSTでも同じ処理を実行
  return GET(request);
}
