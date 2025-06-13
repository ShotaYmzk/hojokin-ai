// File: /app/(auth)/login/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";

import { AppLogo } from "@/components/common/AppLogo";

// 仮のAlertコンポーネント
const Alert: React.FC<{
  color: "danger" | "success";
  children: React.ReactNode;
  className?: string;
}> = ({ color, children, className }) => {
  const baseClasses = "p-4 rounded-md text-sm";
  const colorClasses =
    color === "danger"
      ? "bg-danger-50 text-danger-700 border border-danger-200"
      : "bg-success-50 text-success-700 border border-success-200";

  return (
    <div className={`${baseClasses} ${colorClasses} ${className}`}>
      {children}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      // 実際のAPIコール
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ログインに失敗しました。');
      }

      // ログイン成功時の処理
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // ダッシュボードにリダイレクト
      router.push('/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'ログイン中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-background shadow-2xl rounded-xl">
        <div className="flex flex-col items-center">
          <Link className="mb-6" href="/">
            <AppLogo className="text-primary" size={48} />
          </Link>
          <h1 className="text-3xl font-bold text-center text-foreground">
            ログイン
          </h1>
          <p className="mt-2 text-center text-sm text-foreground-500">
            アカウント情報を入力してください。
          </p>
        </div>

        {error && (
          <Alert className="mt-4" color="danger">
            {error}
          </Alert>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              isRequired
              disabled={isLoading}
              label="メールアドレス"
              labelPlacement="outside"
              placeholder="your@email.com"
              type="email"
              value={email}
              onValueChange={setEmail}
            />
          </div>

          <div>
            <Input
              isRequired
              disabled={isLoading}
              label="パスワード"
              labelPlacement="outside"
              placeholder="••••••••"
              type="password"
              value={password}
              onValueChange={setPassword}
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              className="text-sm font-medium text-primary hover:text-primary-focus"
              href="/password-reset"
            >
              パスワードをお忘れですか？
            </Link>
          </div>

          <Button
            fullWidth
            className="font-semibold"
            color="primary"
            isLoading={isLoading}
            size="lg"
            type="submit"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground-500">
          アカウントをお持ちでないですか？{" "}
          <Link
            className="font-medium text-primary hover:text-primary-focus"
            href="/register"
          >
            新規登録はこちら
          </Link>
        </p>
      </div>
    </div>
  );
}