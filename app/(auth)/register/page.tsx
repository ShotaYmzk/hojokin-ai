// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@heroui/react";

import { routes } from "@/config/routes";
import { AppLogo } from "@/components/common/AppLogo";

// AlertComponent
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

export default function Page() {
  const router = useRouter();

  // フォームの入力値を管理するためのState
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // エラーメッセージとローディング状態を管理するState
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      console.log("Sending registration request:", {
        email,
        companyName,
        representativeName,
        hasPassword: !!password,
        hasCompanyAddress: !!companyAddress,
      }); // デバッグ用

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          companyName,
          representativeName,
          companyAddress,
        }),
      });

      const data = await response.json();

      console.log("Registration response:", data); // デバッグ用

      if (!response.ok) {
        // サーバーからの詳細なエラーメッセージを表示
        const errorMessage = data.error || "登録に失敗しました";
        const errorDetails = data.details ? ` (詳細: ${data.details})` : "";

        throw new Error(errorMessage + errorDetails);
      }

      // 成功した場合
      setSuccess(data.message || "登録が完了しました！");

      // メール確認が必要な場合の案内
      if (data.emailConfirmationRequired) {
        setSuccess(
          (prev) =>
            `${prev} 確認メールをお送りしましたので、メールボックスをご確認ください。`,
        );
      }

      // 2秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push(routes.auth.login + "?registered=true");
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "不明なエラーが発生しました。");
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
            アカウント登録
          </h1>
          <p className="mt-2 text-center text-sm text-foreground-500">
            会社情報を入力して登録してください
          </p>
        </div>

        {error && <Alert color="danger">{error}</Alert>}

        {success && <Alert color="success">{success}</Alert>}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            isRequired
            disabled={isLoading}
            label="会社名"
            name="companyName"
            placeholder="株式会社〇〇"
            value={companyName}
            onValueChange={setCompanyName}
          />
          <Input
            disabled={isLoading}
            label="代表者名"
            name="representativeName"
            placeholder="山田 太郎"
            value={representativeName}
            onValueChange={setRepresentativeName}
          />
          <Input
            disabled={isLoading}
            label="会社の所在地（任意）"
            name="companyAddress"
            placeholder="東京都千代田区〇〇1-1-1"
            value={companyAddress}
            onValueChange={setCompanyAddress}
          />
          <Input
            isRequired
            disabled={isLoading}
            label="メールアドレス"
            name="email"
            placeholder="email@example.com"
            type="email"
            value={email}
            onValueChange={setEmail}
          />
          <Input
            isRequired
            description="6文字以上で入力してください"
            disabled={isLoading}
            label="パスワード"
            name="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onValueChange={setPassword}
          />

          <Button
            className="w-full"
            color="primary"
            disabled={isLoading}
            isLoading={isLoading}
            type="submit"
          >
            {isLoading ? "登録中..." : "同意して登録"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          アカウントをお持ちですか？{" "}
          <Link className="underline" href={routes.auth.login}>
            ログインはこちら
          </Link>
        </p>
      </div>
    </div>
  );
}
