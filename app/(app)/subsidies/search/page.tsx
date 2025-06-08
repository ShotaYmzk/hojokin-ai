// File: /app/(app)/subsidies/search/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { searchSubsidies } from "@/lib/api"; 
import { components, paths } from "@/types/jgrants";

// --- 型定義 ---
type JGrantsApiListItem = components["schemas"]["subsidy-summary-item"];
type JGrantsListResponse = components["schemas"]["subsidy-summaries-response"];

interface SubsidyResult {
  id: string; name: string; summary: string; organization: string; categories: string[];
  targetRegions: string[]; targetIndustries: string[]; targetEmployeeSizes: string[];
  deadline?: string; status: string;
}
type SearchParams = paths["/subsidies"]["get"]["parameters"]["query"] & { page: number; limit: number; };


// --- UIコンポーネント (変更なしのため省略) ---
const Input: React.FC<any> = ({ label, name, value, onChange, type = "text", placeholder, className, startContent, isRequired }) => ( <div className={className}> {label && <label className="block text-sm font-medium text-foreground-700 mb-1" htmlFor={name}>{label} {isRequired && <span className="text-danger">*</span>}</label>} <div className="relative"> {startContent && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{startContent}</div>} <input type={type} name={name} id={name} value={value} onChange={onChange} placeholder={placeholder} required={isRequired} className={`w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 ${startContent ? "pl-10" : ""}`} /> </div> </div> );
const Button: React.FC<any> = ({ children, onClick, type = "button", color = "default", isLoading, disabled, fullWidth, className, variant, size }) => { const colorClasses = color === "primary" ? "bg-primary text-primary-foreground hover:bg-primary-focus" : variant === "bordered" ? "border border-default-300 text-foreground hover:bg-default-100" : "bg-default-200 text-default-800 hover:bg-default-300"; const sizeClasses = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"; return ( <button type={type} onClick={onClick} disabled={isLoading || disabled} className={`font-medium transition-colors rounded-md ${sizeClasses} ${colorClasses} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}> {isLoading && <Spinner className="mr-2" color="current" size="sm" />} {isLoading ? "処理中..." : children} </button> ); };
const Select: React.FC<any> = ({ label, name, value, onChange, children, className, isRequired }) => ( <div className={className}> {label && <label className="block text-sm font-medium text-foreground-700 mb-1" htmlFor={name}>{label} {isRequired && <span className="text-danger">*</span>}</label>} <select name={name} id={name} value={value} onChange={onChange} required={isRequired} className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"> {children} </select> </div> );
const Checkbox: React.FC<any> = ({ label, name, checked, onChange, value }) => ( <label className="flex items-center space-x-2 cursor-pointer"> <input type="checkbox" name={name} value={value} checked={checked} onChange={onChange} className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary" /> <span className="text-sm text-foreground-700">{label}</span> </label> );
const Card: React.FC<any> = ({ children, className, isPressable, onPress }) => ( isPressable ? ( <button type="button" onClick={onPress} onKeyDown={e => { if (isPressable && (e.key === 'Enter' || e.key === ' ')) onPress?.(e); }} className={`bg-background shadow-lg rounded-xl border border-divider text-left w-full ${isPressable ? 'cursor-pointer hover:shadow-primary-glow transition-shadow focus:outline-none focus:ring-2 focus:ring-primary' : ''} ${className}`} disabled={!isPressable}> {children} </button> ) : (<div className={`bg-background shadow-lg rounded-xl border border-divider ${className}`}>{children}</div>) );
const CardBody: React.FC<any> = ({ children, className }) => (<div className={`p-4 md:p-6 ${className}`}>{children}</div>);
const CardFooter: React.FC<any> = ({ children, className }) => (<div className={`p-4 md:p-6 border-t border-divider bg-content2 rounded-b-xl ${className}`}>{children}</div>);
const Pagination: React.FC<{ total: number; page: number; onChange: (page: number) => void; className?: string; }> = ({ total, page, onChange, className }) => { const pages = Array.from({ length: total }, (_, i) => i + 1); if (total <= 1) return null; return ( <nav aria-label="Pagination" className={`flex justify-center items-center space-x-2 ${className}`}> <Button size="sm" variant="bordered" disabled={page === 1} onClick={() => onChange(page - 1)}>◀<span className="sr-only">Previous</span></Button> {pages.map((p) => (<Button key={p} size="sm" variant={p === page ? "solid" : "bordered"} color={p === page ? "primary" : "default"} onClick={() => onChange(p)}>{p}</Button>))} <Button size="sm" variant="bordered" disabled={page === total} onClick={() => onChange(page + 1)}>▶<span className="sr-only">Next</span></Button> </nav> ); };
const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string; className?: string }> = ({ size = 'md', className }) => { const sizeClasses = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'; return (<div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClasses} ${className}`} />); };
const Chip: React.FC<{ children: React.ReactNode; color?: "primary" | "secondary" | "success" | "warning" | "danger" | "default" | "info"; size?: "sm" | "md" | "lg"; variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "dot"; className?: string; }> = ({ children, color = "default", variant = "solid", className }) => { const baseStyle = "px-2.5 py-0.5 text-xs rounded-full font-medium inline-flex items-center"; const colorStyles: Record<string, string> = { default: "bg-default-200 text-default-800", primary: "bg-primary text-primary-foreground", success: "bg-success text-success-foreground", info: "bg-sky-100 text-sky-700", warning: "bg-warning text-warning-foreground", danger: "bg-danger text-danger-foreground", secondary: "bg-secondary-100 text-secondary-800" }; let appliedStyle = ""; if (variant === 'bordered') { const borderColor = color === 'default' ? 'default-300' : `${color}-300`; const textColor = color === 'default' ? 'default-800' : `${color}-600 dark:text-${color}-400`; appliedStyle = `border border-${borderColor} text-${textColor} bg-transparent`; } else if (variant === 'flat') { const bgColor = color === 'default' ? 'default-100' : `${color}-100`; const textColor = color === 'default' ? 'default-800' : `${color}-700`; appliedStyle = `bg-${bgColor} text-${textColor}`; } else { appliedStyle = colorStyles[color] || colorStyles.default; } return (<span className={`${baseStyle} ${appliedStyle} ${className}`}>{children}</span>); };

// --- 選択肢データ (Jグランツのenum値をそのまま使用) ---
const industryOptions = [ { id: "農業，林業", name: "農業，林業" }, { id: "漁業", name: "漁業" }, { id: "建設業", name: "建設業" }, { id: "製造業", name: "製造業" }, { id: "情報通信業", name: "情報通信業" }, { id: "卸売業，小売業", name: "卸売業，小売業" }, { id: "宿泊業，飲食サービス業", name: "宿泊業，飲食サービス業" }, { id: "医療，福祉", name: "医療，福祉" }, { id: "サービス業（他に分類されないもの）", name: "サービス業（他に分類されないもの）" }, ];
const employeeSizeOptions = [ { id: "従業員の制約なし", name: "従業員の制約なし" }, { id: "5名以下", name: "5名以下" }, { id: "20名以下", name: "20名以下" }, { id: "50名以下", name: "50名以下" }, { id: "100名以下", name: "100名以下" }, { id: "300名以下", name: "300名以下" }, { id: "900名以下", name: "900名以下" }, { id: "901名以上", name: "901名以上" }, ];
const regionOptions = [ { id: "全国", name: "全国" }, { id: "北海道地方", name: "北海道地方" }, { id: "東北地方", name: "東北地方" }, { id: "関東・甲信越地方", name: "関東・甲信越地方" }, { id: "東海・北陸地方", name: "東海・北陸地方" }, { id: "近畿地方", name: "近畿地方" }, { id: "中国地方", name: "中国地方" }, { id: "四国地方", name: "四国地方" }, { id: "九州・沖縄地方", name: "九州・沖縄地方" }, ];
const purposeOptions = [ { id: "新たな事業を行いたい", name: "新たな事業を行いたい" }, { id: "販路拡大・海外展開をしたい", name: "販路拡大・海外展開をしたい" }, { id: "設備整備・IT導入したい", name: "設備整備・IT導入したい" }, { id: "研究開発・実証事業を行いたい", name: "研究開発・実証事業を行いたい" }, { id: "雇用・職場環境を改善したい", name: "雇用・職場環境を改善したい" }, ];


export default function SubsidySearchPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: "",
    sort: "created_date",
    order: "DESC",
    acceptance: "1",
    page: 1,
    limit: 10,
    industry: "",
    target_number_of_employees: "",
    target_area_search: "",
    use_purpose: "",
  });
  
  const [debouncedSearchParams] = useDebounce(searchParams, 500);

  const [searchResults, setSearchResults] = useState<SubsidyResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapJGrantsItemToSubsidyResult = (item: JGrantsApiListItem): SubsidyResult => {
    const subsidyName = item.title ?? item.name ?? "名称不明";
    // ★★★ 修正箇所 ★★★
    // 一覧APIにはsummaryやdetailがないため、titleを概要として使うか、固定文言を表示
    const summaryText = item.title ?? "概要情報がありません。詳細ページをご確認ください。";

    const parseSlashSeparatedString = (str: string | undefined | null): string[] => str ? str.split(" / ").map(s => s.trim()).filter(Boolean) : [];
    
    // ★★★ 修正箇所 ★★★
    // `acceptance_status` はAPIレスポンスにないので、日付から判断する
    let status = "不明";
    const now = new Date();
    const startDate = item.acceptance_start_datetime ? new Date(item.acceptance_start_datetime) : null;
    const endDate = item.acceptance_end_datetime ? new Date(item.acceptance_end_datetime) : null;
    if (startDate && endDate) {
      if (now >= startDate && now <= endDate) {
        status = "受付中";
      } else if (now < startDate) {
        status = "募集開始前";
      } else {
        status = "募集終了";
      }
    }

    return {
      id: String(item.id ?? Date.now() + Math.random()),
      name: subsidyName,
      summary: summaryText,
      organization: item.organizer ?? "N/A", // organizerも一覧にはない可能性が高い
      categories: parseSlashSeparatedString(item.use_purpose),
      targetIndustries: parseSlashSeparatedString(item.industry),
      targetRegions: parseSlashSeparatedString(item.target_area_search),
      targetEmployeeSizes: item.target_number_of_employees ? [item.target_number_of_employees] : [],
      deadline: item.acceptance_end_datetime ? String(item.acceptance_end_datetime).substring(0, 10) : undefined,
      status: status,
    };
  };

  const performSearch = useCallback(async (paramsToSearch: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      // ★★★ 修正箇所 ★★★
      // searchSubsidies に渡すパラメータの型を合わせる
      const apiParams: paths["/subsidies"]["get"]["parameters"]["query"] = {
          keyword: paramsToSearch.keyword,
          sort: paramsToSearch.sort,
          order: paramsToSearch.order,
          acceptance: paramsToSearch.acceptance,
          use_purpose: paramsToSearch.use_purpose,
          industry: paramsToSearch.industry,
          target_number_of_employees: paramsToSearch.target_number_of_employees,
          target_area_search: paramsToSearch.target_area_search,
          limit: paramsToSearch.limit,
          offset: (paramsToSearch.page - 1) * paramsToSearch.limit,
      };

      const data = await searchSubsidies(apiParams);
      
      if (!data || !Array.isArray(data.result)) {
        throw new Error((data as any)?.message || "検索結果の形式が正しくありません。");
      }

      const count = Number(data.metadata?.resultset?.count ?? data.result.length);
      const limit = Number(data.metadata?.resultset?.limit ?? paramsToSearch.limit);
      const offset = Number(data.metadata?.resultset?.offset ?? (paramsToSearch.page - 1) * paramsToSearch.limit);
      const page = data.result.length > 0 ? (Math.floor(offset / limit) + 1) : 1;
      const mappedResults: SubsidyResult[] = data.result.map(mapJGrantsItemToSubsidyResult);
      
      setSearchResults(mappedResults);
      setTotalResults(count);
      setSearchParams(prev => ({ ...prev, page, limit }));

    } catch (err: any) {
      console.error("Search failed:", err);
      setError(err.message || "検索中に不明なエラーが発生しました。");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchParams);
  }, [debouncedSearchParams, performSearch]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value, page: 1 }));
  };
  
  const handleMultiSelectChange = (name: keyof SearchParams, itemId: string) => {
    setSearchParams(prev => {
      const currentValues = prev[name] ? (prev[name] as string).split(" / ").filter(Boolean) : [];
      const newValues = currentValues.includes(itemId)
        ? currentValues.filter(id => id !== itemId)
        : [...currentValues, itemId];
      return { ...prev, [name]: newValues.join(" / "), page: 1 };
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setSearchParams({
      keyword: "", sort: "created_date", order: "DESC", acceptance: "1", page: 1, limit: 10,
      industry: "", target_number_of_employees: "", target_area_search: "", use_purpose: "",
    });
  };

  const totalPages = Math.ceil(totalResults / searchParams.limit);

  // ... (JSX部分は変更なしのため省略) ...
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground mb-2">補助金・助成金検索</h1>
        <p className="text-foreground-500">キーワードや詳細条件で、あなたのビジネスに最適な支援制度を見つけましょう。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
          <Card>
            <CardBody className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground-800">検索条件</h3>
              <Input label="キーワード" name="keyword" placeholder="制度名、目的など" value={searchParams.keyword} onChange={handleFilterChange} />
              <Select label="並び順" name="sort" value={searchParams.sort} onChange={handleFilterChange}>
                <option value="created_date">新着順</option>
                <option value="acceptance_start_datetime">募集開始順</option>
                <option value="acceptance_end_datetime">締切順</option>
              </Select>
              <Select label="受付状況" name="acceptance" value={searchParams.acceptance} onChange={handleFilterChange}>
                <option value="1">受付中のみ</option>
                <option value="0">全て表示</option>
              </Select>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-foreground-800 mb-3">詳細条件</h3>
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">業種 (複数可)</label>
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-default-200 rounded-md p-3 bg-content1 shadow-sm">
                      {industryOptions.map(opt => (
                        <Checkbox key={opt.id} label={opt.name} name="industry" value={opt.name}
                                  checked={searchParams.industry?.includes(opt.name)}
                                  onChange={() => handleMultiSelectChange("industry", opt.name)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">利用目的 (複数可)</label>
                    <div className="max-h-48 overflow-y-auto space-y-1 border border-default-200 rounded-md p-3 bg-content1 shadow-sm">
                      {purposeOptions.map(opt => (
                        <Checkbox key={opt.id} label={opt.name} name="use_purpose" value={opt.name}
                                  checked={searchParams.use_purpose?.includes(opt.name)}
                                  onChange={() => handleMultiSelectChange("use_purpose", opt.name)} />
                      ))}
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">従業員規模</label>
                    <Select name="target_number_of_employees" value={searchParams.target_number_of_employees} onChange={handleFilterChange}>
                      <option value="">指定なし</option>
                      {employeeSizeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1">対象地域</label>
                    <Select name="target_area_search" value={searchParams.target_area_search} onChange={handleFilterChange}>
                      <option value="">指定なし</option>
                      {regionOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                    </Select>
                  </div>
               </div>
            </CardBody>
            <CardFooter>
              <Button variant="bordered" onClick={resetFilters} fullWidth>条件をクリア</Button>
            </CardFooter>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <div className="space-y-6">
            <div className="flex justify-between items-center h-10">
              <div className="flex items-center text-foreground-500">
                {isLoading && <Spinner size="sm" className="mr-2" />}
                {error && <p className="text-sm text-danger">{error}</p>}
                {!isLoading && !error && (
                  <p className="text-sm text-foreground-600">
                    {totalResults}件の補助金が見つかりました。
                  </p>
                )}
              </div>
              {totalPages > 1 && <Pagination page={searchParams.page} total={totalPages} onChange={handlePageChange} />}
            </div>

            {!isLoading && searchResults.length > 0 ? (
              searchResults.map((subsidy) => (
                <Card key={subsidy.id} isPressable onPress={() => router.push(`/subsidies/${subsidy.id}`)}>
                  <CardBody>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-grow">
                        <h2 className="text-xl font-semibold text-primary hover:underline">
                          <Link href={`/subsidies/${subsidy.id}`}>{subsidy.name}</Link>
                        </h2>
                        <p className="mt-1 text-xs text-foreground-500">実施機関: {subsidy.organization}</p>
                      </div>
                      <div className="flex flex-col items-start sm:items-end flex-shrink-0 gap-1 mt-2 sm:mt-0">
                        {subsidy.status && <Chip size="sm" color={subsidy.status.includes("受付中") ? "success" : "default"} variant="flat">{subsidy.status}</Chip>}
                        {subsidy.deadline && <p className="text-xs text-danger font-medium">締切: {subsidy.deadline}</p>}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground-600 line-clamp-3">{subsidy.summary}</p>
                    <div className="mt-3 space-y-1.5">
                        {subsidy.categories.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-medium text-foreground-500 mr-1 self-start pt-0.5">目的:</span>{subsidy.categories.map((cat, idx) => <Chip key={`cat-${idx}`} size="sm" variant="bordered" color="secondary">{cat}</Chip>)}</div>}
                        {subsidy.targetIndustries.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-medium text-foreground-500 mr-1 self-start pt-0.5">対象業種:</span>{subsidy.targetIndustries.map((ind, idx) => <Chip key={`ind-${idx}`} size="sm" variant="bordered">{ind}</Chip>)}</div>}
                        {subsidy.targetRegions.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-medium text-foreground-500 mr-1 self-start pt-0.5">対象地域:</span>{subsidy.targetRegions.map((reg, idx) => <Chip key={`reg-${idx}`} size="sm" variant="bordered">{reg}</Chip>)}</div>}
                        {subsidy.targetEmployeeSizes.length > 0 && <div className="flex flex-wrap items-center gap-1.5"><span className="text-xs font-medium text-foreground-500 mr-1 self-start pt-0.5">対象従業員規模:</span>{subsidy.targetEmployeeSizes.map((size, idx) => <Chip key={`size-${idx}`} size="sm" variant="bordered">{size}</Chip>)}</div>}
                    </div>
                  </CardBody>
                  <CardFooter className="flex justify-end items-center">
                    <Link href={`/subsidies/${subsidy.id}`}><Button size="sm" variant="solid" color="primary">詳細を見る →</Button></Link>
                  </CardFooter>
                </Card>
              ))
            ) : !isLoading && !error && (
              <div className="text-center py-20 bg-default-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-foreground-300 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <p className="text-xl text-foreground-500 mb-2">検索条件に一致する補助金は見つかりませんでした。</p>
                <p className="text-foreground-400">条件を変更して再度お試しください。</p>
              </div>
            )}
            <div className="flex justify-between items-center mt-6">
              <div className="text-xs text-left text-foreground-400">出典：Jグランツ</div>
              {totalPages > 1 && <Pagination page={searchParams.page} total={totalPages} onChange={handlePageChange} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}