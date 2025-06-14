// lib/scraper/realSubsidyScraper.ts
// 補助金ポータルサイト用のスクレイピング（TypeScriptエラー完全修正版）

import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RealScrapingTarget {
  id: string;
  name: string;
  url: string;
  selectors: {
    container?: string;
    title?: string;
    content?: string;
    deadline?: string;
    organization?: string;
    link?: string;
    amount?: string;
    category?: string;
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
  status: 'active' | 'inactive';
}

// 補助金ポータルサイトの設定
const HOJYOKIN_PORTAL_TARGETS: RealScrapingTarget[] = [
  {
    id: 'hojyokin_portal_okinawa',
    name: '補助金ポータル（沖縄県）',
    url: 'https://hojyokin-portal.jp/subsidies/list?pref_id=48',
    selectors: {
      container: '.subsidy-card, .card, .list-item, .subsidy-item, .item-card, tr, .content-box',
      title: '.card-title, .subsidy-title, .title, h3, h4, a, .name',
      content: '.card-text, .description, .summary, .detail, .content',
      deadline: '.deadline, .period, .date, .expires',
      organization: '.organization, .agency, .issuer, .sponsor',
      link: 'a',
      amount: '.amount, .budget, .money, .price',
      category: '.category, .type, .genre, .tag'
    }
  },
  {
    id: 'hojyokin_portal_all',
    name: '補助金ポータル（全国）',
    url: 'https://hojyokin-portal.jp/subsidies/list',
    selectors: {
      container: '.subsidy-card, .card, .list-item, .subsidy-item, .item-card, tr, .content-box',
      title: '.card-title, .subsidy-title, .title, h3, h4, a, .name',
      content: '.card-text, .description, .summary, .detail, .content',
      deadline: '.deadline, .period, .date, .expires',
      organization: '.organization, .agency, .issuer, .sponsor',
      link: 'a',
      amount: '.amount, .budget, .money, .price',
      category: '.category, .type, .genre, .tag'
    }
  },
  {
    id: 'hojyokin_portal_detail_test',
    name: '補助金ポータル（詳細ページテスト）',
    url: 'https://hojyokin-portal.jp/subsidies/58894',
    selectors: {
      container: '.detail-section, .info-section, .content-section, table tr, .field-row',
      title: 'h1, .page-title, .subsidy-name, .main-title',
      content: '.detail-content, .description, .overview, .summary',
      deadline: '.deadline-info, .application-period, .expires',
      organization: '.organization-info, .sponsor-info, .agency',
      amount: '.amount-info, .budget-info, .subsidy-amount',
      category: '.category-info, .type-info, .genre'
    }
  }
];

export class RealSubsidyScraper {
  
  async scrapeAllReal(): Promise<void> {
    console.log('🌐 補助金ポータルサイトからの情報スクレイピングを開始します...');
    
    for (const target of HOJYOKIN_PORTAL_TARGETS) {
      try {
        console.log(`\n📡 ${target.name} からデータを取得中...`);
        await this.scrapeRealTarget(target);
        
        // サイトに負荷をかけないよう間隔を空ける
        await this.delay(5000); // 5秒間隔
        
      } catch (error) {
        console.error(`❌ ${target.name} のスクレイピングでエラー:`, error);
        
        // エラーログを記録
        await supabase.from('scraping_logs').insert({
          source_url: target.url,
          source_name: target.name,
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        });
      }
    }
  }

  private async scrapeRealTarget(target: RealScrapingTarget): Promise<void> {
    const startTime = new Date();
    let scrapedCount = 0;

    try {
      // スクレイピング開始ログ
      const { data: logEntry } = await supabase
        .from('scraping_logs')
        .insert({
          source_url: target.url,
          source_name: target.name,
          status: 'running',
          started_at: startTime.toISOString()
        })
        .select()
        .single();

      console.log(`📱 ${target.url} にアクセス中...`);

      // HTTP リクエスト実行
      const response = await fetch(target.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'max-age=0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      console.log(`📄 HTML取得完了: ${html.length.toLocaleString()} 文字`);
      
      // HTMLの最初の部分をログ出力
      console.log(`🔍 HTML開始部分:`);
      console.log(html.substring(0, 500));
      
      const $ = cheerio.load(html);
      
      // 様々なコンテナセレクタを試す（補助金ポータル特化）
      const containerSelectors = [
        '.subsidy-card',
        '.subsidy-item',
        '.card',
        '.list-item', 
        '.item-card',
        '.content-box',
        '.info-box',
        '.subsidy-info',
        '.grant-item',
        '.application-item',
        '.row',
        'tr',
        '.item',
        '.entry',
        '.post',
        '.content-item',
        '[data-subsidy]',
        '[data-item]',
        '.field-row',
        '.detail-section',
        '.info-section',
        'dt, dd',
        'li'
      ];

      let containers = $('tbody tr, table tr, .list-item, .card'); // デフォルトで一般的な要素を設定
      let usedSelector = 'tbody tr, table tr, .list-item, .card';

      // 最も多くの要素が見つかるセレクタを使用
      for (const selector of containerSelectors) {
        try {
          const elements = $(selector);
          console.log(`🎯 セレクタ "${selector}": ${elements.length} 件`);
          
          if (elements.length > containers.length) {
            containers = elements;
            usedSelector = selector;
          }
        } catch (selectorError) {
          console.warn(`セレクタエラー "${selector}":`, selectorError);
        }
      }

      // より詳細な情報を持つ要素を優先
      if (containers.length > 0) {
        // テキスト長でフィルタリング（意味のある情報を含む要素のみ）
        const meaningfulContainers = containers.filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 20 && (
            text.includes('補助金') || 
            text.includes('助成金') || 
            text.includes('支援') ||
            text.includes('万円') ||
            text.includes('億円') ||
            text.includes('申請') ||
            text.includes('募集')
          );
        });
        
        if (meaningfulContainers.length > 0) {
          containers = meaningfulContainers;
          console.log(`📋 意味のある要素にフィルタリング: ${containers.length} 件`);
        }
      }

      console.log(`📦 使用するセレクタ: "${usedSelector}" (${containers.length} 件)`);

      if (containers.length === 0) {
        console.log('⚠️ コンテナ要素が見つかりません。全要素を調査します...');
        
        // 補助金関連のキーワードを含む要素を検索
        const subsidyKeywords = ['補助金', '助成金', '支援', '制度', '募集', '公募', '申請', '万円', '億円'];
        
        for (const keyword of subsidyKeywords) {
          try {
            const keywordElements = $(`*:contains("${keyword}")`);
            console.log(`🔍 "${keyword}" を含む要素: ${keywordElements.length} 件`);
            
            if (keywordElements.length > 0) {
              keywordElements.slice(0, 5).each((i, el) => {
                const $el = $(el);
                const element = el as any;
                const tagName = element.tagName || element.name || 'unknown';
                const className = $el.attr('class') || '';
                const text = $el.text().trim().substring(0, 100);
                console.log(`   [${i}] ${tagName}.${className}: ${text}`);
              });
            }
          } catch (keywordError) {
            console.warn(`キーワード検索エラー "${keyword}":`, keywordError);
          }
        }

        // より具体的な要素を検索
        const specificSelectors = [
          'table tr:has(td)',
          'ul li:contains("補助金")',
          'div:contains("万円")',
          '.row:has(.col)',
          'article',
          'section'
        ];

        for (const selector of specificSelectors) {
          try {
            const elements = $(selector);
            if (elements.length > 0) {
              console.log(`🎯 特定セレクタ "${selector}": ${elements.length} 件`);
              if (elements.length > containers.length) {
                containers = elements;
                usedSelector = selector;
              }
            }
          } catch (error) {
            console.warn(`セレクタエラー "${selector}":`, error);
          }
        }

        // テーブル構造を確認
        const tables = $('table');
        console.log(`📊 テーブル数: ${tables.length}`);
        tables.each((i, table) => {
          const $table = $(table);
          const rows = $table.find('tr');
          console.log(`   テーブル[${i}]: ${rows.length} 行`);
          
          rows.slice(0, 3).each((j, row) => {
            const $row = $(row);
            const cells = $row.find('td, th');
            const cellTexts: string[] = [];
            cells.each((k, cell) => {
              cellTexts.push($(cell).text().trim().substring(0, 30));
            });
            console.log(`     行[${j}]: ${cellTexts.join(' | ')}`);
          });
        });
      }

      const subsidies: SubsidyData[] = [];

      // 各コンテナ要素を解析
      containers.each((index, element) => {
        try {
          const subsidy = this.parseRealSubsidyElement($, element, target);
          if (subsidy) {
            subsidies.push(subsidy);
            scrapedCount++;
            console.log(`✅ [${index + 1}] ${subsidy.name.substring(0, 50)}...`);
          }
        } catch (parseError) {
          console.warn(`⚠️ 要素の解析でエラー (${index}):`, parseError);
        }
      });

      // データベースに保存
      if (subsidies.length > 0) {
        await this.saveSubsidies(subsidies);
        console.log(`💾 ${subsidies.length} 件のデータをデータベースに保存しました`);
      } else {
        console.log('📭 保存するデータがありませんでした');
        
        // デバッグ用：HTMLの構造をさらに詳しく調査
        console.log('\n🔬 詳細調査を実行します...');
        await this.debugHtmlStructure($, target.url);
      }

      // 成功ログを更新
      if (logEntry) {
        await supabase
          .from('scraping_logs')
          .update({
            status: 'success',
            scraped_count: scrapedCount,
            completed_at: new Date().toISOString()
          })
          .eq('id', logEntry.id);
      }

      console.log(`✅ ${target.name}: ${scrapedCount} 件の補助金情報を取得しました`);

    } catch (error) {
      console.error(`❌ ${target.name} のスクレイピングエラー:`, error);
      throw error;
    }
  }

  private parseRealSubsidyElement(
    $: ReturnType<typeof cheerio.load>,
    element: cheerio.Element,
    target: RealScrapingTarget
  ): SubsidyData | null {
    const $el = $(element);
    
    // 複数のセレクタを試してタイトルを抽出
    const titleSelectors = [
      target.selectors.title,
      'a',
      'h1, h2, h3, h4, h5, h6',
      '.title, .name, .subsidy-title, .card-title',
      'td:first-child',
      '.text-lg, .text-xl',
      '.main-title, .page-title'
    ].filter(Boolean) as string[];

    let name = '';
    for (const selector of titleSelectors) {
      try {
        const titleEl = $el.find(selector).first();
        if (titleEl.length > 0) {
          name = titleEl.text().trim();
          if (name && name.length > 5) break;
        }
      } catch (selectorError) {
        continue;
      }
    }

    // フォールバック：要素のテキスト全体から抽出
    if (!name || name.length < 5) {
      const fullText = $el.text().trim();
      const lines = fullText.split('\n').map(line => line.trim()).filter(line => line.length > 5);
      name = lines[0] || fullText.substring(0, 100);
    }

    // テーブル行の場合の特別処理
    if (!name || name.length < 5) {
      const cells = $el.find('td');
      if (cells.length > 0) {
        name = cells.first().text().trim();
      }
    }

    if (!name || name.length < 5) {
      return null; // タイトルが短すぎる場合はスキップ
    }

    // 内容を抽出（複数のソースから情報を集約）
    const contentSelectors = [
      target.selectors.content,
      '.description, .summary, .detail, .card-text',
      'td:nth-child(2), td:nth-child(3)',
      'p',
      '.content, .overview, .info'
    ].filter(Boolean) as string[];

    let summary = '';
    const summaryParts: string[] = [];

    for (const selector of contentSelectors) {
      try {
        const contentEl = $el.find(selector);
        contentEl.each((i, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 10 && !summaryParts.includes(text)) {
            summaryParts.push(text);
          }
        });
      } catch (selectorError) {
        continue;
      }
    }

    // 複数の情報源から要約を作成
    summary = summaryParts.join(' | ').substring(0, 500);

    // フォールバック：要素のテキスト全体から抽出
    if (!summary || summary.length < 10) {
      const fullText = $el.text().trim();
      summary = fullText.substring(0, 300);
    }

    // テーブル行の場合の特別処理
    if ((!summary || summary.length < 10) && $el.prop('tagName')?.toLowerCase() === 'tr') {
      const cells = $el.find('td');
      const cellTexts: string[] = [];
      cells.each((i, cell) => {
        const text = $(cell).text().trim();
        if (text && i > 0) { // 最初のセル（タイトル）以外
          cellTexts.push(text);
        }
      });
      summary = cellTexts.join(' | ');
    }

    // 期限を抽出（複数の形式に対応）
    const deadlineSelectors = [
      target.selectors.deadline,
      '.deadline, .period, .date, .expires',
      'td:last-child',
      '.text-red, .text-danger'
    ].filter(Boolean) as string[];

    let deadlineText = '';
    for (const selector of deadlineSelectors) {
      try {
        const deadlineEl = $el.find(selector).first();
        if (deadlineEl.length > 0) {
          deadlineText = deadlineEl.text().trim();
          if (deadlineText && deadlineText.match(/\d{4}|\d{1,2}月|\d{1,2}日/)) break;
        }
      } catch (selectorError) {
        continue;
      }
    }

    // リンクを抽出（詳細ページへのリンクを優先）
    const linkEl = $el.find('a').first();
    let link = linkEl.attr('href') || '';
    
    // 相対URLの場合は絶対URLに変換
    if (link && !link.startsWith('http')) {
      link = this.resolveUrl(target.url, link);
    }

    // 金額を抽出（より詳細な検索）
    const amountSelectors = [
      target.selectors.amount,
      '.amount, .budget, .money, .price'
    ].filter(Boolean) as string[];

    let amountText = '';
    for (const selector of amountSelectors) {
      try {
        const amountEl = $el.find(selector);
        amountEl.each((i, el) => {
          const text = $(el).text().trim();
          if (text.match(/\d+.*円/)) {
            amountText += text + ' ';
          }
        });
      } catch (selectorError) {
        continue;
      }
    }

    // 組織名を抽出
    const orgSelectors = [
      target.selectors.organization,
      '.organization, .agency, .issuer, .sponsor',
      '.gov, .prefecture, .city'
    ].filter(Boolean) as string[];

    let organization = '';
    for (const selector of orgSelectors) {
      try {
        const orgEl = $el.find(selector).first();
        if (orgEl.length > 0) {
          organization = orgEl.text().trim();
          if (organization) break;
        }
      } catch (selectorError) {
        continue;
      }
    }

    // 組織名の推定強化
    if (!organization) {
      if (target.url.includes('pref_id=48')) {
        organization = '沖縄県関連機関';
      } else if (name.includes('国土交通省') || summary.includes('国土交通省')) {
        organization = '国土交通省';
      } else if (name.includes('経済産業省') || summary.includes('経済産業省')) {
        organization = '経済産業省';
      } else if (name.includes('厚生労働省') || summary.includes('厚生労働省')) {
        organization = '厚生労働省';
      } else {
        organization = '補助金ポータル掲載機関';
      }
    }

    // カテゴリを抽出
    const categorySelectors = [
      target.selectors.category,
      '.category, .type, .genre, .tag',
      '.badge, .label'
    ].filter(Boolean) as string[];

    const extractedCategories: string[] = [];
    for (const selector of categorySelectors) {
      try {
        const categoryEls = $el.find(selector);
        categoryEls.each((i, el) => {
          const text = $(el).text().trim();
          if (text && !extractedCategories.includes(text)) {
            extractedCategories.push(text);
          }
        });
      } catch (selectorError) {
        continue;
      }
    }

    // 日付の解析
    const deadline = this.parseDate(deadlineText);
    
    // カテゴリの推定（抽出されたカテゴリと推定カテゴリを組み合わせ）
    const estimatedCategories = this.estimateCategories(name, summary);
    const allCategories = [...extractedCategories, ...estimatedCategories];
    const categories = Array.from(new Set(allCategories));
    
    // 業種の推定
    const industries = this.estimateIndustries(name, summary);

    // 補助金額の抽出（強化版）
    const { subsidyRate, maxAmount, minAmount } = this.parseAmountInfo(summary + ' ' + amountText + ' ' + name);

    // より詳細な対象者判定
    const targetAudience = this.extractTargetAudience(summary + ' ' + name);

    return {
      name: name.trim(),
      organization,
      summary: summary.trim(),
      purpose: '', // 詳細ページから取得が必要
      targetAudience,
      eligibilityCriteria: '',
      subsidyRate,
      maxAmount,
      minAmount,
      applicationPeriodStart: null,
      applicationPeriodEnd: deadline,
      applicationMethod: '',
      requiredDocuments: [],
      contactInfo: '',
      officialPageUrl: link || target.url,
      categories,
      industries,
      prefecture: this.extractPrefecture(summary + ' ' + organization, organization),
      status: 'active'
    };
  }

  private async debugHtmlStructure($: ReturnType<typeof cheerio.load>, url: string): Promise<void> {
    console.log('\n🔬 HTML構造の詳細調査');
    console.log('='.repeat(50));
    
    // 基本的な要素数をカウント
    const elementCounts = {
      'div': $('div').length,
      'span': $('span').length,
      'p': $('p').length,
      'a': $('a').length,
      'table': $('table').length,
      'tr': $('tr').length,
      'td': $('td').length,
      'ul': $('ul').length,
      'li': $('li').length,
      'article': $('article').length,
      'section': $('section').length
    };
    
    console.log('📊 要素数統計:');
    Object.entries(elementCounts).forEach(([tag, count]) => {
      console.log(`   ${tag}: ${count}`);
    });

    // クラス名の分析
    const classes = new Set<string>();
    $('[class]').each((i, el) => {
      const classNames = $(el).attr('class')?.split(/\s+/) || [];
      classNames.forEach(cls => {
        if (cls.length > 1) classes.add(cls);
      });
    });
    
    console.log(`\n🏷️ 検出されたクラス名 (上位20個):`);
    const classArray = Array.from(classes);
    for (let i = 0; i < Math.min(20, classArray.length); i++) {
      const cls = classArray[i];
      const count = $(`.${cls}`).length;
      console.log(`   .${cls}: ${count}個`);
    }

    // リンクの分析
    const links = $('a[href]');
    console.log(`\n🔗 リンク分析 (${links.length}個):`);
    links.slice(0, 10).each((i, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const text = $link.text().trim().substring(0, 50);
      console.log(`   [${i}] ${text} -> ${href}`);
    });
  }

  private resolveUrl(baseUrl: string, relativePath: string): string {
    if (!relativePath) return baseUrl;
    if (relativePath.startsWith('http')) return relativePath;
    
    try {
      const base = new URL(baseUrl);
      const resolved = new URL(relativePath, base);
      return resolved.toString();
    } catch {
      return baseUrl;
    }
  }

  private parseDate(dateText: string): Date | null {
    if (!dateText) return null;
    
    const patterns = [
      /（?(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{1,2})月(\d{1,2})日/,
      /(\d{1,2})\/(\d{1,2})/,
      /(\d{4})\.(\d{1,2})\.(\d{1,2})/
    ];
    
    for (const pattern of patterns) {
      const match = dateText.match(pattern);
      if (match) {
        if (match.length === 4) {
          // 年月日の場合
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const day = parseInt(match[3]);
          return new Date(year, month, day);
        } else if (match.length === 3) {
          // 月日のみの場合（現在年を仮定）
          const year = new Date().getFullYear();
          const month = parseInt(match[1]) - 1;
          const day = parseInt(match[2]);
          return new Date(year, month, day);
        }
      }
    }
    
    return null;
  }

  private estimateCategories(name: string, summary: string): string[] {
    const text = `${name} ${summary}`.toLowerCase();
    const categories = [];
    
    const categoryKeywords = {
      'IT導入': ['it', 'システム', 'デジタル', 'dx', 'クラウド', 'ai', 'iot', 'web', 'アプリ'],
      '設備投資': ['設備', '機械', '装置', '導入', '更新', '投資', '機器'],
      'DX推進': ['dx', 'デジタル', 'デジタル化', 'it活用', 'デジタル変革', '情報化'],
      '新事業開発': ['新事業', '新サービス', '新商品', '事業化', '新規', '事業展開'],
      '販路拡大': ['販路', '販売', 'マーケティング', '海外展開', '輸出', '市場開拓'],
      '人材育成': ['人材', '研修', '教育', 'スキル', '育成', '訓練', '能力開発'],
      '環境・省エネ': ['環境', '省エネ', 'エコ', 'sdgs', '脱炭素', '再生可能', '太陽光'],
      '研究開発': ['研究', '開発', 'r&d', '技術開発', 'イノベーション', '特許'],
      '創業支援': ['創業', 'スタートアップ', '起業', '新設', '開業', 'ベンチャー'],
      '事業継承': ['事業承継', '後継者', '引き継ぎ', '継承', '事業継続'],
      '働き方改革': ['働き方', '労働時間', '有給', '職場環境', '雇用'],
      '観光・地域振興': ['観光', '地域', '振興', 'まちづくり', '地方創生', '交通'],
      '農業・水産業': ['農業', '水産', '漁業', '農産物', '水産物', '畜産'],
      '製造業支援': ['製造', 'ものづくり', '工場', '生産性', '品質向上']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        categories.push(category);
      }
    }
    
    return categories.length > 0 ? categories : ['その他'];
  }

  private estimateIndustries(name: string, summary: string): string[] {
    const text = `${name} ${summary}`.toLowerCase();
    const industries = [];
    
    const industryKeywords = {
      '製造業': ['製造', '工場', '生産', 'ものづくり', '加工'],
      '情報通信業': ['it', 'システム', 'ソフトウェア', '通信', 'web', 'アプリ'],
      '建設業': ['建設', '建築', '土木', '工事', '住宅'],
      '卸売業・小売業': ['小売', '卸売', '販売', '流通', '店舗', '商業'],
      '宿泊業・飲食サービス業': ['宿泊', '飲食', 'ホテル', 'レストラン', '観光', '旅館'],
      '運輸業・郵便業': ['運輸', '輸送', '物流', '配送', '運送', '交通'],
      '医療・福祉': ['医療', '福祉', '介護', '健康', '病院', '福祉施設'],
      '教育・学習支援業': ['教育', '学習', '研修', 'スクール', '学校', '保育'],
      '農業・林業・漁業': ['農業', '林業', '漁業', '農産物', '水産', '畜産'],
      'サービス業': ['サービス', 'コンサル', '清掃', '警備', '人材']
    };
    
    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        industries.push(industry);
      }
    }
    
    return industries.length > 0 ? industries : ['全業種'];
  }

  private extractTargetAudience(summary: string): string {
    const audienceKeywords = {
      '中小企業': ['中小企業', '中小事業者'],
      '小規模事業者': ['小規模事業者', '小規模企業'],
      'スタートアップ': ['スタートアップ', 'ベンチャー', '創業'],
      '個人事業主': ['個人事業主', '個人事業者'],
      '大企業': ['大企業', '大手企業'],
      '地方自治体': ['自治体', '市町村', '都道府県'],
      'NPO法人': ['npo', '非営利', '市民団体']
    };
    
    for (const [audience, keywords] of Object.entries(audienceKeywords)) {
      if (keywords.some(keyword => summary.toLowerCase().includes(keyword.toLowerCase()))) {
        return audience;
      }
    }
    
    return '中小企業・小規模事業者';
  }

  private parseAmountInfo(summary: string): { subsidyRate: string; maxAmount: string; minAmount: string } {
    let subsidyRate = '';
    let maxAmount = '';
    let minAmount = '';
    
    // 補助率の抽出
    const rateMatches = [
      /補助率[：:]?\s*([\d/]+|[\d.]+%)/g,
      /(\d+分の\d+)/g,
      /(\d+\/\d+)/g,
      /(\d+%)(?:以内|まで)/g
    ];
    
    for (const pattern of rateMatches) {
      try {
        const matches = Array.from(summary.matchAll(pattern));
        if (matches.length > 0) {
          subsidyRate = matches[0][1] || matches[0][0];
          break;
        }
      } catch (error) {
        // matchAllでエラーが出た場合はmatchを使用
        try {
          const nonGlobalPattern = new RegExp(pattern.source);
          const match = summary.match(nonGlobalPattern);
          if (match) {
            subsidyRate = match[1] || match[0];
            break;
          }
        } catch (matchError) {
          continue;
        }
      }
    }
    
    // 補助上限額の抽出
    const amountMatches = [
      /(\d+(?:,\d+)*)万円/g,
      /(\d+(?:,\d+)*)億円/g,
      /(\d+(?:,\d+)*)円/g,
      /上限[：:]?\s*(\d+(?:,\d+)*[万億]?円)/g,
      /最大[：:]?\s*(\d+(?:,\d+)*[万億]?円)/g,
      /(\d+)万円(?:以内|まで|上限)/g,
      /(\d+)億円(?:以内|まで|上限)/g
    ];
    
    for (const pattern of amountMatches) {
      try {
        const matches = Array.from(summary.matchAll(pattern));
        if (matches.length > 0) {
          maxAmount = matches[0][0]; // 最初に見つかった金額
          break;
        }
      } catch (error) {
        // matchAllでエラーが出た場合はmatchを使用
        try {
          const nonGlobalPattern = new RegExp(pattern.source);
          const match = summary.match(nonGlobalPattern);
          if (match) {
            maxAmount = match[0];
            break;
          }
        } catch (matchError) {
          continue;
        }
      }
    }
    
    return { subsidyRate, maxAmount, minAmount };
  }

  private extractPrefecture(summary: string, organization: string): string | null {
    const text = `${summary} ${organization}`;
    
    const prefectures = [
      '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
      '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
      '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
      '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
      '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
      '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
      '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
    ];
    
    for (const prefecture of prefectures) {
      if (text.includes(prefecture)) {
        return prefecture;
      }
    }
    
    return null; // 全国対象
  }

  private async saveSubsidies(subsidies: SubsidyData[]): Promise<void> {
    console.log(`💾 ${subsidies.length} 件のデータを保存中...`);
    
    for (let index = 0; index < subsidies.length; index++) {
      const subsidy = subsidies[index];
      try {
        // 既存データの確認（名前と組織で重複チェック）
        const { data: existing } = await supabase
          .from('subsidies')
          .select('id')
          .eq('name', subsidy.name)
          .eq('organization', subsidy.organization)
          .single();
        
        if (existing) {
          // 既存データを更新
          await supabase
            .from('subsidies')
            .update({
              ...subsidy,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          
          console.log(`🔄 [${index + 1}] 更新: ${subsidy.name.substring(0, 40)}...`);
          console.log(`    組織: ${subsidy.organization}`);
          console.log(`    金額: ${subsidy.maxAmount || '未設定'}`);
          console.log(`    カテゴリ: ${subsidy.categories.join(', ')}`);
        } else {
          // 新規データを挿入
          await supabase
            .from('subsidies')
            .insert(subsidy);
          
          console.log(`➕ [${index + 1}] 新規: ${subsidy.name.substring(0, 40)}...`);
          console.log(`    組織: ${subsidy.organization}`);
          console.log(`    金額: ${subsidy.maxAmount || '未設定'}`);
          console.log(`    カテゴリ: ${subsidy.categories.join(', ')}`);
          console.log(`    URL: ${subsidy.officialPageUrl}`);
        }
      } catch (error) {
        console.error(`💾 [${index + 1}] 補助金データの保存エラー:`, error);
        console.error(`    データ: ${subsidy.name}`);
      }
    }
    
    console.log(`✅ 保存処理完了: ${subsidies.length} 件`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}