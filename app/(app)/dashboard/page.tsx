// File: /app/(app)/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- 型定義の拡張 ---
interface Task {
  id: string;
  label: string;
  completed: boolean;
}

interface Application {
  id: string;
  subsidyName: string;
  status: "準備中" | "申請済" | "審査中" | "採択" | "不採択";
  submissionDate: string | null;
  deadline: string;
  tasks: Task[]; // タスクリストを追加
}

// --- ダミーデータの拡充 ---
const dummyApplications: Application[] = [
  {
    id: "1",
    subsidyName: "IT導入補助金2025",
    status: "審査中",
    submissionDate: "2024-05-15",
    deadline: "2025-06-30",
    tasks: [
      { id: "t1-1", label: "GビズIDプライム取得", completed: true },
      { id: "t1-2", label: "IT導入支援事業者の選定", completed: true },
      { id: "t1-3", label: "事業計画書の作成", completed: true },
      { id: "t1-4", label: "申請マイページから提出", completed: true },
    ],
  },
  {
    id: "2",
    subsidyName: "小規模事業者持続化補助金",
    status: "準備中",
    submissionDate: null,
    deadline: "2025-08-10",
    tasks: [
      { id: "t2-1", label: "商工会議所への相談", completed: true },
      { id: "t2-2", label: "経営計画書の作成", completed: false },
      { id: "t2-3", label: "補助事業計画書の作成", completed: false },
      { id: "t2-4", label: "電子申請", completed: false },
    ],
  },
  {
    id: "3",
    subsidyName: "事業再構築補助金",
    status: "採択",
    submissionDate: "2024-03-01",
    deadline: "2025-07-15",
    tasks: [
      { id: "t3-1", label: "認定支援機関との連携", completed: true },
      { id: "t3-2", label: "事業計画の策定・提出", completed: true },
      { id: "t3-3", label: "交付申請手続き", completed: false },
      { id: "t3-4", label: "実績報告", completed: false },
    ],
  },
];

// --- UIコンポーネント (仮) ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`bg-background shadow-md rounded-lg ${className}`}>
    {children}
  </div>
);
const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`border-b border-divider p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);
const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
const Chip: React.FC<{
  children: React.ReactNode;
  color?: string;
  className?: string;
}> = ({ children, color = "default", className }) => {
  const colors: Record<string, string> = {
    default: "bg-default-200 text-default-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-success-100 text-success-800",
    warning: "bg-warning-100 text-warning-800",
    danger: "bg-danger-100 text-danger-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
};

// --- ヘルパー関数 ---
const getDaysUntil = (deadline: string) => {
  const diff = new Date(deadline).getTime() - new Date().getTime();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
const getTaskProgress = (tasks: Task[]) => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter((t) => t.completed).length;

  return Math.round((completedTasks / tasks.length) * 100);
};
const getNextAction = (tasks: Task[]) => {
  return tasks.find((t) => !t.completed)?.label || "完了";
};

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      // APIコールをシミュレート
      await new Promise((resolve) => setTimeout(resolve, 500));
      setApplications(dummyApplications);
      setIsLoading(false);
    };

    fetchApplications();
  }, []);

  const handleTaskToggle = (appId: string, taskId: string) => {
    setApplications((prevApps) =>
      prevApps.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            tasks: app.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task,
            ),
          };
        }

        return app;
      }),
    );
  };

  const getStatusColor = (status: Application["status"]): string => {
    switch (status) {
      case "準備中":
        return "warning";
      case "申請済":
      case "審査中":
        return "primary";
      case "採択":
        return "success";
      case "不採択":
        return "danger";
      default:
        return "default";
    }
  };

  const upcomingDeadlines = applications
    .filter((app) => ["準備中", "審査中"].includes(app.status))
    .sort((a, b) => getDaysUntil(a.deadline) - getDaysUntil(b.deadline));

  if (isLoading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">ダッシュボード</h1>
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-focus transition-colors"
          onClick={() => router.push("/subsidies/search")}
        >
          新しい補助金を探す
        </button>
      </div>

      {/* 締切が近い申請 */}
      <section>
        <h2 className="text-xl font-semibold text-foreground-800 mb-4">
          締切が近い申請
        </h2>
        {upcomingDeadlines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingDeadlines.slice(0, 3).map((app) => {
              const daysLeft = getDaysUntil(app.deadline);

              return (
                <Card key={app.id} className="border-l-4 border-danger">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <Link
                        className="text-lg font-bold text-primary hover:underline"
                        href={`/documents/create?id=${app.id}`}
                      >
                        {app.subsidyName}
                      </Link>
                      <Chip color={daysLeft <= 7 ? "danger" : "warning"}>
                        残り{daysLeft}日
                      </Chip>
                    </div>
                    <p className="text-sm text-foreground-500 mt-1">
                      締切: {app.deadline}
                    </p>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-foreground-700">
                        次のタスク:
                      </p>
                      <p className="text-sm text-foreground-900">
                        {getNextAction(app.tasks)}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-foreground-500">
            現在、締切が近い申請はありません。
          </p>
        )}
      </section>

      {/* 申請状況とタスク一覧 */}
      <section>
        <h2 className="text-xl font-semibold text-foreground-800 mb-4">
          申請状況とタスク一覧
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-divider">
              <thead className="bg-content2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    補助金名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    タスク進捗
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-foreground-500 uppercase tracking-wider">
                    次のアクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-divider">
                {applications.map((app) => {
                  const progress = getTaskProgress(app.tasks);
                  const nextAction = getNextAction(app.tasks);

                  return (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          className="text-sm font-medium text-primary hover:underline"
                          href={`/documents/create?id=${app.id}`}
                        >
                          {app.subsidyName}
                        </Link>
                        <p className="text-xs text-foreground-500">
                          締切: {app.deadline}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip color={getStatusColor(app.status)}>
                          {app.status}
                        </Chip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-500">
                        <div className="flex items-center">
                          <div className="w-24 bg-default-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span>{progress}%</span>
                        </div>
                        <p className="text-xs mt-1">
                          {app.tasks.filter((t) => t.completed).length} /{" "}
                          {app.tasks.length} 件完了
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {app.status === "準備中" ? (
                          <div className="flex items-center">
                            <input
                              checked={false}
                              className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary mr-2"
                              id={`task-${app.id}`}
                              type="checkbox"
                              onChange={() => {
                                /* タスク完了処理 */
                              }}
                            />
                            <label htmlFor={`task-${app.id}`}>
                              {nextAction}
                            </label>
                          </div>
                        ) : (
                          <span>{nextAction}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
