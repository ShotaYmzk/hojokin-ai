// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CompanyInfo {
  id: string;
  industry: string;
  employeeCount: number;
  capitalAmount: number;
  prefecture: string;
  annualRevenue: number;
}

interface SubsidyInfo {
  id: string;
  name: string;
  organization: string;
  summary: string;
  targetAudience: string;
  categories: string[];
  industries: string[];
  employeeCountMin?: number;
  employeeCountMax?: number;
  capitalAmountMin?: number;
  capitalAmountMax?: number;
  prefecture?: string;
  applicationPeriodEnd: string;
  maxAmount: string;
  subsidyRate: string;
}

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // JWTからユーザーIDを取得（実際の実装では適切なJWT検証が必要）
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    // 企業情報を取得
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (companyError || !companyData) {
      return NextResponse.json(
        { error: '企業情報が見つかりません' },
        { status: 400 }
      );
    }

    // アクティブな補助金制度を取得
    const { data: subsidies, error: subsidiesError } = await supabase
      .from('subsidies')
      .select('*')
      .eq('status', 'active')
      .gte('application_period_end', new Date().toISOString().split('T')[0]);

    if (subsidiesError) {
      console.error('補助金取得エラー:', subsidiesError);
      return NextResponse.json(
        { error: '補助金情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // レコメンデーションスコアを計算
    const recommendations = subsidies
      .map((subsidy: SubsidyInfo) => ({
        ...subsidy,
        score: calculateMatchingScore(companyData, subsidy),
        reasoning: generateRecommendationReasoning(companyData, subsidy)
      }))
      .filter(rec => rec.score > 0.3) // 閾値以上のもののみ
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // 上位10件

    // レコメンデーション履歴を保存
    if (recommendations.length > 0) {
      const recommendationRecords = recommendations.map(rec => ({
        user_id: user.id,
        company_id: companyData.id,
        subsidy_id: rec.id,
        score: rec.score,
        reasoning: rec.reasoning
      }));

      await supabase
        .from('recommendations')
        .insert(recommendationRecords);
    }

    return NextResponse.json({
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        name: rec.name,
        organization: rec.organization,
        summary: rec.summary,
        score: rec.score,
        reasoning: rec.reasoning,
        maxAmount: rec.maxAmount,
        subsidyRate: rec.subsidyRate,
        deadline: rec.applicationPeriodEnd,
        categories: rec.categories
      }))
    });

  } catch (error) {
    console.error('レコメンデーションAPI エラー:', error);
    return NextResponse.json(
      { error: 'レコメンデーション処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

function calculateMatchingScore(company: CompanyInfo, subsidy: SubsidyInfo): number {
  let score = 0;
  let totalFactors = 0;

  // 業種マッチング（重要度: 高）
  if (subsidy.industries && subsidy.industries.length > 0) {
    totalFactors += 3;
    if (subsidy.industries.includes(company.industry)) {
      score += 3;
    } else if (subsidy.industries.includes('全業種') || subsidy.industries.includes('すべて')) {
      score += 2;
    }
  }

  // 従業員数マッチング（重要度: 中）
  if (subsidy.employeeCountMin !== undefined || subsidy.employeeCountMax !== undefined) {
    totalFactors += 2;
    const minOk = !subsidy.employeeCountMin || company.employeeCount >= subsidy.employeeCountMin;
    const maxOk = !subsidy.employeeCountMax || company.employeeCount <= subsidy.employeeCountMax;
    
    if (minOk && maxOk) {
      score += 2;
    } else if (minOk || maxOk) {
      score += 1;
    }
  }

  // 資本金マッチング（重要度: 中）
  if (subsidy.capitalAmountMin !== undefined || subsidy.capitalAmountMax !== undefined) {
    totalFactors += 2;
    const minOk = !subsidy.capitalAmountMin || company.capitalAmount >= subsidy.capitalAmountMin;
    const maxOk = !subsidy.capitalAmountMax || company.capitalAmount <= subsidy.capitalAmountMax;
    
    if (minOk && maxOk) {
      score += 2;
    } else if (minOk || maxOk) {
      score += 1;
    }
  }

  // 地域マッチング（重要度: 低）
  if (subsidy.prefecture) {
    totalFactors += 1;
    if (subsidy.prefecture === company.prefecture || subsidy.prefecture === '全国') {
      score += 1;
    }
  }

  // 対象者マッチング（重要度: 中）
  if (subsidy.targetAudience) {
    totalFactors += 2;
    const targetKeywords = ['中小企業', '小規模事業者', 'スタートアップ', 'ベンチャー'];
    const hasMatch = targetKeywords.some(keyword => 
      subsidy.targetAudience.includes(keyword)
    );
    
    if (hasMatch) {
      score += 2;
    }
  }

  // 年間売上による調整
  if (company.annualRevenue) {
    totalFactors += 1;
    // 売上規模に応じた補正
    if (company.annualRevenue <= 100000000) { // 1億円以下
      if (subsidy.name.includes('小規模') || subsidy.name.includes('創業')) {
        score += 1;
      }
    } else if (company.annualRevenue <= 1000000000) { // 10億円以下
      if (subsidy.name.includes('中小企業')) {
        score += 1;
      }
    }
  }

  // 申請期限による調整
  const deadline = new Date(subsidy.applicationPeriodEnd);
  const now = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 30) {
    score *= 0.8; // 期限が近い場合は優先度を下げる
  } else if (daysLeft > 180) {
    score *= 0.9; // 期限が遠い場合は少し優先度を下げる
  }

  return totalFactors > 0 ? Math.min(score / totalFactors, 1.0) : 0;
}

function generateRecommendationReasoning(company: CompanyInfo, subsidy: SubsidyInfo): string {
  const reasons = [];

  // 業種マッチング
  if (subsidy.industries && subsidy.industries.includes(company.industry)) {
    reasons.push(`貴社の業種（${company.industry}）が対象業種に含まれています`);
  }

  // 従業員数
  if (subsidy.employeeCountMin !== undefined || subsidy.employeeCountMax !== undefined) {
    const minOk = !subsidy.employeeCountMin || company.employeeCount >= subsidy.employeeCountMin;
    const maxOk = !subsidy.employeeCountMax || company.employeeCount <= subsidy.employeeCountMax;
    
    if (minOk && maxOk) {
      reasons.push(`貴社の従業員数（${company.employeeCount}名）が対象規模に適合しています`);
    }
  }

  // 地域
  if (subsidy.prefecture === company.prefecture) {
    reasons.push(`貴社所在地（${company.prefecture}）が対象地域です`);
  } else if (subsidy.prefecture === '全国') {
    reasons.push('全国対象の制度です');
  }

  // 制度の特徴
  if (subsidy.categories) {
    const categoryText = subsidy.categories.join('、');
    reasons.push(`${categoryText}分野の支援制度です`);
  }

  return reasons.length > 0 ? reasons.join('。') + '。' : '貴社の条件に適合する可能性があります。';
}