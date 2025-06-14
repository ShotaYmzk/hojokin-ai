// app/api/ai/generate-document-draft/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI クライアントの初期化
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Supabase クライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const { companyInfo, subsidyId, sections } = await request.json();

    // 認証チェック
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // JWTからユーザー情報を取得
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "認証に失敗しました" },
        { status: 401 },
      );
    }

    // 企業情報の取得（既存のデータベーススキーマに合わせて調整）
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "企業情報が見つかりません" },
        { status: 400 },
      );
    }

    // JグランツAPIから補助金情報を取得（実際の実装時）
    // const subsidyData = await fetchSubsidyFromJGrants(subsidyId);

    // ダミーの補助金データ（実際にはJグランツAPIから取得）
    const subsidyData = {
      name: "IT導入補助金2025",
      purpose: "ITツール導入による生産性向上支援",
      maxAmount: "450万円",
      subsidyRate: "1/2〜2/3",
      targetAudience: "中小企業・小規模事業者",
    };

    const generatedSections = [];

    // Gemini APIを使用して各セクションを生成
    for (const sectionKey of sections) {
      try {
        const prompt = generateSectionPrompt(sectionKey, company, subsidyData);

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        generatedSections.push({
          sectionKey,
          title: getSectionTitle(sectionKey),
          content,
          editable: true,
        });
      } catch (aiError) {
        console.error(`Gemini API生成エラー (${sectionKey}):`, aiError);

        // フォールバック: テンプレートベースの生成
        generatedSections.push({
          sectionKey,
          title: getSectionTitle(sectionKey),
          content: generateFallbackContent(sectionKey, company, subsidyData),
          editable: true,
        });
      }
    }

    return NextResponse.json(generatedSections);
  } catch (error) {
    console.error("AI文書生成エラー:", error);

    return NextResponse.json(
      { error: "文書生成中にエラーが発生しました" },
      { status: 500 },
    );
  }
}

function generateSectionPrompt(
  sectionKey: string,
  companyInfo: any,
  subsidyData: any,
): string {
  const baseContext = `
企業情報:
- 会社名: ${companyInfo.name}
- 業種: ${companyInfo.industry}
- 従業員数: ${companyInfo.employee_count_category}
- 所在地: ${companyInfo.prefecture}${companyInfo.city}
- 事業内容: ${companyInfo.business_description}
- 設立年: ${companyInfo.establishment_year}
- 資本金: ${companyInfo.capital_amount}
- 年間売上: ${companyInfo.annual_sales}

補助金制度:
- 制度名: ${subsidyData.name}
- 目的: ${subsidyData.purpose}
- 補助率: ${subsidyData.subsidyRate}
- 上限額: ${subsidyData.maxAmount}
- 対象者: ${subsidyData.targetAudience}
`;

  switch (sectionKey) {
    case "business_overview":
      return `${baseContext}
      
上記の企業情報と補助金制度を踏まえて、以下の要素を含む「事業計画の概要」セクションを作成してください：

1. 事業の背景・現状の課題
2. 導入予定の技術・システムの詳細
3. 具体的な導入スケジュール（月単位）
4. 期待される効果と定量的な目標数値
5. 本補助金制度を活用する意義と効果

文書は補助金申請書として適切な敬語・ビジネス文書の形式で、1000文字程度で作成してください。
具体的で説得力のある内容にしてください。`;

    case "expense_details":
      return `${baseContext}
      
上記の企業情報と補助金制度を踏まえて、「経費内訳」セクションを作成してください：

1. 主要な経費項目の詳細（ソフトウェア、ハードウェア、委託費、研修費等）
2. 各項目の具体的な金額と算出根拠
3. 補助対象経費の合計金額
4. 補助金申請額の詳細な算出過程
5. 費用対効果の説明

金額は現実的で妥当な範囲で設定し、補助金制度の上限額と補助率を考慮してください。
表形式も含めて800文字程度で作成してください。`;

    case "implementation_plan":
      return `${baseContext}
      
「実施計画」セクションを詳細に作成してください：

1. プロジェクト全体のスケジュール（月単位での詳細な工程表）
2. 各フェーズでの具体的な作業内容と成果物
3. 実施体制（責任者、担当者、外部委託先等）
4. 想定されるリスク要因と具体的な対策
5. 進捗管理方法と品質管理体制
6. プロジェクト完了後の運用・保守計画

実現可能で具体的な計画として、1200文字程度で作成してください。`;

    case "expected_effects":
      return `${baseContext}
      
「期待される効果」セクションを作成してください：

1. 業務効率化の具体的な効果（時間短縮、コスト削減等）
2. 定量的な効果測定指標と目標値
3. 売上向上や競争力強化への貢献
4. 従業員の働き方改善効果
5. 中長期的な事業発展への影響
6. 地域経済や社会への波及効果

数値を含めた具体的で説得力のある内容で、800文字程度で作成してください。`;

    default:
      return `${baseContext}
      
「${getSectionTitle(sectionKey)}」セクションの内容を、補助金申請書として適切な形式で詳細に作成してください。
具体的で説得力があり、審査員が評価しやすい内容にしてください。`;
  }
}

function getSectionTitle(sectionKey: string): string {
  const titles: { [key: string]: string } = {
    business_overview: "事業計画の概要",
    expense_details: "経費内訳",
    implementation_plan: "実施計画",
    expected_effects: "期待される効果",
    management_system: "実施体制",
    risk_management: "リスク管理",
    follow_up_plan: "フォローアップ計画",
  };

  return titles[sectionKey] || sectionKey;
}

function generateFallbackContent(
  sectionKey: string,
  companyInfo: any,
  subsidyData: any,
): string {
  // Gemini API生成に失敗した場合のテンプレートベース生成
  switch (sectionKey) {
    case "business_overview":
      return `【事業概要】
弊社${companyInfo.name}は、${companyInfo.industry}業界において${companyInfo.business_description}を行っております。
設立${companyInfo.establishment_year}年、従業員数${companyInfo.employee_count_category}の企業として、地域の${companyInfo.prefecture}を拠点に事業を展開しております。

【現在の課題】
現状の業務プロセスにおいて、手作業による処理が多く、業務効率の向上が急務となっております。
特に、データ管理や顧客対応の分野において、デジタル化による改善の余地が大きいと認識しております。

【導入予定技術】
${subsidyData.name}を活用し、以下のシステム導入を計画しております：
・クラウドベースの業務管理システム
・顧客関係管理（CRM）システム
・データ分析ツール

【期待効果】
本事業により、業務時間の20%削減、顧客満足度の10%向上、売上の15%増加を目標としております。

※この内容はテンプレートです。詳細な内容に編集してください。`;

    case "expense_details":
      return `【経費内訳】

1. ソフトウェア導入費用
   - 業務管理システム: 1,200,000円
   - CRMシステム: 800,000円
   - データ分析ツール: 600,000円

2. ハードウェア費用
   - サーバー機器: 500,000円
   - 端末機器: 400,000円

3. 導入支援費用
   - システム構築委託費: 700,000円
   - 研修費用: 200,000円

【合計】
補助対象経費合計: 4,400,000円
補助金申請額: 2,200,000円（補助率1/2の場合）

※この内容はテンプレートです。実際の見積もりに基づいて調整してください。`;

    default:
      return `【${getSectionTitle(sectionKey)}】
この項目の詳細な内容をご記入ください。

企業情報と${subsidyData.name}の要件に合わせて、適切な内容を作成してください。
具体的で説得力のある内容にすることが重要です。

※この内容はテンプレートです。詳細な内容に編集してください。`;
  }
}
