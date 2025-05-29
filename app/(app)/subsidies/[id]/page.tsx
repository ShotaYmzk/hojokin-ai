// File: /app/(app)/subsidies/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// HeroUIコンポーネント (実際のインポートパスに合わせてください)
// import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
// import { Button } from "@heroui/button";
// import { Chip } from "@heroui/chip";
// import { Spinner } from "@heroui/spinner";
// import { Tabs, Tab } from "@heroui/react";

// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
const Card: React.FC<any> = ({ children, className }) => <div className={`bg-background shadow-lg rounded-xl border border-divider ${className}`}>{children}</div>;
const CardHeader: React.FC<any> = ({ children, className }) => <div className={`p-6 border-b border-divider ${className}`}>{children}</div>;
const CardBody: React.FC<any> = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardFooter: React.FC<any> = ({ children, className }) => <div className={`p-6 border-t border-divider bg-content2 rounded-b-xl ${className}`}>{children}</div>;
const Button: React.FC<any> = ({ children, onClick, type = "button", color = "default", isLoading, disabled, fullWidth, className, variant, size, as, href }) => {
    const colorClasses = color === "primary" ? "bg-primary text-primary-foreground hover:bg-primary-focus"
                       : color === "success" ? "bg-success text-success-foreground hover:bg-success-focus"
                       : variant === "bordered" ? "border border-default-300 text-foreground hover:bg-default-100"
                       : "bg-default-200 text-default-800 hover:bg-default-300";
    const sizeClasses = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
    const commonClasses = `font-medium transition-colors rounded-md ${sizeClasses} ${colorClasses} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;
    if (as === Link) return <Link href={href || "#"} className={commonClasses} onClick={onClick} aria-disabled={disabled}>{children}</Link>;
    return <button type={type} onClick={onClick} disabled={isLoading || disabled} className={commonClasses}>{children}</button>
};
const Chip: React.FC<any> = ({children, color = "default", size = "md", className}) => {
    const colors: Record<string, string> = {
        default: "bg-default-200 text-default-800",
        primary: "bg-primary-100 text-primary-800",
        success: "bg-success-100 text-success-800",
        warning: "bg-warning-100 text-warning-800",
        danger: "bg-danger-100 text-danger-800",
    };
    return <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${colors[color] || colors.default} ${className}`}>{children}</span>
};
const Spinner: React.FC<any> = ({size, color, className}) => <div className={`animate-spin rounded-full border-2 border-current border-t-transparent h-8 w-8 ${className}`}></div>;


// 型定義
// ★ SubsidyResult 型を定義 (または外部ファイルからインポート)
interface SubsidyResult {
  id: string;
  name: string;
  summary: string;
  organization: string;
  categories: string[];
  targetAudience: string;
  deadline?: string;
  matchScore?: number;
}

// ★ SubsidyDetail 型が SubsidyResult を拡張するように修正
interface SubsidyDetail extends SubsidyResult {
  purpose: string;
  eligibility: string;
  subsidyAmountDetails: string;
  applicationPeriod: string;
  applicationMethod: string;
  contactInfo: string;
  officialPageUrl?: string;
  requiredDocuments?: string[];
  notes?: string;
}

// ダミーデータ (実際にはAPIから取得)
// ★ dummySubsidyDetails の型を { [key: string]: SubsidyDetail } に指定
const dummySubsidyDetails: { [key: string]: SubsidyDetail } = {
  '1': {
    id: '1', // SubsidyResult から継承
    name: 'IT導入補助金2025', // SubsidyResult から継承
    summary: '中小企業・小規模事業者等のITツール導入を支援し、生産性向上を図る。', // SubsidyResult から継承
    organization: '経済産業省 中小企業庁', // SubsidyResult から継承
    categories: ['IT導入', '業務効率化'], // SubsidyResult から継承
    targetAudience: '中小企業・小規模事業者', // SubsidyResult から継承
    deadline: '2025-06-30', // SubsidyResult から継承
    matchScore: 92, // SubsidyResult から継承
    purpose: 'ITツール（ソフトウェア、サービス等）の導入にかかる経費の一部を補助することで、中小企業・小規模事業者の生産性向上を支援する。',
    eligibility: '日本国内に本社及び事業所を有する中小企業・小規模事業者等であること。\n交付申請時点において、IT導入支援事業者が登録するITツールを導入する計画があること。\n生産性向上に係る情報（売上、原価、従業員数及び就業時間、給与支給総額等）を事務局に報告すること。',
    subsidyAmountDetails: '補助率：1/2以内 (一部類型では2/3、3/4以内)\n補助上限額・下限額：類型により異なる (例: 通常枠 A類型 5万円～150万円未満、B類型 150万円～450万円以下)',
    applicationPeriod: '2024年X月X日 ～ 2025年6月30日 (複数回締切あり、最終締切)',
    applicationMethod: '電子申請システム「jGrants」を利用した申請。\n申請にはGビズIDプライムアカウントの取得が必要。\nIT導入支援事業者との連携が必須。',
    contactInfo: 'IT導入補助金コールセンター: 0570-XXX-XXX (平日9:30～17:30)',
    officialPageUrl: 'https://www.it-hojo.jp/',
    requiredDocuments: ['履歴事項全部証明書', '法人税の納税証明書（その１またはその２）', '導入するITツールの見積書・契約書案', '事業計画書（指定様式）'],
    notes: '申請類型や申請枠によって要件・補助額が細かく異なります。必ず最新の公募要領をご確認ください。'
  },
  // 他の補助金の詳細データも同様に定義
  '2': { // 例としてもう一つ追加
    id: '2',
    name: 'ものづくり補助金',
    summary: '革新的な製品・サービス開発や生産プロセス改善に必要な設備投資等を支援。',
    organization: '全国中小企業団体中央会',
    categories: ['設備投資', '新サービス開発'],
    targetAudience: '中小企業・小規模事業者',
    deadline: '2025-05-20',
    matchScore: 85,
    purpose: '中小企業・小規模事業者等が取り組む革新的な製品・サービス開発又は生産プロセス・サービス提供方法の改善に必要な設備・システム投資等を支援します。',
    eligibility: '日本国内に本社及び開発拠点を有する中小企業・小規模事業者であること。特定の要件を満たす事業計画を有すること。',
    subsidyAmountDetails: '補助上限額：類型により異なる（例：通常枠 750万円～1,250万円）。補助率：1/2（小規模事業者は2/3）。',
    applicationPeriod: '公募回により異なる。公式サイトで確認が必要。',
    applicationMethod: '電子申請システムを利用。GビズIDプライムが必須。',
    contactInfo: 'ものづくり補助金事務局サポートセンター: 電話番号 XXXX-XX-XXXX',
    officialPageUrl: 'https://portal.monodukuri-hojo.jp/',
    requiredDocuments: ['事業計画書', '決算書（直近2期分）', '労働者名簿の写し', '賃金引上げ計画の表明書'],
    notes: '加点項目や特別枠など、有利に進めるためのポイントがあります。公募要領の熟読が不可欠です。'
  }
};

export default function SubsidyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subsidyId = typeof params.id === 'string' ? params.id : undefined;

  const [subsidy, setSubsidy] = useState<SubsidyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subsidyId) {
      const fetchSubsidyDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
          const data = dummySubsidyDetails[subsidyId]; // ★ オブジェクトからキーでアクセス
          if (!data) {
            throw new Error('指定された補助金は見つかりませんでした。');
          }
          setSubsidy(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubsidyDetail();
    } else {
        setError("補助金IDが指定されていません。");
        setIsLoading(false);
    }
  }, [subsidyId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-foreground-600">補助金情報を読み込んでいます...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-danger-600 mb-4">{error}</p>
        <Button onClick={() => router.push('/subsidies/search')} color="primary">
          検索ページに戻る
        </Button>
      </div>
    );
  }

  if (!subsidy) {
    return <div className="text-center py-10">補助金情報が見つかりません。</div>;
  }

  const detailSections = [
    { title: "目的", content: subsidy.purpose },
    { title: "対象者の詳細条件", content: subsidy.eligibility },
    { title: "補助額・補助率", content: subsidy.subsidyAmountDetails },
    { title: "申請期間", content: subsidy.applicationPeriod },
    { title: "申請方法", content: subsidy.applicationMethod },
    { title: "主要な必要書類", content: subsidy.requiredDocuments?.join('\n') || '公募要領をご確認ください。' },
    { title: "注意事項・備考", content: subsidy.notes },
    { title: "問い合わせ先", content: subsidy.contactInfo },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="pt-4">
        <Button onClick={() => router.back()} variant="bordered" size="sm" className="mb-4">
          ← 検索結果に戻る
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{subsidy.name}</h1>
        <p className="mt-2 text-lg text-foreground-500">{subsidy.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <Chip color="primary">{subsidy.organization}</Chip>
          <Chip>{subsidy.targetAudience}</Chip>
          {subsidy.categories.map((cat: string) => <Chip key={cat}>{cat}</Chip>)} {/* ★ cat の型を明示 */}
          {subsidy.deadline && <Chip color="danger">締切: {subsidy.deadline}</Chip>}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {detailSections.map(section => (
            section.content && (
              <Card key={section.title}>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-foreground-800">{section.title}</h2>
                </CardHeader>
                <CardBody>
                  <p className="text-foreground-700 whitespace-pre-line leading-relaxed">{section.content}</p>
                </CardBody>
              </Card>
            )
          ))}
        </div>

        <aside className="md:col-span-1 space-y-6 md:sticky md:top-24 self-start">
          <Card>
            <CardBody className="space-y-4">
              {subsidy.officialPageUrl && (
                <Button
                  as={Link} // HeroUIのButtonがLinkコンポーネントをサポートする場合
                  href={subsidy.officialPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  fullWidth
                  className="flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🌐</span> 公式ページで詳細を確認
                </Button>
              )}
              <Button
                onClick={() => router.push(`/documents/generate?subsidyId=${subsidy.id}&subsidyName=${encodeURIComponent(subsidy.name)}`)}
                color="success"
                fullWidth
                className="flex items-center justify-center gap-2"
              >
                <span className="text-lg">🤖</span> AIで書類ドラフト作成
              </Button>
               <Button
                onClick={() => router.push(`/documents/create?subsidyId=${subsidy.id}&subsidyName=${encodeURIComponent(subsidy.name)}`)}
                variant="bordered"
                fullWidth
                className="flex items-center justify-center gap-2"
              >
                <span className="text-lg">📝</span> 手動で書類作成を開始
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader><h3 className="text-lg font-semibold text-foreground-700">関連情報</h3></CardHeader>
            <CardBody>
                <ul className="space-y-2 text-sm">
                    <li><Link href="#" className="text-primary hover:underline">この補助金の採択事例を見る</Link></li>
                    <li><Link href="#" className="text-primary hover:underline">申請サポート専門家を探す</Link></li>
                    <li><Link href="/faq" className="text-primary hover:underline">よくある質問 (FAQ)</Link></li>
                </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}