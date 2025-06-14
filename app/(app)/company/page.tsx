"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectItem, 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Switch,
  Divider
} from "@heroui/react";

// 型定義
interface CompanyProfile {
  companyName: string;
  industry: string;
  postalCode: string;
  prefecture: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  website?: string;
  establishmentYear: string;
  employeeCountCategory: string;
  capitalAmount: string;
  annualSales?: string;
  businessDescription: string;
  isSmallBusiness: boolean;
}

// アラートコンポーネント
const Alert: React.FC<{
  color: "danger" | "success" | "warning" | "primary";
  children: React.ReactNode;
  className?: string;
}> = ({ color, children, className }) => {
  const baseClasses = "p-4 rounded-md text-sm";
  const colorClasses = {
    danger: "bg-danger-50 text-danger-700 border border-danger-200",
    success: "bg-success-50 text-success-700 border border-success-200",
    warning: "bg-warning-50 text-warning-700 border border-warning-200",
    primary: "bg-primary-50 text-primary-700 border border-primary-200",
  };

  return (
    <div className={`${baseClasses} ${colorClasses[color]} ${className}`}>
      {children}
    </div>
  );
};

// 業種の選択肢
const industries = [
  "製造業",
  "建設業", 
  "卸売業・小売業",
  "運輸業・郵便業",
  "宿泊業・飲食サービス業",
  "情報通信業",
  "金融業・保険業",
  "不動産業・物品賃貸業",
  "学術研究・専門・技術サービス業",
  "サービス業（他に分類されないもの）",
  "農業・林業・漁業",
  "鉱業・採石業・砂利採取業",
  "電気・ガス・熱供給・水道業",
  "医療・福祉",
  "教育・学習支援業",
  "複合サービス事業",
  "その他"
];

// 都道府県の選択肢
const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

// 従業員数カテゴリー
const employeeCategories = [
  "1-5人",
  "6-20人", 
  "21-50人",
  "51-100人",
  "101-300人",
  "301-500人",
  "501-1000人",
  "1001人以上"
];

// 資本金カテゴリー
const capitalCategories = [
  "100万円未満",
  "100万円-500万円",
  "500万円-1000万円",
  "1000万円-3000万円",
  "3000万円-5000万円",
  "5000万円-1億円",
  "1億円-10億円",
  "10億円以上"
];

export default function CompanyPage() {
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: "",
    industry: "",
    postalCode: "",
    prefecture: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    representativeName: "",
    phoneNumber: "",
    email: "",
    website: "",
    establishmentYear: "",
    employeeCountCategory: "",
    capitalAmount: "",
    annualSales: "",
    businessDescription: "",
    isSmallBusiness: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  // 初期データの読み込み
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/company/profile', {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // 認証エラーの場合はログインページにリダイレクト
            window.location.href = '/login';
            return;
          }
          throw new Error('企業情報の取得に失敗しました');
        }

        const data = await response.json();
        setProfile(data);
        
        // 企業情報が空の場合は編集モードで開始
        if (!data.companyName) {
          setIsEditing(true);
        }
      } catch (error: any) {
        console.error('Profile fetch error:', error);
        setMessage({type: "error", text: error.message || '企業情報の取得に失敗しました'});
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (name: string, value: string | boolean) => {
    // 郵便番号の場合は自動フォーマット
    if (name === 'postalCode' && typeof value === 'string') {
      // 数字のみを抽出
      const numbers = value.replace(/\D/g, '');
      // 7桁まで制限
      const limitedNumbers = numbers.slice(0, 7);
      // 3桁-4桁の形式でフォーマット
      const formatted = limitedNumbers.length > 3 
        ? `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
        : limitedNumbers;
      
      setProfile((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 郵便番号から住所を検索する関数
  const searchAddressByPostalCode = async (postalCode: string) => {
    // 郵便番号の形式チェック（7桁の数字、ハイフンは除去）
    const cleanPostalCode = postalCode.replace(/-/g, '');
    if (!/^\d{7}$/.test(cleanPostalCode)) {
      return;
    }

    setIsAddressLoading(true);
    try {
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanPostalCode}`);
      const data = await response.json();

      if (data.status === 200 && data.results && data.results.length > 0) {
        const result = data.results[0];
        
        // 住所情報を自動入力（既存の値がある場合は確認）
        const hasExistingAddress = profile.prefecture || profile.city || profile.addressLine1;
        const shouldUpdate = !hasExistingAddress || 
          confirm(`住所を自動入力しますか？\n\n検索結果：\n${result.address1} ${result.address2} ${result.address3 || ''}\n\n※既存の住所情報が上書きされます。`);
        
        if (shouldUpdate) {
          setProfile((prev) => ({
            ...prev,
            prefecture: result.address1, // 都道府県
            city: result.address2,       // 市区町村
            addressLine1: result.address3 || '', // 町域
          }));
          
          setMessage({
            type: "success", 
            text: `住所を自動入力しました：${result.address1} ${result.address2} ${result.address3 || ''}`
          });
          
          // 成功メッセージを3秒後に消す
          setTimeout(() => {
            setMessage(null);
          }, 4000);
        }
      } else {
        setMessage({
          type: "error", 
          text: "該当する住所が見つかりませんでした。郵便番号をご確認ください。"
        });
        setTimeout(() => {
          setMessage(null);
        }, 4000);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setMessage({
        type: "error", 
        text: "住所の検索中にエラーが発生しました。しばらく時間をおいて再度お試しください。"
      });
      setTimeout(() => {
        setMessage(null);
      }, 4000);
    } finally {
      setIsAddressLoading(false);
    }
  };

  // 郵便番号入力のdebounce処理
  useEffect(() => {
    if (!isEditing || !profile.postalCode) return;

    // 完全な郵便番号（7桁）が入力された場合のみ検索
    const cleanPostalCode = profile.postalCode.replace(/-/g, '');
    if (cleanPostalCode.length !== 7) return;

    const timer = setTimeout(() => {
      searchAddressByPostalCode(profile.postalCode);
    }, 800); // 800ms後に検索実行（ユーザーの入力が完了してから）

    return () => clearTimeout(timer);
  }, [profile.postalCode, isEditing]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || '企業情報の保存に失敗しました');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage({type: "success", text: "企業情報を保存しました"});
    } catch (error: any) {
      console.error('Save error:', error);
      setMessage({type: "error", text: error.message || '企業情報の保存に失敗しました'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(null);
    // 編集をキャンセルした場合、データを再取得
    window.location.reload();
  };

  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">企業情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">企業情報</h1>
        {!isEditing && (
          <Button
            color="primary"
            onPress={() => setIsEditing(true)}
          >
            編集する
          </Button>
        )}
      </div>

      {message && (
        <Alert color={message.type === "success" ? "success" : "danger"} className="mb-6">
          {message.text}
        </Alert>
      )}

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h2 className="text-xl font-semibold">
              {isEditing ? "企業情報を編集" : "企業情報"}
            </h2>
          </CardHeader>

          <CardBody className="space-y-6">
            {/* 基本情報セクション */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="会社名"
                name="companyName"
                value={profile.companyName}
                onValueChange={(value) => handleChange("companyName", value)}
                isRequired
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
              />
              
              <Select
                label="業種"
                name="industry"
                selectedKeys={profile.industry ? [profile.industry] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  handleChange("industry", selectedKey || "");
                }}
                isRequired
                isDisabled={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
              >
                {industries.map((industry) => (
                  <SelectItem key={industry} textValue={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* 住所情報セクション */}
            <div>
              <h3 className="text-lg font-medium mb-4">所在地</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Input
                    label="郵便番号"
                    name="postalCode"
                    value={profile.postalCode}
                    onValueChange={(value) => handleChange("postalCode", value)}
                    placeholder="123-4567"
                    isReadOnly={!isEditing}
                    variant={isEditing ? "bordered" : "flat"}
                    description={isEditing ? "7桁入力で住所を自動検索" : ""}
                    endContent={
                      isAddressLoading && isEditing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : null
                    }
                  />
                  {isEditing && (
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="mt-2"
                      onPress={() => searchAddressByPostalCode(profile.postalCode)}
                      isLoading={isAddressLoading}
                      isDisabled={!profile.postalCode || profile.postalCode.replace(/-/g, '').length !== 7}
                    >
                      住所検索
                    </Button>
                  )}
                </div>
                
                <Select
                  label="都道府県"
                  name="prefecture"
                  selectedKeys={profile.prefecture ? [profile.prefecture] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleChange("prefecture", selectedKey || "");
                  }}
                  isDisabled={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  description={isEditing ? "郵便番号から自動入力されます" : ""}
                >
                  {prefectures.map((prefecture) => (
                    <SelectItem key={prefecture} textValue={prefecture}>
                      {prefecture}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  label="市区町村"
                  name="city"
                  value={profile.city}
                  onValueChange={(value) => handleChange("city", value)}
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  description={isEditing ? "郵便番号から自動入力されます" : ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  label="住所1"
                  name="addressLine1"
                  value={profile.addressLine1}
                  onValueChange={(value) => handleChange("addressLine1", value)}
                  placeholder="番地・建物名"
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                  description={isEditing ? "町域は郵便番号から自動入力されます" : ""}
                />
                
                <Input
                  label="住所2（任意）"
                  name="addressLine2"
                  value={profile.addressLine2 || ""}
                  onValueChange={(value) => handleChange("addressLine2", value)}
                  placeholder="部屋番号など"
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
            </div>

            <Divider />

            {/* 連絡先情報セクション */}
            <div>
              <h3 className="text-lg font-medium mb-4">連絡先情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="代表者名"
                  name="representativeName"
                  value={profile.representativeName}
                  onValueChange={(value) => handleChange("representativeName", value)}
                  isRequired
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                
                <Input
                  label="電話番号"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onValueChange={(value) => handleChange("phoneNumber", value)}
                  placeholder="03-1234-5678"
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                
                <Input
                  label="メールアドレス"
                  name="email"
                  type="email"
                  value={profile.email}
                  onValueChange={(value) => handleChange("email", value)}
                  isRequired
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                
                <Input
                  label="ウェブサイト（任意）"
                  name="website"
                  value={profile.website || ""}
                  onValueChange={(value) => handleChange("website", value)}
                  placeholder="https://example.com"
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
            </div>

            <Divider />

            {/* 企業規模情報セクション */}
            <div>
              <h3 className="text-lg font-medium mb-4">企業規模</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="設立年"
                  name="establishmentYear"
                  value={profile.establishmentYear}
                  onValueChange={(value) => handleChange("establishmentYear", value)}
                  placeholder="2020"
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
                
                <Select
                  label="従業員数"
                  name="employeeCountCategory"
                  selectedKeys={profile.employeeCountCategory ? [profile.employeeCountCategory] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleChange("employeeCountCategory", selectedKey || "");
                  }}
                  isDisabled={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                >
                  {employeeCategories.map((category) => (
                    <SelectItem key={category} textValue={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
                
                <Select
                  label="資本金"
                  name="capitalAmount"
                  selectedKeys={profile.capitalAmount ? [profile.capitalAmount] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    handleChange("capitalAmount", selectedKey || "");
                  }}
                  isDisabled={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                >
                  {capitalCategories.map((category) => (
                    <SelectItem key={category} textValue={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
                
                <Input
                  label="年間売上（任意）"
                  name="annualSales"
                  value={profile.annualSales || ""}
                  onValueChange={(value) => handleChange("annualSales", value)}
                  placeholder="1億円"
                  isReadOnly={!isEditing}
                  variant={isEditing ? "bordered" : "flat"}
                />
              </div>
            </div>

            <div>
              <Textarea
                label="事業内容"
                name="businessDescription"
                value={profile.businessDescription}
                onValueChange={(value) => handleChange("businessDescription", value)}
                placeholder="事業の詳細を記載してください"
                rows={4}
                isRequired
                isReadOnly={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                name="isSmallBusiness"
                isSelected={profile.isSmallBusiness}
                onValueChange={(checked) => handleChange("isSmallBusiness", checked)}
                isDisabled={!isEditing}
              />
              <span className="text-sm">中小企業として登録する</span>
            </div>
          </CardBody>

          {isEditing && (
            <CardFooter className="flex justify-end gap-2">
              <Button
                color="default"
                variant="flat"
                onPress={handleCancel}
                isDisabled={isLoading}
              >
                キャンセル
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                {isLoading ? "保存中..." : "保存"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}