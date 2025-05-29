// File: /app/(auth)/layout.tsx
import React from 'react';
import { AppLogo } from '@/components/common/AppLogo'; // ロゴを共通で表示する場合など
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* 認証ページ群に共通のヘッダーや要素をここに配置できます */}
      {/* 例えば、画面上部に常にロゴを表示するなど */}
      {/* <header className="absolute top-8 left-8">
        <Link href="/">
          <AppLogo size={40} className="text-white" />
        </Link>
      </header> */}
      <main className="w-full">
        {children} {/* ここに page.tsx の内容がレンダリングされます */}
      </main>
      {/* 認証ページ群に共通のフッターなど */}
      {/* <footer className="absolute bottom-4 text-center w-full text-xs text-gray-400">
        © {new Date().getFullYear()} Your Company Name
      </footer> */}
    </div>
  );
}