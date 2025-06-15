// File: /app/(app)/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { AppLogo } from "@/components/common/AppLogo";
import { ThemeSwitch } from "@/components/common/ThemeSwitch";
import { authHelpers, User } from "@/lib/auth-helpers";

// 仮のアイコンコンポーネント
const IconPlaceholder = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className={`bg-gray-300 rounded ${className}`} />
);

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 認証状態をチェック
    const checkAuth = () => {
      const isLoggedIn = authHelpers.isLoggedIn();
      const currentUser = authHelpers.getUser();

      if (!isLoggedIn || !currentUser) {
        // 未認証の場合はログインページにリダイレクト
        router.push("/login");

        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const appNavItems: NavItem[] = [
    { label: "ダッシュボード", href: "/dashboard", icon: <IconPlaceholder /> },
    { label: "企業情報", href: "/company", icon: <IconPlaceholder /> },
    {
      label: "補助金検索",
      href: "/subsidies/search",
      icon: <IconPlaceholder />,
    },
    {
      label: "AIマッチング",
      href: "/subsidies/matching-chat",
      icon: <IconPlaceholder />,
    },
    { label: "書類作成", href: "/documents/create", icon: <IconPlaceholder /> },
  ];

  const handleLogout = () => {
    authHelpers.logout();
    router.push("/login");
  };

  // 認証状態の確認中はローディング表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-foreground">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  // ユーザー情報がない場合は何も表示しない (リダイレクト中)
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* サイドバー */}
      <aside
        className={`bg-content1 border-r border-divider transition-transform duration-300 ease-in-out fixed md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 p-4 flex flex-col h-full z-20`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link className="flex items-center gap-2" href="/dashboard">
            <AppLogo className="text-primary" size={32} />
            <span className="font-bold text-xl text-foreground">
              {siteConfig.name}
            </span>
          </Link>
          <button
            className="md:hidden text-foreground-500 hover:text-foreground-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <nav className="flex-grow">
          <ul>
            {appNavItems.map((item) => (
              <li key={item.href} className="mb-2">
                <Link
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-foreground-600 hover:bg-default-100 hover:text-foreground-800"
                    }`}
                  href={item.href}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto">
          <div className="mb-4 flex justify-start">
            <ThemeSwitch />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-default-100 mb-4">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-semibold">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-800">
                {user.name || "ユーザー名"}
              </p>
              <p className="text-xs text-foreground-500">
                {user.email || "user@example.com"}
              </p>
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-danger-600 hover:bg-danger-50 hover:text-danger-700 transition-colors border border-danger-300"
            onClick={handleLogout}
          >
            <IconPlaceholder className="w-5 h-5" />
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* モバイル用のハンバーガーメニューボタン */}
        <div className="md:hidden flex items-center justify-between p-4 bg-content1 border-b border-divider">
          <button
            className="text-foreground-500 hover:text-foreground-700"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="text-2xl">☰</span>
          </button>
          <AppLogo className="text-primary" size={24} />
          <div className="w-8" /> {/* スペーサー */}
        </div>

        {isSidebarOpen && (
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-black/30 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-6 bg-default-50">
          {children}
        </main>
      </div>
    </div>
  );
}
