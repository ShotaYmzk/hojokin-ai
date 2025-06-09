// File: /app/(app)/subsidies/search/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";

import { searchSubsidies } from "@/lib/api";
import { components, paths } from "@/types/jgrants";

// --- アイコン (HeroIconsなどからインポート推奨) ---
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
      clipRule="evenodd"
    />
  </svg>
);
const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.033a.75.75 0 0 1-1.11.67L9.35 18.336a.75.75 0 0 1-.35-.67v-3.033a2.25 2.25 0 0 0-.659-1.59L3.659 8.22A2.25 2.25 0 0 1 3 6.629V2.34a.75.75 0 0 1 .628-.74Z" />
  </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
);
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

// --- 型定義 ---
type JGrantsApiListItem = components["schemas"]["subsidy-summary-item"];
type SearchParamsState = {
  keyword?: string;
  sort?: "created_date" | "acceptance_end_datetime" | "acceptance_start_datetime";
  order?: "ASC" | "DESC";
  acceptance?: "0" | "1";
  industry?: string;
  target_area_search?: string;
  use_purpose?: string;
};

interface SubsidyResult {
  id: string;
  name: string;
  summary: string;
  organization: string;
  categories: string[];
  targetRegions: string[];
  targetIndustries: string[];
  deadline?: string;
  status: string;
}

// --- 選択肢データ ---
const industryOptions = [
  { id: "農業，林業", name: "農業，林業" },
  { id: "漁業", name: "漁業" },
  { id: "建設業", name: "建設業" },
  { id: "製造業", name: "製造業" },
  { id: "情報通信業", name: "情報通信業" },
  { id: "卸売業，小売業", name: "卸売業，小売業" },
  { id: "宿泊業，飲食サービス業", name: "宿泊業，飲食サービス業" },
  { id: "医療，福祉", name: "医療，福祉" },
  {
    id: "サービス業（他に分類されないもの）",
    name: "サービス業（他に分類されないもの）",
  },
];
const regionOptions = [
  { id: "全国", name: "全国" },
  { id: "北海道地方", name: "北海道地方" },
  { id: "東北地方", name: "東北地方" },
  { id: "関東・甲信越地方", name: "関東・甲信越地方" },
  { id: "東海・北陸地方", name: "東海・北陸地方" },
  { id: "近畿地方", name: "近畿地方" },
  { id: "中国地方", name: "中国地方" },
  { id: "四国地方", name: "四国地方" },
  { id: "九州・沖縄地方", name: "九州・沖縄地方" },
];
const purposeOptions = [
  { id: "新たな事業を行いたい", name: "新たな事業を行いたい" },
  { id: "販路拡大・海外展開をしたい", name: "販路拡大・海外展開をしたい" },
  { id: "設備整備・IT導入したい", name: "設備整備・IT導入したい" },
  { id: "研究開発・実証事業を行いたい", name: "研究開発・実証事業を行いたい" },
  { id: "雇用・職場環境を改善したい", name: "雇用・職場環境を改善したい" },
];
const sortOptions = [
  { id: "created_date", name: "新着順" },
  { id: "acceptance_end_datetime", name: "締切が近い順" },
  { id: "acceptance_start_datetime", name: "募集開始順" },
];

// --- UIコンポーネント ---
const CardSkeleton = () => (
  <div className="bg-background shadow-lg rounded-xl border border-divider p-6 animate-pulse">
    <div className="flex justify-between items-start gap-4">
      <div className="w-3/4 space-y-3">
        <div className="h-6 bg-default-200 rounded w-full" />
        <div className="h-4 bg-default-200 rounded w-1/2" />
      </div>
      <div className="w-1/4 h-5 bg-default-200 rounded" />
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-default-200 rounded w-full" />
      <div className="h-4 bg-default-200 rounded w-5/6" />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <div className="h-5 w-20 bg-default-200 rounded-full" />
      <div className="h-5 w-24 bg-default-200 rounded-full" />
      <div className="h-5 w-16 bg-default-200 rounded-full" />
    </div>
  </div>
);

const Accordion: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-divider">
      <button
        className="w-full flex justify-between items-center py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-md font-semibold text-foreground-800">{title}</h3>
        <ChevronDownIcon
          className={`w-5 h-5 text-foreground-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="pb-4 animate-fadeIn">{children}</div>}
    </div>
  );
};

// --- データマッピング関数 ---
const mapJGrantsItemToSubsidyResult = (
  item: JGrantsApiListItem,
): SubsidyResult => {
  const parseSlashSeparatedString = (
    str: string | undefined | null,
  ): string[] =>
    str
      ? str
          .split(" / ")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  let status = "不明";
  const now = new Date();
  const startDate = item.acceptance_start_datetime
    ? new Date(item.acceptance_start_datetime)
    : null;
  const endDate = item.acceptance_end_datetime
    ? new Date(item.acceptance_end_datetime)
    : null;

  if (startDate && endDate) {
    if (now >= startDate && now <= endDate) status = "受付中";
    else if (now < startDate) status = "募集開始前";
    else status = "募集終了";
  }

  return {
    id: String(item.id ?? Date.now() + Math.random()),
    name: item.title ?? item.name ?? "名称不明",
    summary: item.title ?? "概要は詳細ページをご確認ください。",
    organization: item.organizer ?? "N/A",
    categories: parseSlashSeparatedString(item.use_purpose),
    targetIndustries: parseSlashSeparatedString(item.industry),
    targetRegions: parseSlashSeparatedString(item.target_area_search),
    deadline: item.acceptance_end_datetime
      ? String(item.acceptance_end_datetime).substring(0, 10)
      : undefined,
    status,
  };
};

// --- メインコンポーネント ---
export default function SubsidySearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SubsidyResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsState: SearchParamsState = useMemo(
    () => ({
      keyword: searchParams.get("keyword") || undefined,
      sort:
        (searchParams.get("sort") as SearchParamsState["sort"]) ||
        "created_date",
      order: searchParams.get("sort") === "acceptance_end_datetime" ? "ASC" : "DESC",
      acceptance:
        (searchParams.get("acceptance") as SearchParamsState["acceptance"]) || "1",
      industry: searchParams.get("industry") || undefined,
      target_area_search: searchParams.get("target_area_search") || undefined,
      use_purpose: searchParams.get("use_purpose") || undefined,
    }),
    [searchParams],
  );

  const [debouncedParams] = useDebounce(paramsState, 500);

  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;

  const updateQueryParams = useCallback(
    (newParams: Partial<SearchParamsState>, resetPage: boolean = true) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, value]) => {
        if (value) {
          current.set(key, String(value));
        } else {
          current.delete(key);
        }
      });

      if (resetPage) {
        current.delete("page");
      }

      const sort = current.get("sort");
      if (sort === "acceptance_end_datetime") {
        current.set("order", "ASC");
      } else {
        current.set("order", "DESC");
      }

      router.push(`${pathname}?${current.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const performSearch = useCallback(
    async (paramsToSearch: SearchParamsState) => {
      setIsLoading(true);
      setError(null);
      try {
        const apiParams: paths["/subsidies"]["get"]["parameters"]["query"] = {
          ...paramsToSearch,
          sort: paramsToSearch.sort ?? "created_date",
          order: paramsToSearch.order ?? "DESC",
          acceptance: paramsToSearch.acceptance ?? "1",
          target_area_search: toAllowedTargetArea(
            paramsToSearch.target_area_search,
          ),
          limit,
          offset: (page - 1) * limit,
        };
        const data = await searchSubsidies(apiParams);

        if (!data || !Array.isArray(data.result)) {
          throw new Error(
            data?.message || "検索結果の形式が正しくありません。",
          );
        }
        const count = Number(
          data.metadata?.resultset?.count ?? data.result.length,
        );
        const mappedResults: SubsidyResult[] = data.result.map(
          mapJGrantsItemToSubsidyResult,
        );

        setSearchResults(mappedResults);
        setTotalResults(count);
      } catch (err: any) {
        setError(err.message || "検索中に不明なエラーが発生しました。");
        setSearchResults([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    performSearch(debouncedParams);
  }, [debouncedParams, performSearch]);

  const handlePageChange = (newPage: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", String(newPage));
    router.push(`${pathname}?${current.toString()}`);
  };

  const handleMultiSelectChange = (
    name: keyof SearchParamsState,
    value: string,
  ) => {
    const currentValues = paramsState[name]?.split(" / ").filter(Boolean) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateQueryParams({ [name]: newValues.join(" / ") });
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  const totalPages = Math.ceil(totalResults / limit);
  const appliedFilters = useMemo(
    () =>
      Object.entries(paramsState).filter(
        ([key, value]) =>
          value && !["sort", "order", "acceptance", "keyword"].includes(key),
      ),
    [paramsState],
  );

  const renderFilters = (isMobile: boolean = false) => (
    <aside
      className={`${
        isMobile
          ? "p-4"
          : "lg:col-span-1 space-y-4 lg:sticky lg:top-24 self-start"
      }`}
    >
      {isMobile && <h2 className="text-xl font-bold mb-4">絞り込み</h2>}
      <Accordion title="利用目的" defaultOpen>
        <div className="space-y-2">
          {purposeOptions.map((opt) => (
            <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="use_purpose"
                value={opt.name}
                checked={paramsState.use_purpose?.includes(opt.name)}
                onChange={() => handleMultiSelectChange("use_purpose", opt.name)}
                className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary"
              />
              <span className="text-sm text-foreground-700">{opt.name}</span>
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title="業種">
        <div className="space-y-2">
          {industryOptions.map((opt) => (
            <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="industry"
                value={opt.name}
                checked={paramsState.industry?.includes(opt.name)}
                onChange={() => handleMultiSelectChange("industry", opt.name)}
                className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary"
              />
              <span className="text-sm text-foreground-700">{opt.name}</span>
            </label>
          ))}
        </div>
      </Accordion>
      <Accordion title="地域">
        <select
          name="target_area_search"
          value={paramsState.target_area_search}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            updateQueryParams({ target_area_search: e.target.value })
          }
          className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
        >
          <option value="">指定なし</option>
          {regionOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </Accordion>
      <button
        onClick={resetFilters}
        className="w-full mt-4 text-sm text-primary hover:underline"
      >
        すべての条件をクリア
      </button>
    </aside>
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">補助金・助成金検索</h1>
        <p className="text-foreground-500">
          キーワードや詳細条件で、あなたのビジネスに最適な支援制度を見つけましょう。
        </p>
        <div className="relative pt-2">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-400 pointer-events-none" />
          <input
            type="search"
            name="keyword"
            placeholder="制度名、目的、課題 (例: IT導入、販路拡大)"
            className="w-full border border-default-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-base bg-background"
            defaultValue={paramsState.keyword}
            onChange={(e) => updateQueryParams({ keyword: e.target.value })}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block">{renderFilters()}</div>

        <main className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-content1 rounded-lg border border-divider">
            <div className="flex items-center gap-2">
              <p className="text-sm text-foreground-600 whitespace-nowrap">
                {isLoading ? "検索中..." : `${totalResults}件の補助金`}
              </p>
              {appliedFilters.length > 0 && (
                <span className="text-sm text-foreground-400 hidden sm:inline">
                  |
                </span>
              )}
              <div className="flex-wrap gap-1 hidden sm:flex">
                {appliedFilters.map(([key, value]) =>
                  (value as string)
                    .split(" / ")
                    .map((val) => (
                      <span
                        key={val}
                        className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {val}
                        <button
                          onClick={() =>
                            handleMultiSelectChange(
                              key as keyof SearchParamsState,
                              val,
                            )
                          }
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    )),
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 w-full justify-center px-4 py-2 text-sm font-medium text-foreground bg-default-100 border border-default-300 rounded-md hover:bg-default-200"
              >
                <FilterIcon className="w-4 h-4" />
                絞り込み
              </button>
              <select
                name="sort"
                value={paramsState.sort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  updateQueryParams({
                    sort: e.target.value as SearchParamsState["sort"],
                  })
                }
                className="w-full sm:w-auto border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-danger-50 rounded-lg">
              <p className="text-xl text-danger-700 mb-2">
                エラーが発生しました
              </p>
              <p className="text-danger-600">{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((subsidy) => (
                <Link
                  key={subsidy.id}
                  href={`/subsidies/${subsidy.id}`}
                  className="block"
                >
                  <div className="bg-background shadow-lg rounded-xl border border-divider hover:border-primary hover:shadow-primary-glow transition-all duration-200 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-grow">
                        <h2 className="text-lg font-semibold text-primary">
                          {subsidy.name}
                        </h2>
                        <p className="mt-1 text-xs text-foreground-500">
                          実施機関: {subsidy.organization}
                        </p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end flex-shrink-0 gap-1 mt-2 sm:mt-0">
                        <span
                          className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                            subsidy.status === "受付中"
                              ? "bg-success text-success-foreground"
                              : "bg-default-200 text-default-800"
                          }`}
                        >
                          {subsidy.status}
                        </span>
                        {subsidy.deadline && (
                          <p className="text-xs text-danger font-medium">
                            締切: {subsidy.deadline}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground-600 line-clamp-2">
                      {subsidy.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {subsidy.categories.slice(0, 3).map((cat, idx) => (
                        <span
                          key={idx}
                          className="bg-secondary-100 text-secondary-800 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {cat}
                        </span>
                      ))}
                      {subsidy.targetRegions.slice(0, 1).map((reg, idx) => (
                        <span
                          key={idx}
                          className="bg-default-100 text-default-800 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-default-50 rounded-lg">
              <svg
                className="w-16 h-16 mx-auto text-foreground-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-xl text-foreground-600 mb-2">
                検索条件に一致する補助金は見つかりませんでした。
              </p>
              <p className="text-foreground-400">
                条件を変更するか、キーワードを調整してください。
              </p>
              <div className="mt-6">
                <Link
                  href="/subsidies/matching-chat"
                  className="bg-primary text-primary-foreground font-medium py-2 px-5 rounded-lg hover:bg-primary-focus transition-colors"
                >
                  AIチャットで探す
                </Link>
              </div>
            </div>
          )}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex justify-center items-center space-x-2 pt-4"
            >
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-3 py-1 text-sm rounded-md border border-default-300 bg-background hover:bg-default-100 disabled:opacity-50"
              >
                ◀
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  disabled={p === page}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    p === page
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-default-300 bg-background hover:bg-default-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-3 py-1 text-sm rounded-md border border-default-300 bg-background hover:bg-default-100 disabled:opacity-50"
              >
                ▶
              </button>
            </nav>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* ▼▼▼ 修正箇所: jsx-a11yエラーを修正 ▼▼▼ */}
          <button
            type="button"
            aria-label="フィルターを閉じる"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsFilterOpen(false)}
          />
          {/* ▲▲▲ 修正箇所 ▲▲▲ */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-background rounded-t-2xl shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-4 border-b border-divider flex justify-between items-center">
              <h2 className="text-lg font-bold">絞り込み</h2>
              <button onClick={() => setIsFilterOpen(false)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            {renderFilters(true)}
            <div className="p-4 sticky bottom-0 bg-background border-t border-divider">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg"
              >
                {totalResults}件の補助金を見る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Get the allowed values from the OpenAPI type
type TargetAreaSearch = NonNullable<
  paths["/subsidies"]["get"]["parameters"]["query"]["target_area_search"]
>;
const allowedTargetAreas: TargetAreaSearch[] = [
  "", "全国", "北海道地方", "東北地方", "関東・甲信越地方", "東海・北陸地方", "近畿地方", "中国地方", "四国地方", "九州・沖縄地方",
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

function toAllowedTargetArea(
  val: string | undefined,
): TargetAreaSearch | undefined {
  return allowedTargetAreas.includes(val as TargetAreaSearch)
    ? (val as TargetAreaSearch)
    : undefined;
}