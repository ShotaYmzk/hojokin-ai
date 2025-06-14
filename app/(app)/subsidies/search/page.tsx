// app/(app)/subsidies/search/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react";

interface SearchFilters {
  keyword: string;
  categories: string[];
  industries: string[];
  prefecture: string;
  employeeCountRange: string;
  capitalAmountRange: string;
  applicationDeadline: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface SubsidyResult {
  id: string;
  name: string;
  organization: string;
  summary: string;
  categories: string[];
  targetAudience: string;
  maxAmount: string;
  subsidyRate: string;
  deadline: string;
  score?: number;
}

const CATEGORIES = [
  "IT導入",
  "設備投資",
  "DX推進",
  "新事業開発",
  "販路拡大",
  "人材育成",
  "環境・省エネ",
  "研究開発",
  "創業支援",
  "その他",
];

const INDUSTRIES = [
  "製造業",
  "情報通信業",
  "建設業",
  "卸売業・小売業",
  "宿泊業・飲食サービス業",
  "運輸業・郵便業",
  "金融業・保険業",
  "不動産業",
  "専門・技術サービス業",
  "生活関連サービス業",
  "医療・福祉",
  "教育・学習支援業",
  "その他",
];

const PREFECTURES = [
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

export default function SubsidySearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    categories: [],
    industries: [],
    prefecture: "",
    employeeCountRange: "",
    capitalAmountRange: "",
    applicationDeadline: "",
    sortBy: "deadline",
    sortOrder: "asc",
  });

  const [results, setResults] = useState<SubsidyResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // JグランツAPIまたは内部APIを呼び出し
      const searchParams = new URLSearchParams();

      if (filters.keyword) searchParams.append("keyword", filters.keyword);
      if (filters.categories.length > 0)
        searchParams.append("categories", filters.categories.join(","));
      if (filters.industries.length > 0)
        searchParams.append("industries", filters.industries.join(","));
      if (filters.prefecture)
        searchParams.append("prefecture", filters.prefecture);
      if (filters.employeeCountRange)
        searchParams.append("employeeRange", filters.employeeCountRange);
      if (filters.capitalAmountRange)
        searchParams.append("capitalRange", filters.capitalAmountRange);
      if (filters.applicationDeadline)
        searchParams.append("deadline", filters.applicationDeadline);
      searchParams.append("sort", filters.sortBy);
      searchParams.append("order", filters.sortOrder);

      const response = await fetch(
        `/api/subsidies/search?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();

        setResults(data.subsidies || []);
        setTotalCount(data.total || 0);
      } else {
        console.error("検索エラー:", response.statusText);
        // ダミーデータを表示（開発中）
        setResults(getDummyResults());
        setTotalCount(5);
      }
    } catch (error) {
      console.error("検索中にエラーが発生しました:", error);
      // ダミーデータを表示（開発中）
      setResults(getDummyResults());
      setTotalCount(5);
    } finally {
      setIsLoading(false);
    }
  };

  // 開発用ダミーデータ
  const getDummyResults = (): SubsidyResult[] => [
    {
      id: "1",
      name: "IT導入補助金2025",
      organization: "経済産業省",
      summary:
        "ITツール導入による中小企業・小規模事業者の生産性向上を支援する補助金制度です。",
      categories: ["IT導入", "DX推進"],
      targetAudience: "中小企業・小規模事業者",
      maxAmount: "450万円",
      subsidyRate: "1/2〜2/3",
      deadline: "2025-06-30",
      score: 0.85,
    },
    {
      id: "2",
      name: "ものづくり補助金",
      organization: "全国中小企業団体中央会",
      summary:
        "革新的な製品・サービス開発や生産プロセス改善に必要な設備投資等を支援します。",
      categories: ["設備投資", "新事業開発"],
      targetAudience: "中小企業・小規模事業者",
      maxAmount: "1,250万円",
      subsidyRate: "1/2",
      deadline: "2025-05-20",
      score: 0.72,
    },
    {
      id: "3",
      name: "小規模事業者持続化補助金",
      organization: "日本商工会議所",
      summary: "小規模事業者の販路開拓等の取り組みを支援する補助金制度です。",
      categories: ["販路拡大"],
      targetAudience: "小規模事業者",
      maxAmount: "200万円",
      subsidyRate: "2/3",
      deadline: "2025-08-10",
      score: 0.68,
    },
  ];

  useEffect(() => {
    // 初期検索実行
    handleSearch();
  }, []);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleIndustry = (industry: string) => {
    setFilters((prev) => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter((i) => i !== industry)
        : [...prev.industries, industry],
    }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      categories: [],
      industries: [],
      prefecture: "",
      employeeCountRange: "",
      capitalAmountRange: "",
      applicationDeadline: "",
      sortBy: "deadline",
      sortOrder: "asc",
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ページタイトル */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">補助金検索</h1>
        <p className="text-gray-600">
          条件を指定して最適な補助金制度を見つけましょう
        </p>
      </div>

      {/* 検索ヘッダー */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="補助金・助成金を検索..."
                type="text"
                value={filters.keyword}
                onChange={(e) => updateFilter("keyword", e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              詳細フィルター
            </button>

            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
              onClick={handleSearch}
            >
              {isLoading ? "検索中..." : "検索"}
            </button>
          </div>
        </div>

        {/* 詳細フィルター */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.categories.includes(category)
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 業種フィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対象業種
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.industries.includes(industry)
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}
                    onClick={() => toggleIndustry(industry)}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* その他のフィルター */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  都道府県
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={filters.prefecture}
                  onChange={(e) => updateFilter("prefecture", e.target.value)}
                >
                  <option value="">全国</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline w-4 h-4 mr-1" />
                  従業員数
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={filters.employeeCountRange}
                  onChange={(e) =>
                    updateFilter("employeeCountRange", e.target.value)
                  }
                >
                  <option value="">指定なし</option>
                  <option value="1-5">1-5名</option>
                  <option value="6-20">6-20名</option>
                  <option value="21-50">21-50名</option>
                  <option value="51-100">51-100名</option>
                  <option value="101-300">101-300名</option>
                  <option value="300+">300名以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  資本金
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={filters.capitalAmountRange}
                  onChange={(e) =>
                    updateFilter("capitalAmountRange", e.target.value)
                  }
                >
                  <option value="">指定なし</option>
                  <option value="0-1000">1千万円以下</option>
                  <option value="1000-5000">1千万円-5千万円</option>
                  <option value="5000-10000">5千万円-1億円</option>
                  <option value="10000+">1億円以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  申請期限
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={filters.applicationDeadline}
                  onChange={(e) =>
                    updateFilter("applicationDeadline", e.target.value)
                  }
                >
                  <option value="">指定なし</option>
                  <option value="30days">30日以内</option>
                  <option value="60days">60日以内</option>
                  <option value="90days">90日以内</option>
                  <option value="ongoing">通年募集</option>
                </select>
              </div>
            </div>

            {/* ソート設定とクリアボタン */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    並び順:
                  </label>
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    value={filters.sortBy}
                    onChange={(e) => updateFilter("sortBy", e.target.value)}
                  >
                    <option value="deadline">申請期限</option>
                    <option value="maxAmount">補助上限額</option>
                    <option value="score">マッチング度</option>
                    <option value="created">登録日</option>
                  </select>

                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    value={filters.sortOrder}
                    onChange={(e) =>
                      updateFilter(
                        "sortOrder",
                        e.target.value as "asc" | "desc",
                      )
                    }
                  >
                    <option value="asc">昇順</option>
                    <option value="desc">降順</option>
                  </select>
                </div>
              </div>

              <button
                className="text-sm text-gray-600 hover:text-gray-800 underline"
                onClick={clearFilters}
              >
                フィルターをクリア
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            検索結果 ({totalCount}件)
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">検索中...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">
              条件に合う補助金が見つかりませんでした。
            </p>
            <p className="text-sm text-gray-500 mt-1">
              検索条件を変更してお試しください。
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {result.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {result.organization}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  {result.score && (
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-500">マッチング度</div>
                      <div
                        className={`text-lg font-bold ${
                          result.score >= 0.8
                            ? "text-green-600"
                            : result.score >= 0.6
                              ? "text-blue-600"
                              : "text-orange-600"
                        }`}
                      >
                        {Math.round(result.score * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {result.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="space-x-4">
                    <span>上限額: {result.maxAmount}</span>
                    <span>補助率: {result.subsidyRate}</span>
                    <span>期限: {result.deadline}</span>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      詳細を見る
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      申請開始
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
