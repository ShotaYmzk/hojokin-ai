// File: /app/(app)/documents/create/page.tsx
"use client";

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// --- 型定義 ---
interface Task {
  id: string;
  label: string;
  completed: boolean;
  relatedField?: string;
}

interface SubsidyInfo {
  id: string;
  name: string;
  summary: string;
  deadline: string;
  subsidyRate: string;
  maxAmount: string;
}

interface FormData {
  companyName: string;
  representativeName: string;
  postalCode: string;
  address: string;
  businessTitle: string;
  businessSummary: string;
  totalAmount: string;
  subsidyRequestAmount: string;
}

interface UploadedFiles {
  [key: string]: File | null;
  businessPlan: File | null;
  financialStatements: File | null;
  quotations: File | null;
}

// --- ダミーデータ ---
const dummySubsidyData: { [key: string]: SubsidyInfo } = {
  "1": { id: "1", name: "IT導入補助金2025", summary: "ITツール導入による生産性向上を支援する補助金制度です。", deadline: "2025-06-30", subsidyRate: "1/2〜2/3", maxAmount: "450万円" },
  "2": { id: "2", name: "小規模事業者持続化補助金", summary: "小規模事業者の販路開拓等の取り組みを支援します。", deadline: "2025-08-10", subsidyRate: "2/3", maxAmount: "50万円" },
};

const dummyApplicationData = {
  formData: { companyName: "株式会社サンプル商事", representativeName: "山田 太郎", postalCode: "100-0001", address: "東京都千代田区丸の内1-1-1", businessTitle: "クラウドERP導入による業務改革プロジェクト", businessSummary: "既存のオンプレミス会計システムをクラウドERPに移行し、全社の業務効率を20%向上させる。", totalAmount: "3000000", subsidyRequestAmount: "1500000" },
  tasks: [ { id: "t1", label: "基本情報の入力", completed: true, relatedField: 'companyName' }, { id: "t2", label: "事業計画の入力", completed: true, relatedField: 'businessTitle' }, { id: "t3", label: "資金計画の入力", completed: true, relatedField: 'totalAmount' }, { id: "t4", label: "事業計画書の添付", completed: false, relatedField: 'businessPlan' }, { id: "t5", label: "見積書の添付", completed: false, relatedField: 'quotations' }, { id: "t6", label: "決算書の添付", completed: false, relatedField: 'financialStatements' } ],
  uploadedFiles: { businessPlan: null, financialStatements: null, quotations: null }
};

// --- UIコンポーネント (仮) ---
const Card: React.FC<any> = ({ children, className }) => <div className={`bg-background shadow-md rounded-lg ${className}`}>{children}</div>;
const CardHeader: React.FC<any> = ({ children, className }) => <div className={`p-4 sm:p-6 border-b border-divider ${className}`}>{children}</div>;
const CardBody: React.FC<any> = ({ children, className }) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const Button: React.FC<any> = ({ children, onClick, type = "button", color = "default", isLoading, disabled, className, title }) => {
    const colorClasses = color === "primary" ? "bg-primary text-primary-foreground hover:bg-primary-focus" : "bg-default-200 text-default-800 hover:bg-default-300";
    return <button type={type} onClick={onClick} disabled={isLoading || disabled} title={title} className={`px-4 py-2 rounded-md font-medium transition-colors ${colorClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}>{isLoading ? "処理中..." : children}</button>;
};

const DocumentCreatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const [subsidy, setSubsidy] = useState<SubsidyInfo | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState<FormData>({ companyName: "", representativeName: "", postalCode: "", address: "", businessTitle: "", businessSummary: "", totalAmount: "", subsidyRequestAmount: "" });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({ businessPlan: null, financialStatements: null, quotations: null });
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRefs: { [K in keyof UploadedFiles]: React.RefObject<HTMLInputElement> } = { businessPlan: useRef<HTMLInputElement>(null), financialStatements: useRef<HTMLInputElement>(null), quotations: useRef<HTMLInputElement>(null) };

  useEffect(() => {
    const subsidyId = searchParams.get("subsidyId");
    const applicationId = searchParams.get("id");
    const loadData = async () => {
        setIsLoading(true);
        await new Promise(res => setTimeout(res, 500));
        if (applicationId) {
            const loadedSubsidy = dummySubsidyData["1"];
            setSubsidy(loadedSubsidy);
            setFormData(dummyApplicationData.formData);
            setTasks(dummyApplicationData.tasks);
            setUploadedFiles(dummyApplicationData.uploadedFiles);
        } else if (subsidyId) {
            const loadedSubsidy = dummySubsidyData[subsidyId];
            if(loadedSubsidy) {
                setSubsidy(loadedSubsidy);
                setTasks([ { id: "t1", label: "基本情報の入力", completed: false, relatedField: 'companyName' }, { id: "t2", label: "事業計画の入力", completed: false, relatedField: 'businessTitle' }, { id: "t3", label: "資金計画の入力", completed: false, relatedField: 'totalAmount' }, { id: "t4", label: "事業計画書の添付", completed: false, relatedField: 'businessPlan' }, { id: "t5", label: "見積書の添付", completed: false, relatedField: 'quotations' } ]);
            }
        } else {
            const defaultSubsidy = dummySubsidyData["1"];
            setSubsidy(defaultSubsidy);
            setFormData(dummyApplicationData.formData);
            setTasks(dummyApplicationData.tasks);
            setUploadedFiles(dummyApplicationData.uploadedFiles);
        }
        setIsLoading(false);
    };
    loadData();
  }, [searchParams]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const taskToComplete = tasks.find(t => t.relatedField === name);
    if (taskToComplete && value.trim() !== '' && !taskToComplete.completed) {
        handleTaskToggle(taskToComplete.id, true);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>, fileType: keyof UploadedFiles) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles((prev) => ({ ...prev, [fileType]: file }));
      const taskToComplete = tasks.find(t => t.relatedField === fileType);
      if (taskToComplete && !taskToComplete.completed) {
          handleTaskToggle(taskToComplete.id, true);
      }
    }
  };
  
  // ▼▼▼ 修正箇所: ファイル削除ハンドラを追加 ▼▼▼
  const handleFileDelete = (fileType: keyof UploadedFiles) => {
    setUploadedFiles((prev) => ({ ...prev, [fileType]: null }));
    if (fileInputRefs[fileType]?.current) {
        fileInputRefs[fileType]!.current!.value = "";
    }
    const taskToUncomplete = tasks.find(t => t.relatedField === fileType);
    if (taskToUncomplete && taskToUncomplete.completed) {
        handleTaskToggle(taskToUncomplete.id, false);
    }
  };
  
  const handleTaskToggle = (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(task => 
        task.id === taskId ? {...task, completed} : task
    ));
  };
  // ▲▲▲ 修正箇所 ▲▲▲

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("申請内容を提出しました。（シミュレーション）");
  };

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  if (isLoading) {
      return <div className="text-center py-20">申請情報を読み込んでいます...</div>;
  }
  if (!subsidy) {
      return (
          <div className="text-center py-20">
              <h2 className="text-xl text-foreground-700">補助金情報が見つかりません。</h2>
              <p className="text-foreground-500 mt-2">まず、申請する補助金を検索してください。</p>
              <Link href="/subsidies/search" className="mt-6 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg">補助金検索ページへ</Link>
          </div>
      );
  }

  return (
    <div className="space-y-8">
        <header>
            <Link href="/dashboard" className="text-sm text-foreground-500 hover:text-foreground-800 mb-2 inline-block">← ダッシュボードに戻る</Link>
            <h1 className="text-3xl font-bold text-foreground">申請書類作成</h1>
            <p className="mt-1 text-lg text-primary">{subsidy.name}</p>
        </header>

        <Card>
            <CardHeader><h2 className="text-xl font-semibold">申請進捗</h2></CardHeader>
            <CardBody>
                <div className="flex justify-between mb-2"><span className="text-sm font-medium text-foreground-700">タスク完了度</span><span className="text-sm font-medium text-primary">{progress}%</span></div>
                <div className="w-full bg-default-200 rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                <div className="mt-6"><h3 className="text-md font-semibold mb-3">残りのタスク</h3><ul className="space-y-2">{tasks.filter(t => !t.completed).map(task => (<li key={task.id} className="text-sm text-foreground-600">・ {task.label}</li>))}{tasks.every(t => t.completed) && <li className="text-sm text-success-600">すべてのタスクが完了しました！</li>}</ul></div>
            </CardBody>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
                <CardHeader><h2 className="text-xl font-semibold">申請内容</h2></CardHeader>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 font-semibold text-foreground-700 border-b pb-2 mb-2">基本情報</div>
                    <Input label="会社名" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
                    <Input label="代表者名" name="representativeName" value={formData.representativeName} onChange={handleInputChange} required />
                    <Input label="郵便番号" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required />
                    <Input className="md:col-span-2" label="住所" name="address" value={formData.address} onChange={handleInputChange} required />
                    <div className="md:col-span-2 font-semibold text-foreground-700 border-b pb-2 mb-2 mt-4">事業計画</div>
                    <Input className="md:col-span-2" label="事業計画タイトル" name="businessTitle" value={formData.businessTitle} onChange={handleInputChange} required />
                    <Textarea className="md:col-span-2" label="事業概要" name="businessSummary" value={formData.businessSummary} onChange={handleInputChange} rows={4} required />
                    <div className="md:col-span-2 font-semibold text-foreground-700 border-b pb-2 mb-2 mt-4">資金計画</div>
                    <Input label="事業の総額（円）" name="totalAmount" type="number" value={formData.totalAmount} onChange={handleInputChange} required />
                    <Input label="補助金申請額（円）" name="subsidyRequestAmount" type="number" value={formData.subsidyRequestAmount} onChange={handleInputChange} required />
                </CardBody>
            </Card>

            <Card>
                <CardHeader><h2 className="text-xl font-semibold">添付書類</h2></CardHeader>
                <CardBody className="space-y-4">
                    {/* ▼▼▼ 修正箇所: FileUploadにrefと削除ハンドラを渡す ▼▼▼ */}
                    <FileUpload name="businessPlan" label="事業計画書" file={uploadedFiles.businessPlan} onChange={handleFileUpload} onDelete={handleFileDelete} ref={fileInputRefs.businessPlan} />
                    <FileUpload name="quotations" label="見積書" file={uploadedFiles.quotations} onChange={handleFileUpload} onDelete={handleFileDelete} ref={fileInputRefs.quotations}/>
                    <FileUpload name="financialStatements" label="決算書（直近2期分）" file={uploadedFiles.financialStatements} onChange={handleFileUpload} onDelete={handleFileDelete} ref={fileInputRefs.financialStatements}/>
                    {/* ▲▲▲ 修正箇所 ▲▲▲ */}
                </CardBody>
            </Card>

            <div className="flex justify-end gap-4"><Button type="button" color="default">一時保存</Button><Button type="submit" color="primary" disabled={progress < 100} title={progress < 100 ? "すべてのタスクを完了してください" : ""}>申請を提出する</Button></div>
        </form>
    </div>
  );
};

// --- ヘルパーコンポーネント ---
const Input: React.FC<any> = ({ label, name, value, onChange, type = "text", required, className }) => (<div className={className}><label className="block text-sm font-medium text-foreground-700 mb-1">{label} {required && <span className="text-danger">*</span>}</label><input type={type} name={name} value={value} onChange={onChange} required={required} className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1" /></div>);
const Textarea: React.FC<any> = ({ label, name, value, onChange, rows = 3, required, className }) => (<div className={className}><label className="block text-sm font-medium text-foreground-700 mb-1">{label} {required && <span className="text-danger">*</span>}</label><textarea name={name} value={value} onChange={onChange} required={required} rows={rows} className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1" /></div>);

// ▼▼▼ 修正箇所: FileUploadコンポーネントのUIを改善 ▼▼▼
const FileUpload = React.forwardRef<HTMLInputElement, { name: keyof UploadedFiles; label: string; file: File | null; onChange: (e: ChangeEvent<HTMLInputElement>, name: keyof UploadedFiles) => void; onDelete: (name: keyof UploadedFiles) => void; }>
(({ name, label, file, onChange, onDelete }, ref) => {
    const getFileName = (file: File | null): string => file ? (file.name.length > 30 ? `${file.name.substring(0, 27)}...` : file.name) : "";
    const getFileSize = (file: File | null): string => file ? `(${(file.size / 1024).toFixed(1)}KB)` : "";

    return (
        <div>
            <label className="block text-sm font-medium text-foreground-700">{label} <span className="text-danger">*</span></label>
            <div className="mt-1">
                {file ? (
                    <div className="flex items-center justify-between p-3 border border-default-300 rounded-lg bg-content2">
                        <div className="flex items-center overflow-hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-foreground-800 truncate" title={file.name}>{getFileName(file)}</p>
                                <p className="text-xs text-foreground-500">{getFileSize(file)}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => onDelete(name)} className="text-foreground-400 hover:text-danger-500 ml-4 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-default-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-foreground-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <div className="flex text-sm text-foreground-600">
                                <label htmlFor={String(name)} className="relative cursor-pointer bg-background rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                    <span>ファイルをアップロード</span>
                                    <input ref={ref} id={String(name)} name={String(name)} type="file" className="sr-only" onChange={(e) => onChange(e, name)} />
                                </label>
                                <p className="pl-1">またはドラッグ＆ドロップ</p>
                            </div>
                            <p className="text-xs text-foreground-500">PDF, PNG, JPG, DOCX, XLSX など</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
FileUpload.displayName = "FileUpload";
// ▲▲▲ 修正箇所 ▲▲▲

export default DocumentCreatePage;