// File: /app/(app)/documents/generate/page.tsx
"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // useSearchParamsを追加
import Link from 'next/link';

// HeroUIコンポーネント (実際のインポートパスに合わせてください)
// import { Button } from "@heroui/button";
// import { Select, SelectItem } from "@heroui/react"; // Selectコンポーネント
// import { Textarea } from "@heroui/input";
// import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
// import { Progress } from "@heroui/progress";
// import { Spinner } from "@heroui/spinner";
// import { Tabs, Tab } from "@heroui/react"; // 必要であれば
// import { Code } from "@heroui/code"; // 生成されたテキスト表示用

// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
const Button: React.FC<any> = ({ children, onClick, type = "button", color = "default", isLoading, disabled, fullWidth, className, variant }) => {
    const colorClasses = color === "primary" ? "bg-primary text-primary-foreground hover:bg-primary-focus"
                       : color === "success" ? "bg-success text-success-foreground hover:bg-success-focus"
                       : variant === "bordered" ? "border border-default-300 text-foreground hover:bg-default-100"
                       : "bg-default-200 text-default-800 hover:bg-default-300";
    return <button type={type} onClick={onClick} disabled={isLoading || disabled}
            className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${colorClasses} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        {isLoading ? <Spinner size="sm" color="current" className="mr-2"/> : null}
        {isLoading ? "処理中..." : children}
    </button>
};
const Select: React.FC<any> = ({ label, name, value, onChange, children, required, disabled, className }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    disabled={disabled}
    className={className}
  >
    {children}
  </select>
);
const Textarea: React.FC<any> = ({ label, name, value, onChange, placeholder, rows = 3, required, disabled, className, readOnly }) => (
  <textarea
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    required={required}
    disabled={disabled}
    className={className}
    readOnly={readOnly}
  />
);
const Card: React.FC<any> = ({ children, className }) => <div className={`bg-background shadow-lg rounded-xl border border-divider ${className}`}>{children}</div>;
const CardHeader: React.FC<any> = ({ children, className }) => <div className={`p-6 border-b border-divider ${className}`}>{children}</div>;
const CardBody: React.FC<any> = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardFooter: React.FC<any> = ({ children, className }) => <div className={`p-6 border-t border-divider bg-content2 rounded-b-xl ${className}`}>{children}</div>;
const Spinner: React.FC<any> = ({size, color, className}) => <div className={`animate-spin rounded-full border-2 border-current border-t-transparent h-5 w-5 ${className}`}></div>;
const Code: React.FC<any> = ({children, className}) => <pre className={`bg-content1 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap ${className}`}>{children}</pre>;


// 型定義
interface CompanyInfoSummary { // 企業情報ページから取得する主要情報
  companyName: string;
  industry: string;
  businessDescription: string;
  employeeCountCategory: string;
  // ...その他AI生成に必要な情報
}

interface Subsidy { // 補助金検索結果などから渡される情報
  id: string;
  name: string;
  // ...その他補助金情報
}

interface GeneratedSection {
  title: string; // 例: "事業計画の概要", "主な経費"
  content: string; // AIが生成したテキスト
  editable?: boolean; // ユーザーが編集可能か
}

export default function DocumentGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // URLクエリパラメータを取得

  const [companyInfo, setCompanyInfo] = useState<CompanyInfoSummary | null>(null);
  const [selectedSubsidy, setSelectedSubsidy] = useState<Subsidy | null>(null);
  const [targetSections, setTargetSections] = useState<string[]>(['business_overview', 'expense_details']); // AIに生成を依頼するセクション
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<'initial' | 'generating' | 'results'>('initial');

  // ダミーの補助金リスト (実際にはAPIや前のページから渡される)
  const availableSubsidies: Subsidy[] = [
    { id: '1', name: 'IT導入補助金2025' },
    { id: '2', name: '小規模事業者持続化補助金' },
    { id: '3', name: '事業再構築補助金' },
  ];

  useEffect(() => {
    // 企業情報をAPIから取得 (またはContextから)
    const fetchCompanyInfo = async () => {
      // setIsLoading(true);
      // ダミーデータ
      setCompanyInfo({
        companyName: "株式会社サンプル商事",
        industry: "卸売業、小売業",
        businessDescription: "各種商品の卸売および小売業。特に地域産品の販路拡大に注力。",
        employeeCountCategory: "21～50人",
      });
      // setIsLoading(false);
    };
    fetchCompanyInfo();

    // URLクエリから補助金IDを取得して選択状態にする
    const subsidyIdFromQuery = searchParams.get('subsidyId');
    if (subsidyIdFromQuery) {
      const foundSubsidy = availableSubsidies.find(s => s.id === subsidyIdFromQuery);
      if (foundSubsidy) {
        setSelectedSubsidy(foundSubsidy);
      }
    } else if (availableSubsidies.length > 0) {
        // デフォルトで最初の補助金を選択
        setSelectedSubsidy(availableSubsidies[0]);
    }

  }, [searchParams]);

  const handleSubsidyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subsidyId = e.target.value;
    const subsidy = availableSubsidies.find(s => s.id === subsidyId) || null;
    setSelectedSubsidy(subsidy);
  };

  const handleSectionToggle = (sectionKey: string) => {
    setTargetSections(prev =>
      prev.includes(sectionKey)
        ? prev.filter(s => s !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const handleGenerateDocuments = async (event: FormEvent) => {
    event.preventDefault();
    if (!companyInfo || !selectedSubsidy || targetSections.length === 0) {
      setError("企業情報、対象補助金、および生成するセクションを選択してください。");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedDocuments([]);
    setCurrentStage('generating');

    try {
      // AI生成APIをコール (バックエンドに実装)
      // const response = await fetch('/api/ai/generate-document-draft', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     companyInfo,
      //     subsidyId: selectedSubsidy.id,
      //     sections: targetSections,
      //   }),
      // });
      // if (!response.ok) {
      //   const errData = await response.json();
      //   throw new Error(errData.message || '書類ドラフトの生成に失敗しました。');
      // }
      // const data: GeneratedSection[] = await response.json();

      // ダミーAPIレスポンス
      await new Promise(resolve => setTimeout(resolve, 2500));
      const dummyData: GeneratedSection[] = targetSections.map(sectionKey => {
        if (sectionKey === 'business_overview') {
          return {
            title: "事業計画の骨子（AI案）",
            content: `【事業名】\n${selectedSubsidy?.name}を活用した「${companyInfo.companyName}の${companyInfo.industry}におけるDX推進プロジェクト」\n\n【背景・課題】\n${companyInfo.businessDescription}。\n現状の課題として、手作業による業務が多く、生産性の低下やヒューマンエラーのリスクが挙げられる。特に顧客管理や在庫管理において、効率化の余地が大きい。\n\n【目的・目標】\n本事業では、ITツール（例：クラウド型ERP、CRMシステム）を導入し、業務プロセスの自動化とデータの一元管理を実現する。\n目標：\n1. 業務時間を20%削減\n2. 在庫管理精度を99%以上に向上\n3. 顧客満足度を10ポイント向上\n\n【実施内容】\n1. 現状業務プロセスの分析と課題特定 (1ヶ月目)\n2. ITツールの選定と比較検討 (1-2ヶ月目)\n3. システム導入とカスタマイズ (3-5ヶ月目)\n4. 社員研修と運用テスト (5-6ヶ月目)\n5. 本格稼働と効果測定 (6ヶ月目以降)\n\n【期待される効果】\n生産性向上によるコスト削減（年間XXX万円）、リードタイム短縮による競争力強化、データ活用による新たな事業機会の創出。`,
            editable: true,
          };
        }
        if (sectionKey === 'expense_details') {
          return {
            title: "主な経費内訳（AI案）",
            content: `1. ソフトウェア導入費用\n   - クラウドERPライセンス費用 (年額): XXX円\n   - CRMシステム利用料 (月額): YYY円\n2. ハードウェア購入費用\n   - 高性能PC (業務効率化用) 5台: ZZZ円\n3. 専門家経費\n   - ITコンサルタント導入支援費用: AAA円\n   - システム設定・カスタマイズ費用: BBB円\n4. その他\n   - 社員研修費用: CCC円\n   - データ移行作業委託費: DDD円\n\n【補助対象経費合計（見込み）】: EEE円\n【補助金申請額（見込み）】: FFF円 (補助率X%の場合)`,
            editable: true,
          };
        }
        return { title: `${sectionKey} (AI案)`, content: `AIが${sectionKey}に関する内容を生成しました。\nこれはサンプルテキストです。`, editable: true };
      });
      setGeneratedDocuments(dummyData);
      setCurrentStage('results');

    } catch (err: any) {
      setError(err.message);
      setCurrentStage('initial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGeneratedContent = (index: number, newContent: string) => {
    setGeneratedDocuments(prev =>
      prev.map((doc, i) => (i === index ? { ...doc, content: newContent } : doc))
    );
  };

  const handleProceedToFullForm = () => {
    // 生成された内容をlocalStorageや状態管理ライブラリ経由で書類作成ページに渡す
    // sessionStorage.setItem('generatedDocumentDrafts', JSON.stringify(generatedDocuments));
    // router.push(`/documents/create?subsidyId=${selectedSubsidy?.id}`);
    alert("書類作成ページへ進みます (機能未実装)\n生成された内容は次のページで利用できます。");
  };

  const availableSections = [
    { key: 'business_overview', label: '事業計画の骨子・概要' },
    { key: 'problem_solution', label: '現状の課題と解決策' },
    { key: 'target_market', label: 'ターゲット市場と顧客層' },
    { key: 'implementation_plan', label: '実施体制とスケジュール' },
    { key: 'expense_details', label: '主な経費内訳' },
    { key: 'funding_plan', label: '資金調達計画' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-foreground">AI書類ドラフト生成</h1>
        <p className="mt-2 text-lg text-foreground-500">
          企業情報と対象補助金に基づき、申請書類の主要な部分のドラフトをAIが作成します。
        </p>
      </header>

      {error && <div className="p-4 bg-danger-50 text-danger-700 rounded-md text-sm">{error}</div>}

      {currentStage === 'initial' && (
        <Card>
          <form onSubmit={handleGenerateDocuments}>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground-800">生成条件の設定</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-foreground-700 mb-1">対象補助金</h3>
                <Select
                  name="selectedSubsidy"
                  value={selectedSubsidy?.id || ""}
                  onChange={handleSubsidyChange}
                  disabled={isLoading || !availableSubsidies.length}
                  required
                  className="w-full md:w-1/2"
                >
                  <option value="" disabled>補助金を選択してください</option>
                  {availableSubsidies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
                {!selectedSubsidy && availableSubsidies.length === 0 && <p className="text-sm text-warning-600 mt-1">利用可能な補助金情報がありません。</p>}
              </div>

              <div>
                <h3 className="text-md font-medium text-foreground-700 mb-2">生成するセクションを選択</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableSections.map(section => (
                    <label key={section.key} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all
                      ${targetSections.includes(section.key) ? 'bg-primary-50 border-primary shadow-sm' : 'border-default-300 hover:border-default-400'}`}>
                      <input
                        type="checkbox"
                        checked={targetSections.includes(section.key)}
                        onChange={() => handleSectionToggle(section.key)}
                        className="form-checkbox h-5 w-5 text-primary rounded border-default-400 focus:ring-primary"
                        disabled={isLoading}
                      />
                      <span className={`ml-3 text-sm font-medium ${targetSections.includes(section.key) ? 'text-primary-700' : 'text-foreground-700'}`}>
                        {section.label}
                      </span>
                    </label>
                  ))}
                </div>
                {targetSections.length === 0 && <p className="text-sm text-warning-600 mt-2">少なくとも1つのセクションを選択してください。</p>}
              </div>

              {companyInfo && (
                <div className="bg-content1 p-4 rounded-lg border border-divider">
                    <h3 className="text-md font-medium text-foreground-700 mb-1">利用する企業情報（抜粋）</h3>
                    <p className="text-sm text-foreground-600">会社名: {companyInfo.companyName}</p>
                    <p className="text-sm text-foreground-600">業種: {companyInfo.industry}</p>
                    <p className="text-sm text-foreground-600">事業内容: {companyInfo.businessDescription.substring(0,100)}...</p>
                    <Link href="/company" className="text-xs text-primary hover:underline mt-1 inline-block">企業情報を編集する</Link>
                </div>
              )}

            </CardBody>
            <CardFooter className="flex justify-end">
              <Button type="submit" color="primary" isLoading={isLoading} disabled={!companyInfo || !selectedSubsidy || targetSections.length === 0}>
                <span className="mr-1">✨</span>
                ドラフトを生成する
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {currentStage === 'generating' && (
        <Card className="text-center py-12">
          <CardBody className="flex flex-col items-center justify-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-lg font-medium text-foreground-600">AIが書類ドラフトを生成中です...</p>
            <p className="text-sm text-foreground-500">通常10秒〜30秒程度かかります。しばらくお待ちください。</p>
          </CardBody>
        </Card>
      )}

      {currentStage === 'results' && generatedDocuments.length > 0 && (
        <div className="space-y-6">
          <header className="text-center">
            <h2 className="text-2xl font-semibold text-success">ドラフトが生成されました！</h2>
            <p className="mt-1 text-foreground-500">内容を確認し、必要に応じて編集してください。</p>
          </header>
          {generatedDocuments.map((doc, index) => (
            <Card key={index}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground-800">{doc.title}</h3>
              </CardHeader>
              <CardBody>
                {doc.editable ? (
                  <Textarea
                    value={doc.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleEditGeneratedContent(index, e.target.value)}
                    rows={Math.max(8, doc.content.split('\n').length + 2)} // 内容に応じて高さを調整
                    className="w-full text-sm leading-relaxed font-mono" // モノスペースフォントの方が見やすい場合も
                    placeholder="AIが生成した内容を編集できます..."
                  />
                ) : (
                  <Code className="text-sm leading-relaxed">{doc.content}</Code>
                )}
              </CardBody>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="bordered" onClick={() => navigator.clipboard.writeText(doc.content)} className="text-xs">
                    <span className="mr-1">📋</span>コピー
                </Button>
                {/* ダウンロード機能は別途ライブラリ (file-saverなど) が必要 */}
                {/* <Button variant="bordered" className="text-xs">
                    <span className="mr-1">💾</span>TXTで保存
                </Button> */}
              </CardFooter>
            </Card>
          ))}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 pt-6 border-t border-divider">
            <Button onClick={() => { setCurrentStage('initial'); setGeneratedDocuments([]); }} variant="bordered" className="w-full sm:w-auto">
              <span className="mr-1">🔄</span>条件を変えて再生成
            </Button>
            <Button color="success" onClick={handleProceedToFullForm} className="w-full sm:w-auto">
              <span className="mr-1">📝</span>この内容で書類作成に進む
            </Button>
          </div>
        </div>
      )}
      {currentStage === 'results' && generatedDocuments.length === 0 && !isLoading && (
         <Card className="text-center py-10">
            <CardBody>
                <p className="text-lg text-warning-700">ドラフトの生成に失敗したか、対象データがありませんでした。</p>
                <Button onClick={() => setCurrentStage('initial')} className="mt-4">再試行</Button>
            </CardBody>
         </Card>
      )}
    </div>
  );
}
