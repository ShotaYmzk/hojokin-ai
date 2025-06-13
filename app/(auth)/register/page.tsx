// File: /app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@heroui/react";

import { routes } from "@/config/routes";
import { api } from "@/lib/api"; // APIクライアントをインポート

export default function Page() {
  const router = useRouter();

  // フォームの入力値を管理するためのState
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");

  // エラーメッセージとローディング状態を管理するState
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 以前作成したAPIクライアントのメソッドを呼び出す
      // これにより内部的に /api/auth/register へのfetchリクエストが送られる
      await api.auth.register({
        registerRequest: {
          email,
          password,
          // RegisterRequestの型を更新していないため、anyでキャスト
          // 本来はopenapi.yamlを更新し、型を再生成するのが望ましい
          companyName: companyName as any,
          companyAddress: companyAddress as any,
        },
      });

      // 成功したらログインページにリダイレクト
      // TODO: 「登録ありがとうございます」のようなメッセージをToastなどで表示するとより親切
      router.push(routes.auth.login + "?registered=true");

    } catch (e: any) {
      // APIから返されたエラーメッセージを取得して表示
      const errorData = await e.response?.json();
      setError(errorData?.error || "不明なエラーが発生しました。");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">アカウント登録</h1>
        <p className="text-sm text-muted-foreground">
          会社情報を入力して登録してください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="companyName"
          label="会社名"
          placeholder="株式会社〇〇"
          value={companyName}
          onValueChange={setCompanyName}
          isRequired
        />
        <Input
          name="companyAddress"
          label="会社の所在地（任意）"
          placeholder="東京都千代田区〇〇"
          value={companyAddress}
          onValueChange={setCompanyAddress}
        />
        <Input
          name="email"
          type="email"
          label="メールアドレス"
          placeholder="email@example.com"
          value={email}
          onValueChange={setEmail}
          isRequired
        />
        <Input
          name="password"
          type="password"
          label="パスワード"
          placeholder="••••••••"
          value={password}
          onValueChange={setPassword}
          isRequired
        />

        {error && (
          <p className="text-sm text-center text-red-500">{error}</p>
        )}

        <Button type="submit" color="primary" className="w-full" disabled={isLoading}>
          {isLoading ? "登録中..." : "同意して登録"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        アカウントをお持ちですか？{" "}
        <Link href={routes.auth.login} className="underline">
          ログインはこちら
        </Link>
      </p>
    </div>
  );
}