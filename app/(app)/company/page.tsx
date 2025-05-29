// File: /app/(app)/company/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
// HeroUIコンポーネントのインポート (適宜実際のパスに修正)
// import { Input } from "@heroui/input";
// import { Textarea } from "@heroui/input"; // Textareaが別の場合
// import { Select, SelectItem } from "@heroui/react"; // Selectコンポーネント
// import { Button } from "@heroui/button";
// import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
// import { Switch } from "@heroui/switch";

// 仮の型定義 (より詳細な型は /types/domain.ts などで定義)
interface CompanyProfile {
  companyName: string;
  industry: string; // 業種（大分類）
  subIndustry?: string; // 業種（小分類）
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string; // 市区町村以降の住所
  addressLine2?: string; // 建物名など
  representativeName: string; // 代表者名
  phoneNumber: string;
  email: string; // 担当者メールアドレス
  website?: string;
  establishmentYear: string; // 設立年
  employeeCountCategory: string; // 従業員数カテゴリ (例: "1-5人", "6-20人")
  capitalAmount: string; // 資本金 (万円)
  annualSales?: string; // 直近売上高 (万円)
  businessDescription: string; // 事業内容
  isSmallBusiness: boolean; // 中小企業基本法上の定義に該当するか
}

// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
const Input: React.FC<any> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  className,
}) => (
  <div className={className}>
    <label
      className="block text-sm font-medium text-foreground-700 mb-1"
      htmlFor={name}
    >
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 disabled:bg-default-100"
      disabled={disabled}
      id={name}
      name={name}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
      onChange={onChange}
    />
  </div>
);
const Textarea: React.FC<any> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  disabled,
  className,
}) => (
  <div className={className}>
    <label
      className="block text-sm font-medium text-foreground-700 mb-1"
      htmlFor={name}
    >
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <textarea
      className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 disabled:bg-default-100"
      disabled={disabled}
      id={name}
      name={name}
      placeholder={placeholder}
      required={required}
      rows={rows}
      value={value}
      onChange={onChange}
    />
  </div>
);
const Select: React.FC<any> = ({
  label,
  name,
  value,
  onChange,
  children,
  required,
  disabled,
  className,
}) => (
  <div className={className}>
    <label
      className="block text-sm font-medium text-foreground-700 mb-1"
      htmlFor={name}
    >
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <select
      className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 disabled:bg-default-100"
      disabled={disabled}
      id={name}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
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
}) => {
  const colorClasses =
    color === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary-focus"
      : "bg-default-200 text-default-800 hover:bg-default-300";

  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors ${colorClasses} ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={isLoading || disabled}
      type={type}
      onClick={onClick}
    >
      {isLoading ? "処理中..." : children}
    </button>
  );
};
const Card: React.FC<any> = ({ children, className }) => (
  <div
    className={`bg-background shadow-lg rounded-xl border border-divider ${className}`}
  >
    {children}
  </div>
);
const CardHeader: React.FC<any> = ({ children, className }) => (
  <div className={`p-6 border-b border-divider ${className}`}>{children}</div>
);
const CardBody: React.FC<any> = ({ children, className }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const CardFooter: React.FC<any> = ({ children, className }) => (
  <div
    className={`p-6 border-t border-divider bg-content2 rounded-b-xl ${className}`}
  >
    {children}
  </div>
);
const Switch: React.FC<any> = ({
  label,
  checked,
  onChange,
  name,
  disabled,
}) => (
  <label className="flex items-center cursor-pointer" htmlFor={name}>
    <div className="relative">
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        id={name}
        name={name}
        type="checkbox"
        onChange={onChange}
      />
      <div
        className={`block w-10 h-6 rounded-full transition ${checked ? "bg-primary" : "bg-default-300"}`}
      />
      <div
        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${checked ? "translate-x-full" : ""}`}
      />
    </div>
    <div className="ml-3 text-sm text-foreground-700">{label}</div>
  </label>
);

// 業種や都道府県などの選択肢 (実際にはAPIから取得するか、定数ファイルで管理)
const industries = [
  "卸売業、小売業",
  "製造業",
  "建設業",
  "運輸業、郵便業",
  "宿泊業、飲食サービス業",
  "情報通信業",
  "医療、福祉",
  "学術研究、専門・技術サービス業",
  "生活関連サービス業、娯楽業",
  "不動産業、物品賃貸業",
  "金融業、保険業",
  "教育、学習支援業",
  "複合サービス事業",
  "サービス業（他に分類されないもの）",
  "農業、林業",
  "漁業",
  "鉱業、採石業、砂利採取業",
  "電気・ガス・熱供給・水道業",
  "公務（他に分類されるものを除く）",
  "分類不能の産業",
];
const prefectures = [
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
]; // 全て列挙
const employeeCategories = [
  "1～5人",
  "6～20人",
  "21～50人",
  "51～100人",
  "101～300人",
  "301人以上",
];

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: "",
    industry: "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    representativeName: "",
    phoneNumber: "",
    email: "",
    establishmentYear: "",
    employeeCountCategory: "",
    capitalAmount: "",
    businessDescription: "",
    isSmallBusiness: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 編集モードの切り替え
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  useEffect(() => {
    // APIから企業情報を取得する処理
    const fetchProfile = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        // const response = await fetch('/api/company/profile'); // 仮のAPIエンドポイント
        // if (!response.ok) throw new Error('企業情報の取得に失敗しました。');
        // const data = await response.json();
        // setProfile(data);
        // ダミーデータで初期化 (実際にはAPIレスポンス)
        const dummyProfile: CompanyProfile = {
          companyName: "株式会社サンプル商事",
          industry: "卸売業、小売業",
          postalCode: "100-0001",
          prefecture: "東京都",
          city: "千代田区",
          addressLine1: "丸の内1-1-1",
          representativeName: "山田 太郎",
          phoneNumber: "03-1234-5678",
          email: "info@sample-shoji.co.jp",
          website: "https://sample-shoji.co.jp",
          establishmentYear: "2010",
          employeeCountCategory: "21～50人",
          capitalAmount: "1000",
          annualSales: "50000",
          businessDescription:
            "各種商品の卸売および小売業。特に地域産品の販路拡大に注力。",
          isSmallBusiness: true,
        };

        setProfile(dummyProfile);
        setIsEditing(false); // 初期状態は表示モード
      } catch (error: any) {
        setApiError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;

      setProfile((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      // const response = await fetch('/api/company/profile', { // 仮のAPIエンドポイント
      //   method: 'PUT', // または POST
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || '企業情報の保存に失敗しました。');
      // }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // APIコールをシミュレート
      setApiSuccess("企業情報を保存しました。");
      setIsEditing(false); // 保存後は表示モードに戻る
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isEditing) {
    // 初回ロード時
    return <div className="text-center py-10">企業情報を読み込み中...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">企業情報</h1>
        {!isEditing && (
          <Button
            color="primary"
            disabled={isLoading}
            onClick={() => {
              setIsEditing(true);
              setApiSuccess(null);
              setApiError(null);
            }}
          >
            編集する
          </Button>
        )}
      </div>

      {apiError && (
        <div className="p-3 bg-danger-50 text-danger-700 rounded-md text-sm">
          {apiError}
        </div>
      )}
      {apiSuccess && (
        <div className="p-3 bg-success-50 text-success-700 rounded-md text-sm">
          {apiSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground-800">
              会社基本情報
            </h2>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Input
              required
              disabled={!isEditing}
              label="会社名"
              name="companyName"
              value={profile.companyName}
              onChange={handleChange}
            />
            <Input
              required
              disabled={!isEditing}
              label="代表者名"
              name="representativeName"
              value={profile.representativeName}
              onChange={handleChange}
            />
            <Select
              required
              disabled={!isEditing}
              label="業種"
              name="industry"
              value={profile.industry}
              onChange={handleChange}
            >
              <option value="">選択してください</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </Select>
            <Input
              required
              disabled={!isEditing}
              label="設立年"
              name="establishmentYear"
              placeholder="例: 2010"
              type="number"
              value={profile.establishmentYear}
              onChange={handleChange}
            />
            <Input
              required
              disabled={!isEditing}
              label="郵便番号"
              name="postalCode"
              placeholder="例: 100-0001"
              value={profile.postalCode}
              onChange={handleChange}
            />
            <Select
              required
              disabled={!isEditing}
              label="都道府県"
              name="prefecture"
              value={profile.prefecture}
              onChange={handleChange}
            >
              <option value="">選択してください</option>
              {prefectures.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </Select>
            <Input
              required
              className="md:col-span-2"
              disabled={!isEditing}
              label="市区町村"
              name="city"
              value={profile.city}
              onChange={handleChange}
            />
            <Input
              required
              className="md:col-span-2"
              disabled={!isEditing}
              label="番地以降の住所"
              name="addressLine1"
              value={profile.addressLine1}
              onChange={handleChange}
            />
            <Input
              className="md:col-span-2"
              disabled={!isEditing}
              label="建物名など (任意)"
              name="addressLine2"
              value={profile.addressLine2 || ""}
              onChange={handleChange}
            />
            <Input
              required
              disabled={!isEditing}
              label="電話番号"
              name="phoneNumber"
              placeholder="例: 03-1234-5678"
              type="tel"
              value={profile.phoneNumber}
              onChange={handleChange}
            />
            <Input
              required
              disabled={!isEditing}
              label="メールアドレス"
              name="email"
              placeholder="担当者のメールアドレス"
              type="email"
              value={profile.email}
              onChange={handleChange}
            />
            <Input
              className="md:col-span-2"
              disabled={!isEditing}
              label="会社ウェブサイト (任意)"
              name="website"
              placeholder="https://example.com"
              type="url"
              value={profile.website || ""}
              onChange={handleChange}
            />
          </CardBody>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground-800">
              会社規模・事業内容
            </h2>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <Select
              required
              disabled={!isEditing}
              label="従業員数"
              name="employeeCountCategory"
              value={profile.employeeCountCategory}
              onChange={handleChange}
            >
              <option value="">選択してください</option>
              {employeeCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            <Input
              required
              disabled={!isEditing}
              label="資本金 (万円)"
              name="capitalAmount"
              placeholder="例: 1000"
              type="number"
              value={profile.capitalAmount}
              onChange={handleChange}
            />
            <Input
              disabled={!isEditing}
              label="直近売上高 (万円・任意)"
              name="annualSales"
              placeholder="例: 50000"
              type="number"
              value={profile.annualSales || ""}
              onChange={handleChange}
            />
            <div className="md:col-span-2 mt-2">
              <Switch
                checked={profile.isSmallBusiness}
                disabled={!isEditing}
                label="中小企業基本法上の「中小企業者」に該当しますか？"
                name="isSmallBusiness"
                onChange={handleChange}
              />
              <p className="text-xs text-foreground-500 mt-1">
                補助金・助成金の多くは中小企業を対象としています。ご自身の企業が該当するかご確認ください。
              </p>
            </div>
            <Textarea
              required
              className="md:col-span-2"
              disabled={!isEditing}
              label="事業内容"
              name="businessDescription"
              placeholder="主な事業内容、強み、特徴などを具体的に記述してください。"
              rows={5}
              value={profile.businessDescription}
              onChange={handleChange}
            />
          </CardBody>
          {isEditing && (
            <CardFooter className="flex justify-end gap-3">
              <Button
                disabled={isLoading}
                onClick={() => {
                  setIsEditing(false); /* TODO: 変更をリセットする処理 */
                }}
              >
                キャンセル
              </Button>
              <Button color="primary" isLoading={isLoading} type="submit">
                保存する
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </div>
  );
}
