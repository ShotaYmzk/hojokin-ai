// lib/scraper/debugSubsidyScraper.ts
// デバッグ版：実際のサイト構造を確認するためのスクレイピングコード

import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface DebugResult {
  siteName: string;
  url: string;
  success: boolean;
  htmlLength: number;
  foundElements: {
    selector: string;
    count: number;
    sampleText: string[];
  }[];
  error?: string;
}

export class DebugSubsidyScraper {
  async debugScrapeAll(): Promise<DebugResult[]> {
    console.log("🔍 デバッグモードでスクレイピングを開始します...");

    const results: DebugResult[] = [];

    // テスト対象サイト
    const testSites = [
      {
        name: "ミラサポplus",
        url: "https://mirasapo-plus.go.jp/",
        selectors: [
          ".subsidy-item",
          ".subsidy-item h3",
          ".subsidy-item .summary",
          ".card",
          ".news-item",
          "h1, h2, h3, h4",
          "article",
          ".content",
        ],
      },
      {
        name: "J-Net21",
        url: "https://j-net21.smrj.go.jp/",
        selectors: [
          ".support-list",
          ".support-list h4",
          ".support-item",
          ".news-item",
          "h1, h2, h3, h4",
          "article",
          ".content",
        ],
      },
      {
        name: "J-Net21 補助金ページ",
        url: "https://j-net21.smrj.go.jp/snavi/support",
        selectors: [
          ".support-list",
          ".support-item",
          ".subsidy-item",
          "h1, h2, h3, h4",
          "article",
          ".item",
          ".card",
        ],
      },
    ];

    for (const site of testSites) {
      try {
        console.log(`\n🌐 ${site.name} をテスト中...`);
        const result = await this.debugScrapeSite(
          site.name,
          site.url,
          site.selectors,
        );

        results.push(result);

        // サイトに負荷をかけないよう間隔を空ける
        await this.delay(3000);
      } catch (error) {
        console.error(`❌ ${site.name} のテストでエラー:`, error);
        results.push({
          siteName: site.name,
          url: site.url,
          success: false,
          htmlLength: 0,
          foundElements: [],
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  private async debugScrapeSite(
    siteName: string,
    url: string,
    selectors: string[],
  ): Promise<DebugResult> {
    console.log(`📡 ${url} にアクセス中...`);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    console.log(`📄 HTML取得完了: ${html.length} 文字`);

    // HTML構造の基本情報をログ出力
    console.log(`🔍 HTML の最初の500文字:`);
    console.log(html.substring(0, 500));

    const $ = cheerio.load(html);

    console.log(`✅ Cheerio でパース完了`);

    const foundElements: DebugResult["foundElements"] = [];

    // 各セレクタをテスト
    for (const selector of selectors) {
      try {
        const elements = $(selector);
        const count = elements.length;

        console.log(`🎯 セレクタ "${selector}": ${count}件見つかりました`);

        if (count > 0) {
          // 最初の3要素のテキストを取得
          const sampleText: string[] = [];

          elements.slice(0, 3).each((i, element) => {
            const text = $(element).text().trim().substring(0, 100);

            if (text) {
              sampleText.push(text);
            }
          });

          foundElements.push({
            selector,
            count,
            sampleText,
          });

          console.log(`   📝 サンプルテキスト:`, sampleText);
        }
      } catch (selectorError) {
        console.error(`❌ セレクタ "${selector}" でエラー:`, selectorError);
      }
    }

    return {
      siteName,
      url,
      success: true,
      htmlLength: html.length,
      foundElements,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // デバッグ結果をSupabaseに保存
  async saveDebugResults(results: DebugResult[]): Promise<void> {
    try {
      const debugData = results.map((result) => ({
        site_name: result.siteName,
        url: result.url,
        success: result.success,
        html_length: result.htmlLength,
        found_elements: result.foundElements,
        error_message: result.error || null,
        created_at: new Date().toISOString(),
      }));

      // デバッグ結果をJSONBとしてscrap_logsに保存
      await supabase.from("scraping_logs").insert({
        source_url: "debug_session",
        source_name: "Debug Session",
        status: "success",
        scraped_count: results.filter((r) => r.success).length,
        error_message: JSON.stringify(debugData, null, 2),
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("デバッグ結果の保存でエラー:", error);
    }
  }
}
