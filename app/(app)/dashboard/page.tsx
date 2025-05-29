// File: /app/(app)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardBody } from "@heroui/card";
// import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
// import { Chip } from "@heroui/chip"; // ステータス表示用
// import { Progress } from "@heroui/progress";
import Link from 'next/link';

// 仮の型定義
interface Application {
  id: string;
  subsidyName: string;
  status: '準備中' | '申請済' | '審査中' | '採択' | '不採択';
  submissionDate: string | null;
  deadline: string;
  nextAction: string;
  progress: number; // 0-100
}

// 仮のデータ (実際にはAPIから取得)
const dummyApplications: Application[] = [
  { id: '1', subsidyName: 'IT導入補助金2025', status: '審査中', submissionDate: '2024-05-15', deadline: '2025-06-30', nextAction: '結果待ち', progress: 75 },
  { id: '2', subsidyName: '小規模事業者持続化補助金', status: '準備中', submissionDate: null, deadline: '2025-08-10', nextAction: '書類作成開始', progress: 20 },
  { id: '3', subsidyName: '事業再構築補助金', status: '採択', submissionDate: '2024-03-01', deadline: '2025-07-15', nextAction: '交付申請', progress: 100 },
  { id: '4', subsidyName: 'ものづくり補助金', status: '不採択', submissionDate: '2024-04-10', deadline: '2025-05-20', nextAction: '再申請検討', progress: 100 },
];

// 仮のCardコンポーネント
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => <div className={`bg-background shadow-md rounded-lg p-6 ${className}`}>{children}</div>;
const CardHeader: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => <div className={`border-b border-divider pb-4 mb-4 ${className}`}>{children}</div>;
const CardBody: React.FC<{children: React.ReactNode}> = ({children}) => <div>{children}</div>;

// 仮のChipコンポーネント
const Chip: React.FC<{children: React.ReactNode, color?: string, size?: string, className?: string}> = ({children, color = "default", size = "md", className}) => {
    const colors: Record<string, string> = {
        default: "bg-default-200 text-default-800",
        primary: "bg-primary-100 text-primary-800",
        success: "bg-success-100 text-success-800",
        warning: "bg-warning-100 text-warning-800",
        danger: "bg-danger-100 text-danger-800",
    };
    return <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${colors[color]} ${className}`}>{children}</span>
};


export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // APIから申請状況を取得する処理 (ダミー)
    const fetchApplications = async () => {
      setIsLoading(true);
      // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setApplications(dummyApplications);
      setIsLoading(false);
    };
    fetchApplications();
  }, []);

  const getStatusColor = (status: Application['status']): string => {
    switch (status) {
      case '準備中': return 'warning';
      case '申請済': return 'primary';
      case '審査中': return 'primary';
      case '採択': return 'success';
      case '不採択': return 'danger';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  const summary = {
    total: applications.length,
    inProgress: applications.filter(app => ['準備中', '申請済', '審査中'].includes(app.status)).length,
    approved: applications.filter(app => app.status === '採択').length,
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardBody>
                <h3 className="text-sm font-medium text-foreground-500">総申請数</h3>
                <p className="text-3xl font-semibold text-foreground-800 mt-1">{summary.total}</p>
            </CardBody>
        </Card>
        <Card>
            <CardBody>
                <h3 className="text-sm font-medium text-foreground-500">進行中</h3>
                <p className="text-3xl font-semibold text-primary mt-1">{summary.inProgress}</p>
            </CardBody>
        </Card>
        <Card>
            <CardBody>
                <h3 className="text-sm font-medium text-foreground-500">採択済み</h3>
                <p className="text-3xl font-semibold text-success mt-1">{summary.approved}</p>
            </CardBody>
        </Card>
      </div>

      {/* 申請状況一覧 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground-800">申請状況一覧</h2>
            <Link href="/subsidies/search">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-focus"> {/* HeroUI Button推奨 */}
                新しい補助金を探す
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {applications.length === 0 ? (
            <p className="text-foreground-500 py-4 text-center">現在申請中の補助金はありません。</p>
          ) : (
            <div className="overflow-x-auto">
              {/* HeroUIのTableコンポーネント推奨 */}
              <table className="min-w-full divide-y divide-divider">
                <thead className="bg-content2">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">補助金名</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">ステータス</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">申請/提出日</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">締切日</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">進捗</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">アクション</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-divider">
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground-900">{app.subsidyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip color={getStatusColor(app.status)}>{app.status}</Chip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-500">{app.submissionDate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-500">{app.deadline}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-500">
                        <div className="flex items-center">
                          <div className="w-20 bg-default-200 rounded-full h-1.5 mr-2">
                            <div className={`h-1.5 rounded-full ${app.progress === 100 && app.status === '採択' ? 'bg-success' : app.progress === 100 && app.status === '不採択' ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${app.progress}%`}}></div>
                          </div>
                          <span>{app.progress}%</span>
                        </div>
                        {/* <Progress value={app.progress} size="sm" color={getStatusColor(app.status) as any} className="max-w-[100px]" /> */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/documents/${app.id}/edit`} className="text-primary hover:text-primary-focus"> {/* 実際の書類編集ページへのパス */}
                          {app.nextAction}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 今後のタスクや通知エリア (オプション) */}
      {/* <Card>
        <CardHeader><h2 className="text-xl font-semibold text-foreground-800">今後のタスク</h2></CardHeader>
        <CardBody>
          <p className="text-foreground-500">近々対応が必要なタスクはありません。</p>
        </CardBody>
      </Card> */}
    </div>
  );
}
