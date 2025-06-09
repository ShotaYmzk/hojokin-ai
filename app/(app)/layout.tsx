// File: /app/(app)/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/config/site";
import { AppLogo } from "@/components/common/AppLogo";
import { ThemeSwitch } from "@/components/common/ThemeSwitch";
// import { Button } from "@heroui/button";
// import { Avatar } from "@heroui/avatar"; // ユーザーアバター用

// 仮のアイコンコンポーネント
const IconPlaceholder = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className={`bg-gray-300 rounded ${className}`} />
);

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode; // アイコン用のプロパティを追加
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // モバイルではデフォルトで閉じる、PCではCSSで制御
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );

  useEffect(() => {
    // 実際のアプリケーションでは認証状態をチェックし、未認証ならログインページへリダイレクト
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = localStorage.getItem("user");

    if (!loggedIn) {
      router.push("/login");
    } else if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // localStorage.removeItem('isLoggedIn');
        // localStorage.removeItem('user');
        // router.push('/login');
      }
    }
  }, [router]);

  const appNavItems: NavItem[] = [
    // siteConfigからナビゲーション項目を取得またはここで定義
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
    // { label: "設定", href: "/settings", icon: <IconPlaceholder /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  if (!user) {
    // ユーザー情報が読み込まれるまでローディング表示など
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">読み込み中...</p>
        {/* ここにスピナーコンポーネントを配置 */}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* サイドバー */}
      <aside
        className={`bg-content1 border-r border-divider transition-transform duration-300 ease-in-out fixed md:static md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 p-4 flex flex-col h-full z-20`}
      >
        {/* サイドバーの内容は常にレンダリングし、表示/非表示はCSSのtransformで制御 */}
        <>
          <div className="flex items-center justify-between mb-8">
            <Link className="flex items-center gap-2" href="/dashboard">
              <AppLogo className="text-primary" size={32} />
              <span className="font-bold text-xl text-foreground">
                {siteConfig.name.split(" ")[0]}
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
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground-800">
                  {user?.name || "ユーザー名"}
                </p>
                <p className="text-xs text-foreground-500">
                  {user?.email || "user@example.com"}
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
        </>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
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
