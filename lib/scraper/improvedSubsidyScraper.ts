// lib/scraper/improvedSubsidyScraper.ts
// 補助金ポータルサイト専用改良版スクレイピング

import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface ImprovedScrapingTarget {
  id: string;
  name: string;
  url: string;
  pageType: "list" | "detail";
  selectors: {
    // リストページ用
    listContainer?: string;
    listTitle?: string;
    listLink?: string;
    listSummary?: string;
    // 詳細ページ用
    detailTitle?: string;
    detailContent?: string;
    detailAmount?: string;
    detailDeadline?: string;
    detailOrganization?: string;
    detailCategories?: string;
  };
}

// 改良版の対象設定
const IMPROVED_TARGETS: ImprovedScrapingTarget[] = [
  {
    id: "hojyokin_portal_detail",
    name: "補助金ポータル（詳細ページ）",
    url: "https://hojyokin-portal.jp/subsidies/58894",
    pageType: "detail",
    selectors: {
      detailTitle: "h1, .page-title, .main-title, .subsidy-title",
      detailContent:
        ".subsidy-overview, .description, .detail-content, .summary, .content",
      detailAmount:
        '.amount-info, .subsidy-amount, .budget-info, table td:contains("上限額"), table td:contains("補助額")',
      detailDeadline:
        '.deadline-info, .application-period, table td:contains("募集期間"), table td:contains("申請期限")',
      detailOrganization:
        '.organization-info, .sponsor-info, table td:contains("実施機関"), table td:contains("主催")',
      detailCategories: ".category-info, .tag, .badge, .label",
    },
  },
];

export class ImprovedSubsidyScraper {
  async scrapeImproved(): Promise<void> {
    console.log("🚀 改良版補助金スクレイピングを開始します...");

    for (const target of IMPROVED_TARGETS) {
      try {
        console.log(`\n📡 ${target.name} からデータを取得中...`);
        await this.scrapeImprovedTarget(target);

        await this.delay(3000);
      } catch (error) {
        console.error(`❌ ${target.name} のスクレイピングでエラー:`, error);
      }
    }
  }

  private async scrapeImprovedTarget(
    target: ImprovedScrapingTarget,
  ): Promise<void> {
    const startTime = new Date();
    let scrapedCount = 0;

    try {
      console.log(`📱 ${target.url} にアクセス中...`);

      const response = await fetch(target.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      console.log(`📄 HTML取得完了: ${html.length.toLocaleString()} 文字`);

      const $ = cheerio.load(html);

      if (target.pageType === "detail") {
        // 詳細ページの解析
        const subsidy = await this.parseDetailPage($, target);

        if (subsidy) {
          await this.saveImprovedSubsidy(subsidy);
          scrapedCount = 1;
          console.log(`✅ 補助金情報を取得: ${subsidy.name}`);
          console.log(`   組織: ${subsidy.organization}`);
          console.log(`   金額: ${subsidy.maxAmount || "未設定"}`);
          console.log(`   カテゴリ: ${subsidy.categories.join(", ")}`);
        }
      }

      console.log(
        `✅ ${target.name}: ${scrapedCount} 件の補助金情報を取得しました`,
      );
    } catch (error) {
      console.error(`❌ ${target.name} のスクレイピングエラー:`, error);
      throw error;
    }
  }

  private async parseDetailPage(
    $: ReturnType<typeof cheerio.load>,
    target: ImprovedScrapingTarget,
  ): Promise<any> {
    console.log("🔍 詳細ページを解析中...");

    // ページタイトルを取得
    let title = "";
    const titleSelectors = [
      target.selectors.detailTitle,
      "h1",
      ".page-title",
      ".main-title",
      "title",
    ].filter(Boolean) as string[];

    for (const selector of titleSelectors) {
      try {
        const titleEl = $(selector).first();

        if (titleEl.length > 0) {
          title = titleEl.text().trim();
          if (title && title.length > 10) {
            // タイトルからサイト名部分を除去
            title = title.replace(/\|.+$/, "").replace(/｜.+$/, "").trim();
            title = title.replace(/^「(.+)」$/, "$1"); // 「」を除去
            console.log(`📝 タイトル取得: ${title.substring(0, 50)}...`);
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!title || title.length < 10) {
      console.log("❌ 有効なタイトルが見つかりませんでした");

      return null;
    }

    // 内容を取得
    let content = "";
    const contentSelectors = [
      ".subsidy-overview",
      ".description",
      ".detail-content",
      ".summary",
      ".content",
      ".main-content",
      "article",
      ".post-content",
    ];

    const contentParts: string[] = [];

    for (const selector of contentSelectors) {
      try {
        const contentEls = $(selector);

        contentEls.each((i, el) => {
          const text = $(el).text().trim();

          if (text && text.length > 50 && !contentParts.includes(text)) {
            contentParts.push(text);
          }
        });
      } catch (error) {
        continue;
      }
    }

    content = contentParts.join(" | ").substring(0, 1000);
    console.log(`📄 内容取得: ${content.length} 文字`);

    // テーブルから詳細情報を抽出
    const tableInfo = this.extractTableInfo($);

    // 金額情報を抽出
    let maxAmount = "";
    const amountSources = [content, tableInfo.amount, title].join(" ");
    const amountInfo = this.parseAmountInfo(amountSources);

    maxAmount = amountInfo.maxAmount;

    // 組織情報を抽出
    let organization = "";

    if (tableInfo.organization) {
      organization = tableInfo.organization;
    } else {
      // タイトルや内容から組織名を推定
      organization = this.extractOrganizationFromContent(title + " " + content);
    }

    // 締切情報を抽出
    const deadline = this.parseDate(tableInfo.deadline || content);

    // カテゴリを推定
    const categories = this.estimateCategories(title, content);

    // 業種を推定
    const industries = this.estimateIndustries(title, content);

    // 対象者を抽出
    const targetAudience = this.extractTargetAudience(content);

    console.log("📊 抽出結果:");
    console.log(`   タイトル: ${title.substring(0, 50)}...`);
    console.log(`   組織: ${organization}`);
    console.log(`   金額: ${maxAmount || "未設定"}`);
    console.log(`   カテゴリ: ${categories.join(", ")}`);

    return {
      name: title,
      organization,
      summary: content.substring(0, 500),
      purpose: "",
      targetAudience,
      eligibilityCriteria: "",
      subsidyRate: amountInfo.subsidyRate,
      maxAmount,
      minAmount: amountInfo.minAmount,
      applicationPeriodStart: null,
      applicationPeriodEnd: deadline,
      applicationMethod: "",
      requiredDocuments: [],
      contactInfo: "",
      officialPageUrl: target.url,
      categories,
      industries,
      prefecture: this.extractPrefecture(content, organization),
      status: "active",
    };
  }

  private extractTableInfo($: ReturnType<typeof cheerio.load>): {
    amount: string;
    organization: string;
    deadline: string;
  } {
    let amount = "";
    let organization = "";
    let deadline = "";

    // テーブルから情報を抽出
    $("table tr").each((i, row) => {
      const $row = $(row);
      const cells = $row.find("td, th");

      if (cells.length >= 2) {
        const header = cells.first().text().trim().toLowerCase();
        const value = cells.eq(1).text().trim();

        if (
          header.includes("上限") ||
          header.includes("補助額") ||
          header.includes("金額")
        ) {
          amount += value + " ";
        }

        if (
          header.includes("実施機関") ||
          header.includes("主催") ||
          header.includes("担当")
        ) {
          organization = value;
        }

        if (
          header.includes("募集期間") ||
          header.includes("申請期限") ||
          header.includes("締切")
        ) {
          deadline = value;
        }
      }
    });

    // 定義リスト（dl/dt/dd）からも抽出
    $("dl").each((i, dl) => {
      const $dl = $(dl);

      $dl.find("dt").each((j, dt) => {
        const $dt = $(dt);
        const $dd = $dt.next("dd");

        if ($dd.length > 0) {
          const header = $dt.text().trim().toLowerCase();
          const value = $dd.text().trim();

          if (header.includes("上限") || header.includes("補助額")) {
            amount += value + " ";
          }

          if (header.includes("実施機関") || header.includes("主催")) {
            organization = value;
          }

          if (header.includes("募集期間") || header.includes("申請期限")) {
            deadline = value;
          }
        }
      });
    });

    return { amount, organization, deadline };
  }

  private extractOrganizationFromContent(text: string): string {
    const orgPatterns = [
      /(?:主催|実施機関|担当)[：:]?\s*([^。\n]+)/,
      /(国土交通省|経済産業省|厚生労働省|文部科学省|総務省|農林水産省|環境省|防衛省|内閣府)/,
      /([^。\n]*(?:省|庁|県|市|区|町|村|機構|振興会|協会|財団)[^。\n]*)/,
    ];

    for (const pattern of orgPatterns) {
      const match = text.match(pattern);

      if (match) {
        return match[1] || match[0];
      }
    }

    return "関連機関";
  }

  // 既存のヘルパーメソッドを流用
  private parseDate(dateText: string): Date | null {
    if (!dateText) return null;

    const patterns = [
      /（?(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{1,2})月(\d{1,2})日/,
      /(\d{1,2})\/(\d{1,2})/,
    ];

    for (const pattern of patterns) {
      const match = dateText.match(pattern);

      if (match) {
        if (match.length === 4) {
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const day = parseInt(match[3]);

          return new Date(year, month, day);
        } else if (match.length === 3) {
          const year = new Date().getFullYear();
          const month = parseInt(match[1]) - 1;
          const day = parseInt(match[2]);

          return new Date(year, month, day);
        }
      }
    }

    return null;
  }

  private parseAmountInfo(text: string): {
    subsidyRate: string;
    maxAmount: string;
    minAmount: string;
  } {
    let subsidyRate = "";
    let maxAmount = "";
    let minAmount = "";

    // 補助率の抽出
    const rateMatch = text.match(/補助率[：:]?\s*([\d/]+|[\d.]+%|定額)/);

    if (rateMatch) {
      subsidyRate = rateMatch[1];
    }

    // 補助上限額の抽出
    const amountMatches = [
      /(\d+(?:,\d+)*)万円/g,
      /(\d+(?:,\d+)*)億円/g,
      /上限[：:]?\s*(\d+(?:,\d+)*[万億]?円)/g,
      /最大[：:]?\s*(\d+(?:,\d+)*[万億]?円)/g,
    ];

    for (const pattern of amountMatches) {
      try {
        const matches = Array.from(text.matchAll(pattern));

        if (matches.length > 0) {
          maxAmount = matches[0][0];
          break;
        }
      } catch (error) {
        const match = text.match(new RegExp(pattern.source));

        if (match) {
          maxAmount = match[0];
          break;
        }
      }
    }

    return { subsidyRate, maxAmount, minAmount };
  }

  private estimateCategories(name: string, summary: string): string[] {
    const text = `${name} ${summary}`.toLowerCase();
    const categories = [];

    const categoryKeywords = {
      "交通・運輸": [
        "交通",
        "運輸",
        "バス",
        "電車",
        "移動",
        "輸送",
        "モビリティ",
      ],
      地域振興: [
        "地域",
        "振興",
        "まちづくり",
        "地方創生",
        "リデザイン",
        "空白",
        "過疎",
      ],
      DX推進: ["dx", "デジタル", "it", "システム"],
      新事業開発: ["新事業", "新サービス", "事業化"],
      "環境・省エネ": ["環境", "省エネ", "エコ", "sdgs"],
      観光: ["観光", "ツーリズム", "旅行"],
      "福祉・介護": ["福祉", "介護", "高齢者", "障害者"],
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
      "運輸業・郵便業": ["交通", "運輸", "バス", "電車", "移動", "輸送"],
      情報通信業: ["it", "システム", "デジタル", "dx"],
      観光業: ["観光", "ツーリズム", "旅行", "ホテル"],
      地方自治体: ["自治体", "市町村", "地域", "まちづくり"],
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
      地方自治体: ["自治体", "市町村", "都道府県", "地方公共団体"],
      交通事業者: ["交通事業者", "バス事業者", "運輸事業者"],
      中小企業: ["中小企業", "中小事業者"],
      小規模事業者: ["小規模事業者"],
    };

    for (const [audience, keywords] of Object.entries(audienceKeywords)) {
      if (keywords.some((keyword) => summary.includes(keyword))) {
        return audience;
      }
    }

    return "地方自治体・事業者";
  }

  private extractPrefecture(
    summary: string,
    organization: string,
  ): string | null {
    const text = `${summary} ${organization}`;

    const prefectures = [
      "北海道",
      "青森県",
      "岩手県",
      "宮城県",
      "秋田県",
      "山形県",
      "福島県",
      "茨城県",
      "栃木県",
      "群馬県",
      "埼玉県",
      "千葉県",
      "東京都",
      "神奈川県",
      "新潟県",
      "富山県",
      "石川県",
      "福井県",
      "山梨県",
      "長野県",
      "岐阜県",
      "静岡県",
      "愛知県",
      "三重県",
      "滋賀県",
      "京都府",
      "大阪府",
      "兵庫県",
      "奈良県",
      "和歌山県",
      "鳥取県",
      "島根県",
      "岡山県",
      "広島県",
      "山口県",
      "徳島県",
      "香川県",
      "愛媛県",
      "高知県",
      "福岡県",
      "佐賀県",
      "長崎県",
      "熊本県",
      "大分県",
      "宮崎県",
      "鹿児島県",
      "沖縄県",
    ];

    for (const prefecture of prefectures) {
      if (text.includes(prefecture)) {
        return prefecture;
      }
    }

    return null; // 全国対象
  }

  private async saveImprovedSubsidy(subsidy: any): Promise<void> {
    try {
      // 既存データの確認
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

        console.log(`🔄 更新: ${subsidy.name.substring(0, 40)}...`);
      } else {
        // 新規データを挿入
        await supabase.from("subsidies").insert(subsidy);

        console.log(`➕ 新規: ${subsidy.name.substring(0, 40)}...`);
      }
    } catch (error) {
      console.error("💾 データ保存エラー:", error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
