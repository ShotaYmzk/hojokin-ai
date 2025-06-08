// File: /app/(app)/subsidies/search/page.tsx
"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchSubsidies } from "@/lib/api"; // lib/api.ts からインポート (仮のパス)

import { paths } from "@/types/jgrants"; // ここは必須

type SubsidyListRes = paths["/subsidies"]["get"]["responses"]["200"]["content"]["application/json"];


// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
// Spinner, Chip は新しいコードで使われているので、UIコンポーネントの定義はそのまま活用します。
// Input, Button, Select, Card, CardBody, CardFooter, Pagination も既存のものを流用します。
const Input: React.FC<any> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  startContent,
  labelPlacement, // HeroUIのInputに合わせて追加
  onValueChange, // HeroUIのInputに合わせて追加
  isRequired, // HeroUIのInputに合わせて追加
}) => (
  <div className={className}>
    {label && labelPlacement !== "inside" && (
      <label
        className="block text-sm font-medium text-foreground-700 mb-1"
        htmlFor={name}
      >
        {label} {isRequired && <span className="text-danger">*</span>}
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
        onChange={onValueChange ? (e) => onValueChange(e.target.value) : onChange}
        required={isRequired}
      />
       {label && labelPlacement === "inside" && (
         <label htmlFor={name} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 pointer-events-none transition-all group-focus-within:top-2 group-focus-within:text-xs">
           {label}
         </label>
       )}
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
  labelPlacement, // HeroUIのSelectに合わせて追加
  onSelectionChange, // HeroUIのSelectに合わせて追加
  isRequired, // HeroUIのSelectに合わせて追加
}) => (
  <div className={className}>
    {label && labelPlacement !== "inside" && (
      <label
        className="block text-sm font-medium text-foreground-700 mb-1"
        htmlFor={name}
      >
        {label} {isRequired && <span className="text-danger">*</span>}
      </label>
    )}
    <select
      className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
      id={name}
      name={name}
      value={value}
      onChange={onSelectionChange ? (e) => onSelectionChange(e.target.value) : onChange}
      required={isRequired}
    >
      {children}
    </select>
  </div>
);

const Checkbox: React.FC<any> = ({ label, name, checked, onChange, value, isSelected, onValueChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      checked={isSelected ?? checked}
      className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary"
      name={name}
      type="checkbox"
      value={value}
      onChange={onValueChange ? (e) => onValueChange(e.target.checked) : onChange}
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
const Pagination: React.FC<{
  total: number;
  page: number;
  onChange: (page: number) => void;
  className?: string;
}> = ({ total, page, onChange, className }) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  if (total <= 1) return null;

  return (
    <nav aria-label="Pagination" className={`flex justify-center items-center space-x-2 ${className}`}>
      <Button
        size="sm"
        variant="bordered"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ◀<span className="sr-only">Previous</span>
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "solid" : "bordered"}
          color={p === page ? "primary" : "default"}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        size="sm"
        variant="bordered"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
      >
        ▶<span className="sr-only">Next</span>
      </Button>
    </nav>
  );
};


const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string; className?: string }> = ({ size = 'md', className }) => {
  const sizeClasses = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses} ${className}`}
    />
  );
};

const Chip: React.FC<{
  children: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default" | "info";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "dot";
  className?: string;
}> = ({ children, color = "default", size = "md", variant = "solid", className }) => {
  // 基本的なスタイル（実際のHeroUIのスタイルに合わせて調整が必要）
  const baseStyle = "px-2.5 py-0.5 text-xs rounded-full font-medium inline-flex items-center";
  const colorStyles: Record<string, string> = {
    default: "bg-default-200 text-default-800",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-sky-100 text-sky-700", // infoカラーの例
  };
  const variantStyles: Record<string, string> = {
    bordered: `border ${colorStyles[color]?.replace('bg-', 'border-').replace('text-', 'border-text-') || 'border-default-300'} text-${colorStyles[color]?.split(' ')[1]?.replace('text-','') || 'default-800'} bg-transparent`,
    // 他のvariantも同様に定義
  }


  return (
    <span
      className={`${baseStyle} ${variant === 'bordered' ? variantStyles.bordered : colorStyles[color] || colorStyles.default} ${className}`}
    >
      {children}
    </span>
  );
};


// 型定義
interface ApiSubsidyItem { // APIから返ってくるアイテムの型 (仮)
  id: string;
  name: string;
  title?: string;
  summary?: string;
  description?: string;
  organizer?: string;
  use_purpose?: string[];
  acceptance_status?: string;
  acceptance_end_datetime?: string;
  match_score?: number;
}

interface SubsidyResult { // UI表示用の型
  id: string;
  name: string;
  summary: string;
  organization: string;
  categories: string[];
  targetAudience: string; // 今回の新しいUIでは未使用だが、データとして保持
  deadline?: string;
  matchScore?: number;
  status?: string; // 募集状況
}

type SortType = "created_date" | "acceptance_start_datetime" | "acceptance_end_datetime";
type OrderType = "DESC" | "ASC";
type AcceptanceType = "0" | "1";

interface SearchParams {
  keyword: string;
  sort: SortType;
  order: OrderType;
  acceptance: AcceptanceType;
  page: number;
  limit: number;
}


interface ApiResponse { // searchSubsidies APIのレスポンス型 (仮)
  result: ApiSubsidyItem[];
  total: number; // 総件数
  page: number;
  limit: number;
}


export default function SubsidySearchPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: "",
    sort: "created_date",
    order: "DESC",
    acceptance: "1",
    page: 1,
    limit: 10,
  });  
  const [searchResults, setSearchResults] = useState<SubsidyResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const performSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const data: SubsidyListRes = await searchSubsidies(params);
  
      // 数値型で受け取る
      const count = Number(data.metadata?.resultset?.count ?? data.result.length);
      const limit = Number(data.metadata?.resultset?.limit ?? params.limit);
      const offset = Number(data.metadata?.resultset?.offset ?? 0);
      const page = Math.floor(offset / limit) + 1;
  
      const mappedResults: SubsidyResult[] = data.result.map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? ""),
        summary:
          typeof item.summary === "string"
            ? item.summary
            : typeof item.title === "string"
              ? item.title
              : typeof item.description === "string"
                ? item.description
                : "",
        organization: typeof item.organizer === "string" ? item.organizer : "N/A",
        categories: Array.isArray(item.use_purpose)
          ? item.use_purpose.map(String)
          : [],
        targetAudience: "",
        deadline: item.acceptance_end_datetime
          ? String(item.acceptance_end_datetime).substring(0, 10)
          : undefined,
        matchScore: typeof item.match_score === "number" ? item.match_score : undefined,
        status: typeof item.acceptance_status === "string" ? item.acceptance_status : undefined,
      }));
      
  
      setSearchResults(mappedResults);
      setTotalResults(count);
      setSearchParams(prev => ({
        ...prev,
        page,
        limit: Number(limit)
      }));
    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "検索中にエラーが発生しました。");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  useEffect(() => {
    // 初回レンダリング時または検索パラメータ変更時に検索実行
    performSearch(searchParams);
  }, [searchParams.page]); // page変更時のみ自動再検索。他のパラメータはsubmit時。

  const handleParamChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // 検索条件変更時は1ページ目に戻す
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    performSearch({ ...searchParams, page: 1 }); // 検索実行時は必ず1ページ目から
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };
  
  const totalPages = Math.ceil(totalResults / searchParams.limit);

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
        <form onSubmit={handleSubmit}>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <Input
              label="キーワード"
              name="keyword"
              placeholder="例：IT、設備、雇用"
              value={searchParams.keyword}
              onChange={handleParamChange} // HTML標準のonChange
              // onValueChange={(value: string) => setSearchParams(prev => ({...prev, keyword: value, page: 1}))} // HeroUIの場合
              className="lg:col-span-2"
            />
            <Select
              label="並び順"
              name="sort"
              value={searchParams.sort}
              onChange={handleParamChange} // HTML標準のonChange
              // onSelectionChange={(value: string) => setSearchParams(prev => ({...prev, sort: value, page: 1}))} // HeroUIの場合
            >
              <option value="created_date">新着順</option>
              <option value="acceptance_start_datetime">募集開始順</option>
              <option value="acceptance_end_datetime">締切順</option>
              {/* <option value="match_score">マッチ度順</option> */} {/* APIがサポートしていれば */}
            </Select>
            <Select
              label="昇順/降順"
              name="order"
              value={searchParams.order}
              onChange={handleParamChange}
              // onSelectionChange={(value: string) => setSearchParams(prev => ({...prev, order: value, page: 1}))}
            >
              <option value="DESC">降順</option>
              <option value="ASC">昇順</option>
            </Select>
            <Select
              label="受付状況"
              name="acceptance"
              value={searchParams.acceptance}
              onChange={handleParamChange}
              // onSelectionChange={(value: string) => setSearchParams(prev => ({...prev, acceptance: value, page: 1}))}
              className="md:col-start-1" // レイアウト調整
            >
              <option value="1">受付中のみ</option>
              <option value="0">全て表示</option>
            </Select>
             {/* 
            ここに他のフィルター（業種、地域、目的、最低補助金額）を追加する場合は、
            useStateで管理し、handleParamChangeや専用のハンドラで更新、
            searchParams に含めてAPIに渡します。
            例:
            <Select label="業種" name="industry" value={searchParams.industry} onChange={handleParamChange}>...</Select>
            */}
          </CardBody>
          <CardFooter className="flex justify-end">
            <Button
              color="primary"
              disabled={isLoading}
              isLoading={isLoading}
              type="submit"
              size="lg"
            >
              検索する
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 検索結果表示エリア */}
      <div>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-3">
            <Spinner size="lg" color="primary" />
            <p className="text-lg text-foreground-600">
              補助金を検索しています...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-danger-50 text-danger-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">エラー</h3>
            <p>{error}</p>
            <Button color="primary" variant="bordered" className="mt-4" onClick={() => performSearch(searchParams)}>
              再試行
            </Button>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <p className="text-sm text-foreground-600">
              {totalResults}件の補助金が見つかりました。(全{totalPages}ページ中 {searchParams.page}ページ目を表示)
            </p>
            {searchResults.map((subsidy) => (
              <Card
                key={subsidy.id}
                isPressable
                onPress={() => router.push(`/subsidies/${subsidy.id}`)}
              >
                <CardBody>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-grow">
                      <h2 className="text-xl font-semibold text-primary hover:underline">
                        <Link href={`/subsidies/${subsidy.id}`}>
                          {subsidy.name}
                        </Link>
                      </h2>
                      <p className="mt-1 text-xs text-foreground-500">
                        実施機関: {subsidy.organization}
                      </p>
                    </div>
                    <div className="flex flex-col items-end sm:items-start flex-shrink-0 gap-1 mt-2 sm:mt-0">
                      {subsidy.status && (
                        <Chip 
                          size="sm" 
                          color={subsidy.status.includes("受付中") || subsidy.status.includes("募集中") ? "success" : "default"}
                          variant="flat"
                        >
                          {subsidy.status}
                        </Chip>
                      )}
                      {subsidy.deadline && (
                        <p className="text-xs text-danger font-medium">
                          締切: {subsidy.deadline}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground-600 line-clamp-3">
                    {subsidy.summary}
                  </p>
                  {subsidy.categories && subsidy.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {subsidy.categories.map((cat) => (
                        <Chip key={cat} size="sm" variant="bordered">
                          {cat}
                        </Chip>
                      ))}
                    </div>
                  )}
                   {subsidy.matchScore && ( // マッチ度があれば表示
                      <div className="mt-3">
                        <Chip color="success" variant="shadow" size="sm">
                          企業とのマッチ度: {subsidy.matchScore}%
                        </Chip>
                      </div>
                    )}
                </CardBody>
                <CardFooter className="flex justify-end items-center">
                  <Link href={`/subsidies/${subsidy.id}`}>
                    <Button size="sm" variant="solid" color="primary">
                      詳細を見る →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            {totalPages > 1 && (
              <Pagination
                page={searchParams.page}
                total={totalPages}
                onChange={handlePageChange}
                className="mt-8"
                // initialPage={searchParams.page} // HeroUIのPaginationの props に合わせる
              />
            )}
            <div className="text-xs text-right text-foreground-400 mt-10">
              出典：Jグランツ (検索結果について)
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-default-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-foreground-300 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="text-xl text-foreground-500 mb-2">
              検索条件に一致する補助金は見つかりませんでした。
            </p>
            <p className="text-foreground-400">
              キーワードや検索条件を変更して再度お試しください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}