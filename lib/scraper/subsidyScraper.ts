// lib/scraper/subsidyScraper.ts
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface ScrapingTarget {
  id: string;
  name: string;
  url: string;
  selectors: {
    title?: string;
    content?: string;
    deadline?: string;
    amount?: string;
    organization?: string;
  };
  parseRules: {
    dateFormat?: string;
    amountFormat?: string;
  };
}

interface SubsidyData {
  name: string;
  organization: string;
  summary: string;
  purpose: string;
  targetAudience: string;
  eligibilityCriteria: string;
  subsidyRate: string;
  maxAmount: string;
  minAmount: string;
  applicationPeriodStart: Date | null;
  applicationPeriodEnd: Date | null;
  applicationMethod: string;
  requiredDocuments: string[];
  contactInfo: string;
  officialPageUrl: string;
  categories: string[];
  industries: string[];
  prefecture: string | null;
  status: "active" | "inactive";
}

// 主要な補助金サイトの設定
const SCRAPING_TARGETS: ScrapingTarget[] = [
  {
    id: "mirasapo",
    name: "ミラサポplus",
    url: "https://mirasapo-plus.go.jp/subsidy/",
    selectors: {
      title: ".subsidy-item h3",
      content: ".subsidy-item .summary",
      deadline: ".subsidy-item .deadline",
      organization: ".subsidy-item .organization",
    },
    parseRules: {
      dateFormat: "YYYY年MM月DD日",
      amountFormat: "万円",
    },
  },
  {
    id: "j-net21",
    name: "J-Net21",
    url: "https://j-net21.smrj.go.jp/snavi/support/",
    selectors: {
      title: ".support-list h4",
      content: ".support-list .description",
      deadline: ".support-list .period",
      organization: ".support-list .organizer",
    },
    parseRules: {
      dateFormat: "YYYY/MM/DD",
      amountFormat: "円",
    },
  },
];

export class SubsidyScraper {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async scrapeAll(): Promise<void> {
    console.log("補助金情報のスクレイピングを開始します...");

    for (const target of SCRAPING_TARGETS) {
      try {
        await this.scrapeTarget(target);
        await this.delay(2000); // 2秒間隔でリクエスト
      } catch (error) {
        console.error(`${target.name}のスクレイピングでエラー:`, error);

        // エラーログを記録
        await supabase.from("scraping_logs").insert({
          source_url: target.url,
          source_name: target.name,
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });
      }
    }
  }

  private async scrapeTarget(target: ScrapingTarget): Promise<void> {
    const startTime = new Date();
    let scrapedCount = 0;

    try {
      console.log(`${target.name}からデータを取得中...`);

      // スクレイピング開始ログ
      const { data: logEntry } = await supabase
        .from("scraping_logs")
        .insert({
          source_url: target.url,
          source_name: target.name,
          status: "running",
          started_at: startTime.toISOString(),
        })
        .select()
        .single();

      // 実際のスクレイピング処理
      const response = await fetch(target.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const subsidies: SubsidyData[] = [];

      // 各補助金アイテムを解析
      $(".subsidy-item, .support-item").each(
        (_index: number, element: cheerio.Element) => {
          try {
            const subsidy = this.parseSubsidyElement($, element, target);

            if (subsidy) {
              subsidies.push(subsidy);
              scrapedCount++;
            }
          } catch (parseError) {
            console.warn(`要素の解析でエラー:`, parseError);
          }
        },
      );

      // データベースに保存
      if (subsidies.length > 0) {
        await this.saveSubsidies(subsidies);
      }

      // 成功ログを更新
      if (logEntry) {
        await supabase
          .from("scraping_logs")
          .update({
            status: "success",
            scraped_count: scrapedCount,
            completed_at: new Date().toISOString(),
          })
          .eq("id", logEntry.id);
      }

      console.log(
        `${target.name}: ${scrapedCount}件の補助金情報を取得しました`,
      );
    } catch (error) {
      console.error(`${target.name}のスクレイピングエラー:`, error);
      throw error;
    }
  }

  private parseSubsidyElement(
    $: cheerio.Root,
    element: cheerio.Element,
    target: ScrapingTarget,
  ): SubsidyData | null {
    const $el = $(element);

    // 基本情報を抽出
    const name = this.extractText($el, target.selectors.title);
    const summary = this.extractText($el, target.selectors.content);
    const organization = this.extractText($el, target.selectors.organization);
    const deadlineText = this.extractText($el, target.selectors.deadline);

    if (!name || !summary) {
      return null; // 必須項目が不足している場合はスキップ
    }

    // 日付の解析
    const deadline = this.parseDate(deadlineText, target.parseRules.dateFormat);

    // カテゴリの推定
    const categories = this.estimateCategories(name, summary);

    // 業種の推定
    const industries = this.estimateIndustries(name, summary);

    // 補助金額の抽出
    const { subsidyRate, maxAmount, minAmount } = this.parseAmountInfo(summary);

    return {
      name: name.trim(),
      organization: organization || "",
      summary: summary.trim(),
      purpose: "", // 詳細ページから取得が必要
      targetAudience: this.extractTargetAudience(summary),
      eligibilityCriteria: "", // 詳細ページから取得が必要
      subsidyRate,
      maxAmount,
      minAmount,
      applicationPeriodStart: null, // 詳細解析が必要
      applicationPeriodEnd: deadline,
      applicationMethod: "", // 詳細ページから取得が必要
      requiredDocuments: [],
      contactInfo: "",
      officialPageUrl: target.url,
      categories,
      industries,
      prefecture: this.extractPrefecture(summary, organization),
      status: "active",
    };
  }

  private extractText($el: cheerio.Cheerio, selector?: string): string {
    if (!selector) return "";

    return (
      $el.find(selector).first().text().trim() ||
      $el.filter(selector).text().trim() ||
      ""
    );
  }

  private parseDate(dateText: string, format?: string): Date | null {
    if (!dateText) return null;

    // 日本語の日付形式を解析
    const patterns = [
      /（?(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
    ];

    for (const pattern of patterns) {
      const match = dateText.match(pattern);

      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // Dateオブジェクトは0ベース
        const day = parseInt(match[3]);

        return new Date(year, month, day);
      }
    }

    return null;
  }

  private estimateCategories(name: string, summary: string): string[] {
    const text = `${name} ${summary}`.toLowerCase();
    const categories = [];

    const categoryKeywords = {
      IT導入: ["it", "システム", "デジタル", "dx", "クラウド", "ai"],
      設備投資: ["設備", "機械", "装置", "導入", "更新"],
      DX推進: ["dx", "デジタル", "デジタル化", "it活用"],
      新事業開発: ["新事業", "新サービス", "新商品", "事業化"],
      販路拡大: ["販路", "販売", "マーケティング", "海外展開"],
      人材育成: ["人材", "研修", "教育", "スキル", "育成"],
      "環境・省エネ": ["環境", "省エネ", "エコ", "sdgs", "脱炭素"],
      研究開発: ["研究", "開発", "r&d", "技術開発"],
      創業支援: ["創業", "スタートアップ", "起業", "新設"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        categories.push(category);
      }
    }

    return categories.length > 0 ? categories : ["その他"];
  }

  private estimateIndustries(name: string, summary: string): string[] {
    const text = `${name} ${summary}`.toLowerCase();
    const industries = [];

    const industryKeywords = {
      製造業: ["製造", "工場", "生産", "ものづくり"],
      情報通信業: ["it", "システム", "ソフトウェア", "通信"],
      建設業: ["建設", "建築", "土木", "工事"],
      "卸売業・小売業": ["小売", "卸売", "販売", "流通"],
      "宿泊業・飲食サービス業": ["宿泊", "飲食", "ホテル", "レストラン"],
      "運輸業・郵便業": ["運輸", "輸送", "物流", "配送"],
      "医療・福祉": ["医療", "福祉", "介護", "健康"],
      "教育・学習支援業": ["教育", "学習", "研修", "スクール"],
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        industries.push(industry);
      }
    }

    return industries.length > 0 ? industries : ["全業種"];
  }

  private extractTargetAudience(summary: string): string {
    const audienceKeywords = {
      中小企業: ["中小企業", "中小事業者"],
      小規模事業者: ["小規模事業者", "小規模企業"],
      スタートアップ: ["スタートアップ", "ベンチャー", "創業"],
      個人事業主: ["個人事業主", "個人事業者"],
    };

    for (const [audience, keywords] of Object.entries(audienceKeywords)) {
      if (keywords.some((keyword) => summary.includes(keyword))) {
        return audience;
      }
    }

    return "中小企業・小規模事業者";
  }

  private parseAmountInfo(summary: string): {
    subsidyRate: string;
    maxAmount: string;
    minAmount: string;
  } {
    let subsidyRate = "";
    let maxAmount = "";
    let minAmount = "";

    // 補助率の抽出
    const rateMatch = summary.match(/補助率[：:]?\\s*([\\d/]+|[\\d.]+%)/);

    if (rateMatch) {
      subsidyRate = rateMatch[1];
    }

    // 補助上限額の抽出
    const amountMatch = summary.match(/(\\d+(?:,\\d+)*)万円/);

    if (amountMatch) {
      maxAmount = `${amountMatch[1]}万円`;
    }

    return { subsidyRate, maxAmount, minAmount };
  }

  private extractPrefecture(
    summary: string,
    organization: string,
  ): string | null {
    const text = `${summary} ${organization}`;

    const prefectures = [
      "北海道",
      "青森",
      "岩手",
      "宮城",
      "秋田",
      "山形",
      "福島",
      "茨城",
      "栃木",
      "群馬",
      "埼玉",
      "千葉",
      "東京",
      "神奈川",
      "新潟",
      "富山",
      "石川",
      "福井",
      "山梨",
      "長野",
      "岐阜",
      "静岡",
      "愛知",
      "三重",
      "滋賀",
      "京都",
      "大阪",
      "兵庫",
      "奈良",
      "和歌山",
      "鳥取",
      "島根",
      "岡山",
      "広島",
      "山口",
      "徳島",
      "香川",
      "愛媛",
      "高知",
      "福岡",
      "佐賀",
      "長崎",
      "熊本",
      "大分",
      "宮崎",
      "鹿児島",
      "沖縄",
    ];

    for (const prefecture of prefectures) {
      if (text.includes(prefecture)) {
        return prefecture.endsWith("県") ? prefecture : prefecture + "県";
      }
    }

    return null; // 全国対象
  }

  private async saveSubsidies(subsidies: SubsidyData[]): Promise<void> {
    for (const subsidy of subsidies) {
      try {
        // 既存データの確認（名前と組織で重複チェック）
        const { data: existing } = await supabase
          .from("subsidies")
          .select("id")
          .eq("name", subsidy.name)
          .eq("organization", subsidy.organization)
          .single();

        if (existing) {
          // 既存データを更新
          await supabase
            .from("subsidies")
            .update({
              ...subsidy,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          // 新規データを挿入
          await supabase.from("subsidies").insert(subsidy);
        }
      } catch (error) {
        console.error("補助金データの保存エラー:", error);
      }
    }
  }
}

// スクレイピング実行用のAPI
// app/api/admin/scrape-subsidies/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック（必要に応じて実装）
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const scraper = new SubsidyScraper();

    await scraper.scrapeAll();

    return NextResponse.json({
      message: "スクレイピングが完了しました",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("スクレイピングエラー:", error);

    return NextResponse.json(
      {
        error: "スクレイピング中にエラーが発生しました",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// 定期実行用のcronジョブ設定（Vercel Cron Functions）
// app/api/cron/scrape-subsidies/route.ts
export async function GET(request: NextRequest) {
  try {
    // 環境変数でCronの秘密キーをチェック
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = request.headers.get("authorization");

    if (cronSecret && providedSecret !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scraper = new SubsidyScraper();

    await scraper.scrapeAll();

    return NextResponse.json({
      message: "Scheduled scraping completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scheduled scraping error:", error);

    return NextResponse.json(
      {
        error: "Scraping failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
