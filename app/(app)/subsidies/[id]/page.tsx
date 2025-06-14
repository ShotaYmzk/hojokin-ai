// File: /app/(app)/subsidies/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// --- 型定義の拡張 ---
interface SubsidyDetail {
  id: string;
  name: string;
  summary: string;
  organization: string;
  categories: string[];
  targetAudience: string;
  deadline?: string;
  purpose: string;
  eligibility: string;
  subsidyAmountDetails: string;
  applicationPeriod: string;
  applicationMethod: string;
  contactInfo: string;
  officialPageUrl?: string;
  requiredDocuments?: string[];
  notes?: string;
  eligibilityChecklist?: { id: string; text: string }[]; // ★申請要件チェックリストを追加
}

// --- ダミーデータの拡充 ---
const dummySubsidyDetails: { [key: string]: SubsidyDetail } = {
  "1": {
    id: "1",
    name: "IT導入補助金2025",
    summary:
      "中小企業・小規模事業者等のITツール導入を支援し、生産性向上を図る。",
    organization: "経済産業省 中小企業庁",
    categories: ["IT導入", "業務効率化"],
    targetAudience: "中小企業・小規模事業者",
    deadline: "2025-06-30",
    purpose:
      "ITツール（ソフトウェア、サービス等）の導入にかかる経費の一部を補助することで、中小企業・小規模事業者の生産性向上を支援する。",
    eligibility:
      "日本国内に本社及び事業所を有する中小企業・小規模事業者等であること。\n交付申請時点において、IT導入支援事業者が登録するITツールを導入する計画があること。\n生産性向上に係る情報（売上、原価、従業員数及び就業時間、給与支給総額等）を事務局に報告すること。",
    subsidyAmountDetails:
      "補助率：1/2以内 (一部類型では2/3、3/4以内)\n補助上限額・下限額：類型により異なる (例: 通常枠 A類型 5万円～150万円未満、B類型 150万円～450万円以下)",
    applicationPeriod:
      "2024年X月X日 ～ 2025年6月30日 (複数回締切あり、最終締切)",
    applicationMethod:
      "電子申請システム「jGrants」を利用した申請。\n申請にはGビズIDプライムアカウントの取得が必要。\nIT導入支援事業者との連携が必須。",
    contactInfo: "IT導入補助金コールセンター: 0570-XXX-XXX (平日9:30～17:30)",
    officialPageUrl: "https://www.it-hojo.jp/",
    requiredDocuments: [
      "履歴事項全部証明書",
      "法人税の納税証明書（その１またはその２）",
      "導入するITツールの見積書・契約書案",
      "事業計画書（指定様式）",
    ],
    notes:
      "申請類型や申請枠によって要件・補助額が細かく異なります。必ず最新の公募要領をご確認ください。",
    // ★チェックリストの項目を追加
    eligibilityChecklist: [
      { id: "check1", text: "日本国内に本社・事業所がある" },
      { id: "check2", text: "中小企業・小規模事業者である" },
      { id: "check3", text: "GビズIDプライムを取得済み、または取得予定である" },
      {
        id: "check4",
        text: "IT導入支援事業者が登録したITツールを導入する計画がある",
      },
    ],
  },
  "2": {
    id: "2",
    name: "ものづくり補助金",
    summary:
      "革新的な製品・サービス開発や生産プロセス改善に必要な設備投資等を支援。",
    organization: "全国中小企業団体中央会",
    categories: ["設備投資", "新サービス開発"],
    targetAudience: "中小企業・小規模事業者",
    deadline: "2025-05-20",
    purpose:
      "中小企業・小規模事業者等が取り組む革新的な製品・サービス開発又は生産プロセス・サービス提供方法の改善に必要な設備・システム投資等を支援します。",
    eligibility:
      "日本国内に本社及び開発拠点を有する中小企業・小規模事業者であること。特定の要件を満たす事業計画を有すること。",
    subsidyAmountDetails:
      "補助上限額：類型により異なる（例：通常枠 750万円～1,250万円）。補助率：1/2（小規模事業者は2/3）。",
    applicationPeriod: "公募回により異なる。公式サイトで確認が必要。",
    applicationMethod: "電子申請システムを利用。GビズIDプライムが必須。",
    contactInfo:
      "ものづくり補助金事務局サポートセンター: 電話番号 XXXX-XX-XXXX",
    officialPageUrl: "https://portal.monodukuri-hojo.jp/",
    requiredDocuments: [
      "事業計画書",
      "決算書（直近2期分）",
      "労働者名簿の写し",
      "賃金引上げ計画の表明書",
    ],
    notes:
      "加点項目や特別枠など、有利に進めるためのポイントがあります。公募要領の熟読が不可欠です。",
    eligibilityChecklist: [
      { id: "check1", text: "中小企業・小規模事業者である" },
      { id: "check2", text: "給与支給総額の年率平均1.5%以上の増加計画がある" },
      {
        id: "check3",
        text: "事業場内最低賃金を地域別最低賃金より30円以上高く設定する計画がある",
      },
      { id: "check4", text: "認定経営革新等支援機関の確認を受けている" },
    ],
  },
};

// --- UIコンポーネント (仮) ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={`bg-background shadow-lg rounded-xl border border-divider ${className}`}
  >
    {children}
  </div>
);
const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`p-6 border-b border-divider ${className}`}>{children}</div>
);
const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={`p-6 ${className}`}>{children}</div>;

const Button: React.FC<any> = ({
  children,
  onClick,
  color = "default",
  disabled,
  fullWidth,
  className,
  as,
  href,
  ...props
}) => {
  const colorClasses =
    color === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-focus"
      : color === "success"
        ? "bg-success text-success-foreground hover:bg-success-focus"
        : "bg-default-200 text-default-800 hover:bg-default-300";
  const commonClasses = `inline-block text-center px-4 py-2 text-sm font-medium transition-colors rounded-md ${colorClasses} ${
    fullWidth ? "w-full" : ""
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  if (as === Link) {
    return (
      <Link className={commonClasses} href={href || "#"} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={commonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  className?: string;
}> = ({ children, color = "default", className }) => {
  const colors: Record<string, string> = {
    default: "bg-default-200 text-default-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    danger: "bg-danger-100 text-danger-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
        colors[color] || colors.default
      } ${className}`}
    >
      {children}
    </span>
  );
};

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`animate-spin rounded-full border-2 border-current border-t-transparent h-8 w-8 ${className}`}
  />
);

export default function SubsidyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subsidyId = typeof params.id === "string" ? params.id : undefined;

  const [subsidy, setSubsidy] = useState<SubsidyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedRequirements, setCheckedRequirements] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (subsidyId) {
      const fetchSubsidyDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const data = dummySubsidyDetails[subsidyId];

          if (!data) {
            throw new Error("指定された補助金は見つかりませんでした。");
          }
          setSubsidy(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubsidyDetail();
    }
  }, [subsidyId]);

  const handleRequirementCheck = (checkId: string) => {
    setCheckedRequirements((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(checkId)) {
        newSet.delete(checkId);
      } else {
        newSet.add(checkId);
      }

      return newSet;
    });
  };

  const allRequirementsChecked = subsidy?.eligibilityChecklist
    ? checkedRequirements.size === subsidy.eligibilityChecklist.length
    : false;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-danger-600 mb-4">{error}</p>
        <Button
          color="primary"
          onClick={() => router.push("/subsidies/search")}
        >
          検索ページに戻る
        </Button>
      </div>
    );
  }

  if (!subsidy) {
    return null;
  }

  const detailSections = [
    { title: "目的", content: subsidy.purpose },
    { title: "対象者の詳細条件", content: subsidy.eligibility },
    { title: "補助額・補助率", content: subsidy.subsidyAmountDetails },
    { title: "申請期間", content: subsidy.applicationPeriod },
    { title: "申請方法", content: subsidy.applicationMethod },
    {
      title: "主要な必要書類",
      content:
        subsidy.requiredDocuments?.join("\n") || "公募要領をご確認ください。",
    },
    { title: "注意事項・備考", content: subsidy.notes },
    { title: "問い合わせ先", content: subsidy.contactInfo },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="pt-4">
        <button
          className="text-sm text-foreground-500 hover:text-foreground-800 mb-4"
          onClick={() => router.back()}
        >
          ← 検索結果に戻る
        </button>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {subsidy.name}
        </h1>
        <p className="mt-2 text-lg text-foreground-500">{subsidy.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <Chip color="primary">{subsidy.organization}</Chip>
          <Chip>{subsidy.targetAudience}</Chip>
          {subsidy.categories.map((cat: string) => (
            <Chip key={cat}>{cat}</Chip>
          ))}
          {subsidy.deadline && (
            <Chip color="danger">締切: {subsidy.deadline}</Chip>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {subsidy.eligibilityChecklist &&
            subsidy.eligibilityChecklist.length > 0 && (
              <Card className="border-primary-300 bg-primary-50">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-primary-800">
                    申請要件チェックリスト
                  </h2>
                  <p className="text-sm text-primary-700 mt-1">
                    申請を開始する前に、すべての要件を満たしているか確認しましょう。
                  </p>
                </CardHeader>
                <CardBody className="space-y-3">
                  {subsidy.eligibilityChecklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center p-3 bg-background rounded-lg cursor-pointer hover:bg-default-50"
                    >
                      <input
                        checked={checkedRequirements.has(item.id)}
                        className="form-checkbox h-5 w-5 text-primary rounded border-default-400 focus:ring-primary"
                        type="checkbox"
                        onChange={() => handleRequirementCheck(item.id)}
                      />
                      <span className="ml-3 text-sm font-medium text-foreground-800">
                        {item.text}
                      </span>
                    </label>
                  ))}
                </CardBody>
              </Card>
            )}

          {detailSections.map(
            (section) =>
              section.content && (
                <Card key={section.title}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold text-foreground-800">
                      {section.title}
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <p className="text-foreground-700 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </CardBody>
                </Card>
              ),
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
          <Card>
            <CardBody className="space-y-4">
              {subsidy.officialPageUrl && (
                <Button
                  fullWidth
                  as={Link}
                  color="primary"
                  href={subsidy.officialPageUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  🌐 公式ページで詳細を確認
                </Button>
              )}
              <Button
                fullWidth
                color="success"
                disabled={!allRequirementsChecked}
                title={
                  !allRequirementsChecked
                    ? "先にすべての申請要件をチェックしてください"
                    : ""
                }
                onClick={() =>
                  router.push(`/documents/create?subsidyId=${subsidy.id}`)
                }
              >
                📝 この内容で書類作成に進む
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-foreground-700">
                関連情報
              </h3>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link className="text-primary hover:underline" href="#">
                    この補助金の採択事例を見る
                  </Link>
                </li>
                <li>
                  <Link className="text-primary hover:underline" href="#">
                    申請サポート専門家を探す
                  </Link>
                </li>
                <li>
                  <Link className="text-primary hover:underline" href="/faq">
                    よくある質問 (FAQ)
                  </Link>
                </li>
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
