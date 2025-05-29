// File: /app/(app)/documents/create/page.tsx
"use client";

import React, { useState, useRef, ChangeEvent } from "react";
// FontAwesomeのアイコンをインポート (上記と同様のセットアップが必要)
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faArrowLeft, faBuilding, faChartLine, faYenSign, faSearch, faCheckCircle, faInfoCircle, faCloudUploadAlt, faTimes, faEye, faSave, faPaperPlane, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';

// HeroUIのコンポーネント (推奨)
// import { Button } from "@heroui/button";
// import { Input, Textarea } from "@heroui/input";
// import { Progress } from "@heroui/progress";
// import { Tabs, Tab } from "@heroui/tabs";
// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
// import { Card, CardBody, CardHeader } from "@heroui/card";

// 型定義 (必要に応じて /types/domain.ts などに移動)
type ActiveTab = "company" | "business" | "finance";

interface FormData {
  companyName: string;
  representativeName: string;
  postalCode: string;
  address: string;
  phoneNumber: string;
  email: string;
  businessTitle: string;
  businessSummary: string;
  businessGoal: string;
  expectedResults: string;
  implementationPeriod: string;
  totalAmount: string;
  selfFundingAmount: string;
  subsidyRequestAmount: string;
  expenseBreakdown: string;
}

interface UploadedFiles {
  [key: string]: File | null;
  businessPlan: File | null;
  financialStatements: File | null;
  registrationCertificate: File | null;
  quotations: File | null;
}

const DocumentCreatePage: React.FC = () => { // コンポーネント名を変更
  const [activeTab, setActiveTab] = useState<ActiveTab>("company");
  const [progress, setProgress] = useState(25);
  const [formData, setFormData] = useState<FormData>({
    companyName: "株式会社テクノソリューション",
    representativeName: "山田 太郎",
    postalCode: "123-4567",
    address: "東京都千代田区丸の内1-1-1",
    phoneNumber: "03-1234-5678",
    email: "info@technosolution.co.jp",
    businessTitle: "",
    businessSummary: "",
    businessGoal: "",
    expectedResults: "",
    implementationPeriod: "",
    totalAmount: "",
    selfFundingAmount: "",
    subsidyRequestAmount: "",
    expenseBreakdown: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    businessPlan: null,
    financialStatements: null,
    registrationCertificate: null,
    quotations: null,
  });

  const fileInputRefs: { [K in keyof UploadedFiles]: React.RefObject<HTMLInputElement> } = {
    businessPlan: useRef<HTMLInputElement>(null),
    financialStatements: useRef<HTMLInputElement>(null),
    registrationCertificate: useRef<HTMLInputElement>(null),
    quotations: useRef<HTMLInputElement>(null),
  };

  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: keyof UploadedFiles, // stringから具体的なキーの型へ
  ) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fileType]: e.target.files![0],
      }));
    }
  };

  const handleFileDelete = (fileType: keyof UploadedFiles) => { // stringから具体的なキーの型へ
    setUploadedFiles((prev) => ({
      ...prev,
      [fileType]: null,
    }));
    if (fileInputRefs[fileType]?.current) {
      fileInputRefs[fileType]!.current!.value = "";
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    switch (tab) {
      case "company": setProgress(25); break;
      case "business": setProgress(50); break;
      case "finance": setProgress(75); break;
    }
  };

  const handleSave = () => {
    // ここでAPIを呼び出してデータを保存する処理を実装
    console.log("Form Data Saved:", formData);
    console.log("Uploaded Files:", uploadedFiles);
    alert("入力内容を一時保存しました。"); // UIフィードバックはトースト通知などが望ましい
  };

  const handleSubmit = () => {
    // ここでAPIを呼び出してデータを送信する処理を実装
    // バリデーションもここで行う
    console.log("Form Data Submitted:", formData);
    console.log("Uploaded Files:", uploadedFiles);
    setProgress(100); // 仮
    alert("申請を提出しました。審査結果をお待ちください。"); // UIフィードバック
  };

  const getFileName = (file: File | null): string => {
    if (!file) return "ファイルが選択されていません";
    return file.name.length > 20
      ? `${file.name.substring(0, 17)}...`
      : file.name;
  };

  const getFileSize = (file: File | null): string => {
    if (!file) return "";
    const sizeInKB = file.size / 1024;
    return sizeInKB < 1024
      ? `${Math.round(sizeInKB * 10) / 10}KB`
      : `${Math.round(sizeInKB / 102.4) / 10}MB`;
  };

  return (
    // ここにJSXを記述。提供されたコードの<div className="flex flex-col min-h-screen ..."> から </div> まで。
    // アイコン部分、Tailwindクラス、HeroUIコンポーネントの推奨は上記チャット画面と同様。
    // 特にフォーム要素 (input, textarea, button, tabs, progress, modal) はHeroUIのコンポーネントに置き換える効果が高いです。
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] bg-gray-50 font-sans">
      {/* ヘッダー (このページ専用) */}
      <header className="bg-background shadow-sm h-16 flex items-center px-6 sticky top-0 z-10 border-b border-divider">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-2xl font-bold text-primary">
            補助金申請書類作成
          </h1>
          <a // Next.js の Link コンポーネント推奨
            href="/subsidies/matching-chat" // 戻る先のパスを適切に設定
            // data-readdy="true"
            className="flex items-center text-primary hover:text-primary-focus cursor-pointer"
          >
            {/* <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> */}
            <span className="mr-2">←</span>
            補助金検索に戻る
          </a>
        </div>
      </header>

      {/* プログレスバー */}
      <div className="bg-background shadow-sm py-4 px-6 border-b border-divider">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-foreground-700">
              申請プロセス
            </span>
            <span className="text-sm font-medium text-primary">
              {progress}% 完了
            </span>
          </div>
          {/* <Progress value={progress} color="primary" size="sm" aria-label="申請進捗" /> */}
           <div className="w-full bg-default-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-foreground-500 mt-1">
            <span className={progress >= 0 ? "text-primary font-medium" : ""}> {/* 0%からハイライト */}
              基本情報入力
            </span>
            <span className={progress >= 34 ? "text-primary font-medium" : ""}> {/* 1/3 */}
              事業計画入力
            </span>
            <span className={progress >= 67 ? "text-primary font-medium" : ""}> {/* 2/3 */}
              資金計画・書類
            </span>
            <span
              className={progress >= 100 ? "text-primary font-medium" : ""}
            >
              確認・提出
            </span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          {/* 補助金基本情報 (Cardコンポーネント推奨) */}
          <div className="bg-background rounded-lg shadow-sm p-6 mb-6 border border-divider">
            <h2 className="text-xl font-semibold text-foreground-800 mb-4"> {/* サイズ調整 */}
              申請対象の補助金
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                <h3 className="text-lg font-medium text-primary-800 mb-2"> {/* サイズ調整 */}
                  IT導入補助金2025 (サンプル)
                </h3>
                <p className="text-sm text-foreground-700 mb-3">
                  ITツール導入による生産性向上を支援する補助金制度です。中小企業・小規模事業者等が自社の課題やニーズに合ったITツールを導入する経費の一部を補助します。
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-foreground-500">申請期限：</span>
                    <span className="font-medium text-danger-600">
                      2025年6月30日
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground-500">補助率：</span>
                    <span className="font-medium">1/2〜2/3</span>
                  </div>
                  <div>
                    <span className="text-foreground-500">補助上限額：</span>
                    <span className="font-medium">450万円</span>
                  </div>
                </div>
              </div>
              <div className="bg-content2 rounded-lg p-4 border border-divider">
                <h3 className="text-lg font-medium text-foreground-800 mb-2"> {/* サイズ調整 */}
                  申請のポイント
                </h3>
                <ul className="text-sm text-foreground-700 space-y-2">
                  {[
                    "導入するITツールが生産性向上にどう貢献するか具体的に記載",
                    "現状の課題と導入後の改善効果を数値で示す",
                    "事業計画との整合性を明確に説明する",
                    "見積書や導入計画書は詳細に作成する",
                  ].map((point, i) => (
                    <li key={i} className="flex items-start">
                      {/* <FontAwesomeIcon icon={faCheckCircle} className="text-success mt-0.5 mr-2" /> */}
                      <span className="text-success mr-2 mt-0.5">✔</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 入力フォームとアップロードエリア */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 入力フォーム (Cardコンポーネント推奨) */}
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg shadow-sm overflow-hidden border border-divider">
                {/* タブナビゲーション (HeroUIのTabsコンポーネント推奨) */}
                {/* <Tabs 
                    aria-label="申請フォームタブ" 
                    selectedKey={activeTab}
                    onSelectionChange={(key) => handleTabChange(key as ActiveTab)}
                    color="primary"
                >
                    <Tab key="company" title={<><span className="mr-2">🏢</span>会社情報</>}>...</Tab>
                    <Tab key="business" title={<><span className="mr-2">📈</span>事業計画</>}>...</Tab>
                    <Tab key="finance" title={<><span className="mr-2">💰</span>資金計画</>}>...</Tab>
                </Tabs> */}
                <div className="flex border-b border-divider">
                  {(["company", "business", "finance"] as ActiveTab[]).map(tab => (
                    <button
                      key={tab}
                      className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? "text-primary border-b-2 border-primary bg-primary-50"
                          : "text-foreground-500 hover:text-foreground-700 hover:bg-default-100"
                      }`}
                      onClick={() => handleTabChange(tab)}
                    >
                      {/* <FontAwesomeIcon icon={tab === "company" ? faBuilding : tab === "business" ? faChartLine : faYenSign} className="mr-2" /> */}
                      <span className="mr-2">{tab === "company" ? "🏢" : tab === "business" ? "📈" : "💰"}</span>
                      {tab === "company" ? "会社情報" : tab === "business" ? "事業計画" : "資金計画"}
                    </button>
                  ))}
                </div>

                {/* タブコンテンツ */}
                <div className="p-6">
                  {/* 会社情報タブ */}
                  {activeTab === "company" && (
                    <div className="space-y-5 animate-fadeIn"> {/* フェードインアニメーション追加 */}
                      {/* InputフィールドはHeroUIのInputコンポーネントでラップすることを推奨 */}
                      {/* 例: <Input label="会社名" name="companyName" value={formData.companyName} onChange={handleInputChange} isRequired /> */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label htmlFor="companyName" className="block text-sm font-medium text-foreground-700 mb-1">
                            会社名 <span className="text-danger">*</span>
                          </label>
                          <input
                            id="companyName" type="text" name="companyName" value={formData.companyName} onChange={handleInputChange}
                            className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1" required
                          />
                        </div>
                        <div>
                          <label htmlFor="representativeName" className="block text-sm font-medium text-foreground-700 mb-1">
                            代表者名 <span className="text-danger">*</span>
                          </label>
                          <input
                            id="representativeName" type="text" name="representativeName" value={formData.representativeName} onChange={handleInputChange}
                            className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1" required
                          />
                        </div>
                      </div>
                      {/* ... 他の会社情報フィールドも同様にlabelのhtmlForとinputのidを紐付ける ... */}
                       <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-foreground-700 mb-1">
                            郵便番号 <span className="text-danger">*</span>
                          </label>
                          <div className="flex">
                            <input
                              id="postalCode" type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                              className="w-40 border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
                              placeholder="123-4567" required
                            />
                            <button className="ml-2 bg-default-200 hover:bg-default-300 text-foreground-700 px-3 py-2 rounded-md text-sm whitespace-nowrap cursor-pointer">
                              <span className="mr-1">🔍</span>
                              住所検索
                            </button>
                          </div>
                        </div>
                        {/* ... 省略 (住所、電話番号、メールアドレス) ... */}
                    </div>
                  )}

                  {/* 事業計画タブ */}
                  {activeTab === "business" && (
                    <div className="space-y-5 animate-fadeIn">
                      {/* TextareaもHeroUIのTextareaコンポーネント推奨 */}
                      {/* 例: <Textarea label="事業計画タイトル" name="businessTitle" ... /> */}
                       <div>
                        <label htmlFor="businessTitle" className="block text-sm font-medium text-foreground-700 mb-1">
                          事業計画タイトル <span className="text-danger">*</span>
                        </label>
                        <input id="businessTitle" type="text" name="businessTitle" value={formData.businessTitle} onChange={handleInputChange}
                          className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
                          placeholder="例：クラウド基幹システム導入による業務効率化プロジェクト" required/>
                      </div>
                      {/* ... 省略 (事業概要、事業目的、期待される効果、実施期間) ... */}
                    </div>
                  )}

                  {/* 資金計画タブ */}
                  {activeTab === "finance" && (
                    <div className="space-y-5 animate-fadeIn">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label htmlFor="totalAmount" className="block text-sm font-medium text-foreground-700 mb-1">
                            事業の総額 <span className="text-danger">*</span>
                          </label>
                          <div className="relative">
                            <input id="totalAmount" type="text" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange}
                              className="w-full border border-default-300 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
                              placeholder="1,000,000" required />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-500 text-sm">¥</span>
                          </div>
                        </div>
                        {/* ... 省略 (自己資金額、補助金申請額) ... */}
                      </div>
                      <div>
                        <label htmlFor="expenseBreakdown" className="block text-sm font-medium text-foreground-700 mb-1">
                          経費内訳 <span className="text-danger">*</span>
                        </label>
                        <textarea id="expenseBreakdown" name="expenseBreakdown" value={formData.expenseBreakdown} onChange={handleInputChange} rows={5}
                          className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1"
                          placeholder={"例：\n・クラウドERP導入費：600,000円\n・システム設定費：300,000円\n・社員研修費：100,000円"} required
                        ></textarea>
                      </div>
                      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4"> {/* HeroUIのWarningカラー */}
                        <h4 className="text-sm font-medium text-warning-800 mb-2">
                          資金計画作成のポイント
                        </h4>
                        <ul className="text-xs text-warning-700 space-y-1">
                          {[
                            "補助対象経費と補助対象外経費を明確に区分してください",
                            "経費の内訳は具体的かつ詳細に記載してください",
                            "見積書の金額と一致させてください",
                          ].map((point, i) => (
                            <li key={i} className="flex items-start">
                              {/* <FontAwesomeIcon icon={faInfoCircle} className="text-warning-600 mt-0.5 mr-1.5" /> */}
                              <span className="text-warning-600 mr-1.5 mt-0.5">ℹ️</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 添付書類アップロード (Cardコンポーネント推奨) */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg shadow-sm p-6 border border-divider">
                <h2 className="text-lg font-semibold text-foreground-800 mb-4">
                  添付書類アップロード
                </h2>
                <div className="space-y-5">
                  {(Object.keys(uploadedFiles) as Array<keyof UploadedFiles>).map((fileKey) => {
                    const fileLabels: Record<keyof UploadedFiles, string> = {
                        businessPlan: "事業計画書",
                        financialStatements: "決算書（直近2期分）",
                        registrationCertificate: "登記簿謄本",
                        quotations: "見積書",
                    };
                    const acceptedFormats: Record<keyof UploadedFiles, string> = {
                        businessPlan: "PDF・Word・Excel",
                        financialStatements: "PDF・Excel",
                        registrationCertificate: "PDF",
                        quotations: "PDF",
                    };
                     const acceptedMimeTypes: Record<keyof UploadedFiles, string> = {
                        businessPlan: ".pdf,.doc,.docx,.xls,.xlsx",
                        financialStatements: ".pdf,.xls,.xlsx",
                        registrationCertificate: ".pdf",
                        quotations: ".pdf",
                    };

                    return (
                      <div key={fileKey}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-foreground-700">
                            {fileLabels[fileKey]} <span className="text-danger">*</span>
                          </label>
                          <span className="text-xs text-foreground-500">
                            {acceptedFormats[fileKey]}
                          </span>
                        </div>
                        <div className="border border-default-300 rounded-lg p-3 bg-content2">
                          {uploadedFiles[fileKey] ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center overflow-hidden">
                                {/* <FontAwesomeIcon icon={uploadedFiles[fileKey]?.type.includes("pdf") ? faFilePdf : faFileExcel} className={`mr-2 text-xl ${uploadedFiles[fileKey]?.type.includes("pdf") ? "text-danger-500" : "text-success-500"}`} /> */}
                                <span className={`mr-2 text-xl ${uploadedFiles[fileKey]?.type.includes("pdf") ? "text-danger-500" : "text-success-500"}`}>📄</span>
                                <div className="overflow-hidden">
                                  <div className="text-sm font-medium text-foreground-800 truncate" title={uploadedFiles[fileKey]?.name}>
                                    {getFileName(uploadedFiles[fileKey])}
                                  </div>
                                  <div className="text-xs text-foreground-500">
                                    {getFileSize(uploadedFiles[fileKey])}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleFileDelete(fileKey)}
                                className="text-foreground-400 hover:text-danger-500 cursor-pointer p-1 ml-2 flex-shrink-0"
                                aria-label={`Delete ${fileLabels[fileKey]}`}
                              >
                                {/* <FontAwesomeIcon icon={faTimes} /> */}
                                <span>✕</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-4 md:py-6"> {/* パディング調整 */}
                              <input
                                type="file"
                                id={String(fileKey)}
                                ref={fileInputRefs[fileKey]}
                                onChange={(e) => handleFileUpload(e, fileKey)}
                                className="hidden"
                                accept={acceptedMimeTypes[fileKey]}
                              />
                              <label
                                htmlFor={String(fileKey)}
                                className="cursor-pointer inline-flex flex-col items-center"
                              >
                                {/* <FontAwesomeIcon icon={faCloudUploadAlt} className="text-primary text-2xl mb-2" /> */}
                                <span className="text-primary text-3xl mb-1">☁️</span>
                                <span className="text-sm text-primary font-medium">
                                  クリックしてアップロード
                                </span>
                                <span className="text-xs text-foreground-500 mt-1">
                                  またはドラッグ＆ドロップ
                                </span>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-medium text-primary-800 mb-2">
                      アップロード時の注意点
                    </h4>
                    <ul className="text-xs text-primary-700 space-y-1">
                      {[
                        "ファイルサイズは1ファイルあたり10MB以下にしてください",
                        "PDFファイルは文字検索可能な形式で保存してください",
                        "ファイル名は内容がわかるように付けてください",
                      ].map((point, i) => (
                        <li key={i} className="flex items-start">
                           <span className="text-primary-600 mr-1.5 mt-0.5">ℹ️</span>
                           <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* プレビューボタンと操作ボタン */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <button // HeroUIのButton推奨
              onClick={() => setShowPreview(true)}
              className="w-full md:w-auto bg-background border border-primary text-primary hover:bg-primary-50 font-medium py-3 px-6 rounded-md whitespace-nowrap cursor-pointer"
            >
              {/* <FontAwesomeIcon icon={faEye} className="mr-2" /> */}
              <span className="mr-2">👁️</span>
              入力内容をプレビュー
            </button>
            <div className="flex space-x-4 w-full md:w-auto">
              <button // HeroUIのButton推奨
                onClick={handleSave}
                className="flex-1 md:flex-none bg-default-200 hover:bg-default-300 text-foreground-700 font-medium py-3 px-8 rounded-md whitespace-nowrap cursor-pointer"
              >
                {/* <FontAwesomeIcon icon={faSave} className="mr-2" /> */}
                <span className="mr-2">💾</span>
                一時保存
              </button>
              <button // HeroUIのButton推奨
                onClick={handleSubmit}
                className="flex-1 md:flex-none bg-primary hover:bg-primary-focus text-primary-foreground font-medium py-3 px-8 rounded-md whitespace-nowrap cursor-pointer"
              >
                {/* <FontAwesomeIcon icon={faPaperPlane} className="mr-2" /> */}
                <span className="mr-2">🚀</span>
                申請を提出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* プレビューモーダル (HeroUIのModal推奨) */}
      {showPreview && (
        // <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} size="4xl" scrollBehavior="inside">
        //    <ModalContent>
        //      <ModalHeader>申請内容プレビュー</ModalHeader>
        //      <ModalBody>...</ModalBody>
        //      <ModalFooter>
        //        <Button onPress={() => setShowPreview(false)} color="primary">閉じる</Button>
        //      </ModalFooter>
        //    </ModalContent>
        // </Modal>
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-divider p-4">
              <h2 className="text-lg font-semibold text-foreground-800">
                申請内容プレビュー
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-foreground-500 hover:text-foreground-700 cursor-pointer p-1"
                aria-label="閉じる"
              >
                {/* <FontAwesomeIcon icon={faTimes} className="text-xl" /> */}
                <span>✕</span>
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* 補助金情報 */}
                <div>
                    <h3 className="text-base font-semibold text-primary mb-3 pb-2 border-b border-primary-200">
                    補助金情報
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-foreground-500">補助金名：</span><span className="font-medium">IT導入補助金2025 (サンプル)</span></div>
                    <div><span className="text-foreground-500">申請期限：</span><span className="font-medium">2025年6月30日</span></div>
                    </div>
                </div>
                {/* 会社情報 */}
                <div>
                    <h3 className="text-base font-semibold text-primary mb-3 pb-2 border-b border-primary-200">
                    会社情報
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {Object.entries({
                        companyName: "会社名", representativeName: "代表者名", postalCode: "郵便番号",
                        address: "住所", phoneNumber: "電話番号", email: "メールアドレス"
                    }).map(([key, label]) => (
                        <div key={key}><span className="text-foreground-500">{label}：</span><span className="font-medium">{formData[key as keyof FormData] || "未入力"}</span></div>
                    ))}
                    </div>
                </div>
                 {/* 事業計画 */}
                <div>
                    <h3 className="text-base font-semibold text-primary mb-3 pb-2 border-b border-primary-200">事業計画</h3>
                    <div className="space-y-3 text-sm">
                        {(["businessTitle", "businessSummary", "businessGoal", "expectedResults", "implementationPeriod"] as Array<keyof FormData>).map(key => {
                            const labels: Record<string, string> = {
                                businessTitle: "事業計画タイトル", businessSummary: "事業概要", businessGoal: "事業目的",
                                expectedResults: "期待される効果", implementationPeriod: "実施期間"
                            };
                            const isTextArea = ["businessSummary", "businessGoal", "expectedResults"].includes(key);
                            return (
                                <div key={key}>
                                    <span className="text-foreground-500">{labels[key]}：</span>
                                    {isTextArea ? (
                                        <div className="bg-content2 p-3 rounded border border-divider mt-1 whitespace-pre-line">{formData[key] || "未入力"}</div>
                                    ) : (
                                        <span className="font-medium">{formData[key] || "未入力"}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* 資金計画 */}
                <div>
                    <h3 className="text-base font-semibold text-primary mb-3 pb-2 border-b border-primary-200">資金計画</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm mb-3">
                        {(["totalAmount", "selfFundingAmount", "subsidyRequestAmount"] as Array<keyof FormData>).map(key => {
                            const labels: Record<string, string> = { totalAmount: "事業の総額", selfFundingAmount: "自己資金額", subsidyRequestAmount: "補助金申請額"};
                            return <div key={key}><span className="text-foreground-500">{labels[key]}：</span><span className="font-medium">{formData[key] ? `¥${Number(formData[key]).toLocaleString()}` : "未入力"}</span></div>;
                        })}
                    </div>
                    <div className="text-sm">
                        <div className="text-foreground-500 mb-1">経費内訳：</div>
                        <div className="bg-content2 p-3 rounded border border-divider whitespace-pre-line">{formData.expenseBreakdown || "未入力"}</div>
                    </div>
                </div>
                {/* 添付書類 */}
                <div>
                    <h3 className="text-base font-semibold text-primary mb-3 pb-2 border-b border-primary-200">添付書類</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {(Object.keys(uploadedFiles) as Array<keyof UploadedFiles>).map(fileKey => (
                        <div key={fileKey}><span className="text-foreground-500">{ ({businessPlan: "事業計画書", financialStatements: "決算書", registrationCertificate: "登記簿謄本", quotations: "見積書"})[fileKey] }：</span>
                        <span className={uploadedFiles[fileKey] ? "font-medium text-success" : "text-danger"}>{uploadedFiles[fileKey] ? `アップロード済み (${getFileName(uploadedFiles[fileKey])})` : "未アップロード"}</span></div>
                    ))}
                    </div>
                </div>
            </div>
            <div className="border-t border-divider p-4 flex justify-end bg-content2">
              <button // HeroUIのButton推奨
                onClick={() => setShowPreview(false)}
                className="bg-primary hover:bg-primary-focus text-primary-foreground font-medium py-2 px-6 rounded-md whitespace-nowrap cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCreatePage;