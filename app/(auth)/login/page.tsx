// File: /app/(auth)/login/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation"; // next/navigationからインポート
import { Input } from "@heroui/input"; // HeroUIのInputを使用
import { Button } from "@heroui/button"; // HeroUIのButtonを使用
import Link from "next/link"; // Next.jsのLinkコンポーネント
import { AppLogo } from "@/components/common/AppLogo"; // 作成したAppLogoコンポーネント
// import { Alert } from "@heroui/react"; // エラー表示用にAlertコンポーネントがあれば (なければ自作)
// import { MailIcon, LockClosedIcon } from "@heroicons/react/24/outline"; // Heroiconsなどからアイコンをインポートする場合

// 仮のAlertコンポーネント (HeroUIにAlertがなければ)
const Alert: React.FC<{ color: "danger" | "success"; children: React.ReactNode; className?: string }> = ({ color, children, className }) => {
  const baseClasses = "p-4 rounded-md text-sm";
  const colorClasses = color === "danger" ? "bg-danger-50 text-danger-700 border border-danger-200" : "bg-success-50 text-success-700 border border-success-200";
  return <div className={`${baseClasses} ${colorClasses} ${className}`}>{children}</div>;
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

    // バリデーション (簡易)
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      setIsLoading(false);
      return;
    }

    // ★デバッグ用ログイン
    if (email === "debuguser@example.com" && password === "password123") {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        name: "デバッグ ユーザー",
        email: "debuguser@example.com",
        // 他に必要なユーザー情報があれば追加
      }));
      // ログイン成功後、1秒待ってからダッシュボードに遷移 (ローディング表示の確認用)
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      return; // 通常のAPIコールは行わない
    }

    // 実際のAPIコール (バックエンドが実装されたらこちらを有効化)
    try {
      // const response = await fetch('/api/auth/login', { // 実際のAPIエンドポイント
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'ログインに失敗しました。');
      // }

      // const data = await response.json();
      // localStorage.setItem('isLoggedIn', 'true');
      // localStorage.setItem('authToken', data.token); // トークンを保存
      // localStorage.setItem('user', JSON.stringify(data.user)); // ユーザー情報を保存

      // setTimeout(() => {
      //   router.push('/dashboard');
      // }, 500);
      setError("通常のログイン処理は未実装です。デバッグユーザーでログインしてください。");
      setIsLoading(false);

    } catch (err: any) {
      setError(err.message || "ログイン中にエラーが発生しました。");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-background shadow-2xl rounded-xl">
        <div className="flex flex-col items-center">
          <Link href="/" className="mb-6">
            <AppLogo size={48} className="text-primary" />
          </Link>
          <h1 className="text-3xl font-bold text-center text-foreground">
            ログイン
          </h1>
          <p className="mt-2 text-center text-sm text-foreground-500">
            アカウント情報を入力してください。
          </p>
        </div>

        {error && (
          <Alert color="danger" className="mt-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="email"
              label="メールアドレス"
              labelPlacement="outside"
              placeholder="your@email.com"
              value={email}
              onValueChange={setEmail} // HeroUIのInputはonValueChangeを使用
              disabled={isLoading}
              isRequired
              // startContent={
              //   <MailIcon className="w-5 h-5 text-default-400 pointer-events-none flex-shrink-0" />
              // }
              classNames={{
                label: "text-foreground-700",
                inputWrapper: "bg-content2",
              }}
            />
          </div>

          <div>
            <Input
              type="password"
              label="パスワード"
              labelPlacement="outside"
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              disabled={isLoading}
              isRequired
              // startContent={
              //   <LockClosedIcon className="w-5 h-5 text-default-400 pointer-events-none flex-shrink-0" />
              // }
              classNames={{
                label: "text-foreground-700",
                inputWrapper: "bg-content2",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* <div className="flex items-center">
              <Checkbox size="sm" classNames={{label: "text-sm text-foreground-500"}}>
                ログイン状態を保持する
              </Checkbox>
            </div> */}
            <Link
              href="/password-reset" // パスワードリセットページへのリンク
              className="text-sm font-medium text-primary hover:text-primary-focus"
            >
              パスワードをお忘れですか？
            </Link>
          </div>

          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            fullWidth
            size="lg"
            className="font-semibold"
          >
            {isLoading ? "ログイン処理中..." : "ログイン"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground-500">
          アカウントをお持ちでないですか？{" "}
          <Link
            href="/register" // 新規登録ページへのリンク
            className="font-medium text-primary hover:text-primary-focus"
          >
            新規登録はこちら
          </Link>
        </p>
      </div>
      <div className="mt-6 text-center text-xs text-gray-400">
        <p>デバッグ用アカウント:</p>
        <p>Email: debuguser@example.com / Pass: password123</p>
      </div>
    </div>
  );
}
