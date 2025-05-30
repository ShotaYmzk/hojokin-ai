// File: /app/(app)/subsidies/search/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // next/navigationから

// HeroUIコンポーネント (実際のインポートパスに合わせてください)
// import { Input } from "@heroui/input";
// import { Button } from "@heroui/button";
// import { Select, SelectItem } from "@heroui/react";
// import { CheckboxGroup, Checkbox } from "@heroui/react";
// import { Card, CardBody, CardFooter } from "@heroui/card";
// import { Pagination } from "@heroui/pagination";
// import { Spinner } from "@heroui/spinner";
// import { Chip } from "@heroui/chip";

// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
const Input: React.FC<any> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  startContent,
}) => (
  <div className={className}>
    {label && (
      <label
        className="block text-sm font-medium text-foreground-700 mb-1"
        htmlFor={name}
      >
        {label}
      </label>
    )}
    <div className="relative">
      {startContent && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {startContent}
        </div>
      )}
      <input
        className={`w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 ${startContent ? "pl-10" : ""}`}
        id={name}
        name={name}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);
const Button: React.FC<any> = ({
  children,
  onClick,
  type = "button",
  color = "default",
  isLoading,
  disabled,
  fullWidth,
  className,
  variant,
  size,
}) => {
  const colorClasses =
    color === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-focus"
      : variant === "bordered"
        ? "border border-default-300 text-foreground hover:bg-default-100"
        : "bg-default-200 text-default-800 hover:bg-default-300";
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <button
      className={`font-medium transition-colors rounded-md ${sizeClasses} ${colorClasses} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={isLoading || disabled}
      type={type}
      onClick={onClick}
    >
      {isLoading && <Spinner className="mr-2" color="current" size="sm" />}
      {isLoading ? "処理中..." : children}
    </button>
  );
};
const Select: React.FC<any> = ({
  label,
  name,
  value,
  onChange,
  children,
  className,
}) => (
  <div className={className}>
    {label && (
      <label
        className="block text-sm font-medium text-foreground-700 mb-1"
        htmlFor={name}
      >
        {label}
      </label>
    )}
    <select
      className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  </div>
);
const Checkbox: React.FC<any> = ({ label, name, checked, onChange, value }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      checked={checked}
      className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary"
      name={name}
      type="checkbox"
      value={value}
      onChange={onChange}
    />
    <span className="text-sm text-foreground-700">{label}</span>
  </label>
);
const Card: React.FC<any> = ({ children, className, isPressable, onPress }) => (
  isPressable ? (
    <button
      type="button"
      onClick={onPress}
      onKeyDown={e => { if (isPressable && (e.key === 'Enter' || e.key === ' ')) onPress?.(e); }}
      className={`bg-background shadow-lg rounded-xl border border-divider text-left w-full ${isPressable ? 'cursor-pointer hover:shadow-primary-glow transition-shadow focus:outline-none focus:ring-2 focus:ring-primary' : ''} ${className}`}
      disabled={!isPressable}
    >
      {children}
    </button>
  ) : (
    <div className={`bg-background shadow-lg rounded-xl border border-divider ${className}`}>{children}</div>
  )
);
const CardBody: React.FC<any> = ({ children, className }) => (
  <div className={`p-4 md:p-6 ${className}`}>{children}</div>
);
const CardFooter: React.FC<any> = ({ children, className }) => (
  <div
    className={`p-4 md:p-6 border-t border-divider bg-content2 rounded-b-xl ${className}`}
  >
    {children}
  </div>
);
const Pagination: React.FC<any> = ({ total, initialPage, _onChange, className }) => {
  /* HeroUIのPaginationを想定したダミー */ return (
    <div className={`flex justify-center items-center space-x-2 ${className}`}>
      <span>◀</span>{" "}
      <span>
        Page {initialPage} of {total}
      </span>{" "}
      <span>▶</span>
    </div>
  );
};
const Spinner: React.FC<any> = ({ _size, _color, className }) => (
  <div
    className={`animate-spin rounded-full border-2 border-current border-t-transparent h-5 w-5 ${className}`}
  />
);
const Chip: React.FC<any> = ({
  children,
  _color = "default",
  _size = "md",
  className,
}) => {
  return (
    <span
      className={`px-2.5 py-0.5 text-xs rounded-full font-medium bg-default-200 text-default-800 ${className}`}
    >
      {children}
    </span>
  );
};

// 型定義
interface SubsidyResult {
  id: string;
  name: string;
  summary: string; // 概要
  organization: string; // 実施機関
  categories: string[]; // IT, 研究開発, 販路開拓など
  targetAudience: string; // 対象者 (中小企業、小規模事業者など)
  deadline?: string; // 締切日 (あれば)
  matchScore?: number; // 企業情報とのマッチ度 (あれば)
}

interface SearchFilters {
  keyword: string;
  industry: string; // 企業情報からデフォルトセット
  region: string; // 企業情報からデフォルトセット
  purpose: string[]; // 複数選択可能な目的 (設備投資, 研究開発, 雇用促進など)
  minAmount: string; // 最低補助金額
}

// ダミーデータ (実際にはAPIから取得)
const dummySubsidies: SubsidyResult[] = [
  {
    id: "1",
    name: "IT導入補助金2025",
    summary:
      "中小企業・小規模事業者等のITツール導入を支援し、生産性向上を図る。",
    organization: "経済産業省 中小企業庁",
    categories: ["IT導入", "業務効率化"],
    targetAudience: "中小企業・小規模事業者",
    deadline: "2025-06-30",
    matchScore: 92,
  },
  {
    id: "2",
    name: "ものづくり・商業・サービス生産性向上促進補助金",
    summary:
      "革新的な製品・サービス開発や生産プロセス改善に必要な設備投資等を支援。",
    organization: "全国中小企業団体中央会",
    categories: ["設備投資", "新サービス開発"],
    targetAudience: "中小企業・小規模事業者",
    deadline: "2025-05-20",
    matchScore: 85,
  },
  {
    id: "3",
    name: "小規模事業者持続化補助金",
    summary:
      "小規模事業者の販路開拓や生産性向上の取組を支援。商工会・商工会議所と連携。",
    organization: "日本商工会議所",
    categories: ["販路開拓", "広報"],
    targetAudience: "小規模事業者",
    matchScore: 78,
  },
  {
    id: "4",
    name: "事業再構築補助金",
    summary:
      "ポストコロナ・ウィズコロナ時代の経済社会の変化に対応するための事業再構築を支援。",
    organization: "中小企業庁",
    categories: ["事業転換", "新分野展開"],
    targetAudience: "中小企業等",
    deadline: "2025-07-15",
  },
  {
    id: "5",
    name: "キャリアアップ助成金",
    summary:
      "非正規雇用労働者の企業内でのキャリアアップを促進するための取組を実施した事業主に対して助成。",
    organization: "厚生労働省",
    categories: ["雇用関連", "人材育成"],
    targetAudience: "全事業者",
  },
];

const industries = [
  "卸売業、小売業",
  "製造業",
  "建設業",
  "情報通信業",
  "その他",
]; // 簡略化
const regions = [
  "全国",
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
];
const purposes = [
  { id: "equipment", label: "設備投資" },
  { id: "rd", label: "研究開発" },
  { id: "sales_expansion", label: "販路開拓・マーケティング" },
  { id: "it_digital", label: "IT導入・DX" },
  { id: "employment", label: "雇用・人材育成" },
  { id: "business_conversion", label: "事業転換・新分野進出" },
  { id: "startup", label: "創業・起業支援" },
  { id: "overseas", label: "海外展開" },
];

export default function SubsidySearchPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    industry: "",
    region: "",
    purpose: [],
    minAmount: "",
  });
  const [searchResults, setSearchResults] = useState<SubsidyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 1ページあたりの表示件数

  useEffect(() => {
    // 企業情報からデフォルトのフィルタ値を設定 (localStorageから仮取得)
    const storedUserString = localStorage.getItem("userCompanyProfile"); // 仮のキー

    if (storedUserString) {
      try {
        const companyProfile = JSON.parse(storedUserString);

        setFilters((prev) => ({
          ...prev,
          industry: companyProfile.industry || "",
          // region: mapPrefectureToRegion(companyProfile.prefecture) || '', // 都道府県から地域をマッピングする関数が必要
        }));
      } catch (e) {
        console.error("Failed to parse company profile from localStorage", e);
      }
    }
    // 初期検索実行 (または全件表示)
    performSearch();
  }, []);

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurposeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    setFilters((prev) => ({
      ...prev,
      purpose: checked
        ? [...prev.purpose, value]
        : prev.purpose.filter((p) => p !== value),
    }));
  };

  const performSearch = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    setIsLoading(true);
    console.log("Searching with filters:", filters);
    // APIコールをシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // ダミーフィルタリングロジック
    let results = dummySubsidies.filter((subsidy) => {
      let match = true;

      if (
        filters.keyword &&
        !subsidy.name.toLowerCase().includes(filters.keyword.toLowerCase()) &&
        !subsidy.summary.toLowerCase().includes(filters.keyword.toLowerCase())
      ) {
        match = false;
      }
      if (
        filters.industry &&
        !subsidy.categories.some((cat) =>
          cat.toLowerCase().includes(filters.industry.toLowerCase()),
        ) &&
        subsidy.targetAudience.toLowerCase() !== filters.industry.toLowerCase()
      ) {
        // 実際には業種コードなどでより厳密にマッチング
        // match = false;
      }
      // ... 他のフィルタ条件
      if (
        filters.purpose.length > 0 &&
        !filters.purpose.some((p) =>
          subsidy.categories.some((cat) =>
            cat.toLowerCase().includes(p.toLowerCase()),
          ),
        )
      ) {
        // match = false;
      }

      return match;
    });

    setSearchResults(results);
    setCurrentPage(1); // 検索実行時は1ページ目に戻る
    setIsLoading(false);
  };

  const paginatedResults = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          補助金・助成金検索
        </h1>
        <p className="text-foreground-500">
          あなたのビジネスに最適な支援制度を見つけましょう。
        </p>
      </header>

      {/* 検索フィルターフォーム */}
      <Card>
        <form onSubmit={performSearch}>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Input
              label="キーワード"
              name="keyword"
              placeholder="制度名、目的、キーワードなど"
              startContent={<span className="text-default-400">🔍</span>}
              value={filters.keyword}
              onChange={handleFilterChange}
            />
            <Select
              label="業種"
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
            >
              <option value="">全ての業種</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </Select>
            <Select
              label="地域"
              name="region"
              value={filters.region}
              onChange={handleFilterChange}
            >
              <option value="">全国</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </Select>
            <Input
              label="最低補助金額 (万円)"
              name="minAmount"
              placeholder="例: 100"
              type="number"
              value={filters.minAmount}
              onChange={handleFilterChange}
            />
            <div className="md:col-span-2 lg:col-span-4">
              <fieldset>
                <legend className="block text-sm font-medium text-foreground-700 mb-2">
                  目的・用途 (複数選択可)
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                  {purposes.map((p) => (
                    <Checkbox
                      key={p.id}
                      checked={filters.purpose.includes(p.id)}
                      label={p.label}
                      name="purpose"
                      value={p.id}
                      onChange={handlePurposeChange}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          </CardBody>
          <CardFooter className="flex justify-end">
            <Button
              color="primary"
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
            >
              検索する
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 検索結果表示エリア */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner color="primary" size="lg" />
            <p className="ml-3 text-foreground-600">
              補助金を検索しています...
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-foreground-600">
              {searchResults.length}件の補助金が見つかりました。
            </p>
            {paginatedResults.map((subsidy) => (
              <Card
                key={subsidy.id}
                isPressable
                onPress={() => router.push(`/subsidies/${subsidy.id}`)}
              >
                <CardBody>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <h2 className="text-xl font-semibold text-primary hover:underline">
                      <Link href={`/subsidies/${subsidy.id}`}>
                        {subsidy.name}
                      </Link>
                    </h2>
                    {subsidy.matchScore && (
                      <Chip className="flex-shrink-0" color="success">
                        マッチ度: {subsidy.matchScore}%
                      </Chip>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-foreground-600 line-clamp-2">
                    {subsidy.summary}
                  </p>
                  <div className="mt-3 text-xs text-foreground-500 space-x-3">
                    <span>実施機関: {subsidy.organization}</span>
                    <span>対象: {subsidy.targetAudience}</span>
                  </div>
                  {subsidy.categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {subsidy.categories.map((cat) => (
                        <Chip key={cat} size="sm">
                          {cat}
                        </Chip>
                      ))}
                    </div>
                  )}
                </CardBody>
                <CardFooter className="flex justify-between items-center">
                  {subsidy.deadline ? (
                    <p className="text-xs text-danger-600">
                      締切: {subsidy.deadline}
                    </p>
                  ) : (
                    <p className="text-xs text-foreground-400">締切情報なし</p>
                  )}
                  <Link href={`/subsidies/${subsidy.id}`}>
                    <Button size="sm" variant="bordered">
                      詳細を見る →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            {searchResults.length > itemsPerPage && (
              <Pagination
                initialPage={currentPage}
                total={Math.ceil(searchResults.length / itemsPerPage)}
                className="mt-8"
                onChange={(page: number) => setCurrentPage(page)}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-foreground-500 mb-2">
              検索条件に一致する補助金は見つかりませんでした。
            </p>
            <p className="text-foreground-400">
              検索条件を変更して再度お試しください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
