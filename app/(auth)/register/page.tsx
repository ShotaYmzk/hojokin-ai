// File: /app/(auth)/register/page.tsx
"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// import { Input } from "@heroui/input"; // HeroUIのコンポーネント
// import { Button } from "@heroui/button";
// import { Checkbox } from "@heroui/react"; // 利用規約同意用
import { AppLogo } from "@/components/common/AppLogo";

// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
const Input: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
}> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  className = "",
  autoComplete,
}) => (
  <div className={className}>
    <label
      className="block text-sm font-medium text-foreground-700 mb-1"
      htmlFor={name}
    >
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      autoComplete={autoComplete}
      className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 disabled:bg-default-100"
      disabled={disabled}
      id={name}
      name={name}
      placeholder={placeholder}
      required={required}
      type={type}
      value={value}
      onChange={onChange}
    />
  </div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  color?: "primary" | "default" | "danger" | "success";
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
}> = ({
  children,
  onClick,
  type = "button",
  color = "default",
  isLoading,
  disabled,
  fullWidth,
  className = "",
  variant,
}) => {
  // 簡単なカラースキーム (HeroUIの実際のクラスに合わせて調整)
  let colorClasses = "";

  switch (color) {
    case "primary":
      colorClasses =
        "bg-primary text-primary-foreground hover:bg-primary-focus";
      break;
    case "danger":
      colorClasses = "bg-danger text-danger-foreground hover:bg-danger-focus";
      break;
    default:
      colorClasses = "bg-default-200 text-default-800 hover:bg-default-300";
  }
  if (variant === "bordered") {
    colorClasses = `border border-default-300 text-foreground hover:bg-default-100 ${color === "primary" ? "border-primary text-primary hover:bg-primary-50" : ""}`;
  }

  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors ${colorClasses} ${fullWidth ? "w-full" : ""} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={isLoading || disabled}
      type={type}
      onClick={onClick}
    >
      {isLoading ? "処理中..." : children}
    </button>
  );
};

const Checkbox: React.FC<{
  label: React.ReactNode; // ラベルにReactNodeを許可
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string;
}> = ({
  label,
  name,
  checked,
  onChange,
  required,
  disabled,
  className = "",
  value,
}) => (
  <label
    className={`flex items-center space-x-2 cursor-pointer ${className} ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
  >
    <input
      checked={checked}
      className="form-checkbox h-4 w-4 text-primary rounded border-default-300 focus:ring-primary disabled:bg-default-200"
      disabled={disabled}
      name={name}
      required={required}
      type="checkbox"
      value={value}
      onChange={onChange}
    />
    <span className="text-sm text-foreground-700">{label}</span>
  </label>
);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // バリデーション
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("すべての必須項目を入力してください。");
      setIsLoading(false);

      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("パスワードと確認用パスワードが一致しません。");
      setIsLoading(false);

      return;
    }
    if (formData.password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      setIsLoading(false);

      return;
    }
    if (!formData.agreedToTerms) {
      setError("利用規約とプライバシーポリシーへの同意が必要です。");
      setIsLoading(false);

      return;
    }

    try {
      // ここで新規登録APIを呼び出す (現在はダミー)
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: formData.name,
      //     email: formData.email,
      //     password: formData.password,
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || '新規登録に失敗しました。');
      // }

      // const newUser = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1500)); // APIコールをシミュレート

      // 登録成功後、ログインページにリダイレクトするか、自動ログイン処理を行う
      // ここではログインページにメッセージ付きでリダイレクトする例
      router.push("/login?registered=true"); // registered=true はログインページでメッセージ表示に利用可能
    } catch (err: any) {
      setError(err.message || "新規登録中にエラーが発生しました。");
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
            新規アカウント登録
          </h1>
          <p className="mt-2 text-center text-sm text-foreground-500">
            新しいアカウントを作成しましょう。
          </p>
        </div>

        {error && (
          <div
            className="p-3 bg-danger-50 text-danger-700 rounded-md text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form noValidate className="space-y-4" onSubmit={handleSubmit}>
          <Input
            required
            autoComplete="name"
            disabled={isLoading}
            label="お名前"
            name="name"
            placeholder="山田 太郎"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            required
            autoComplete="email"
            disabled={isLoading}
            label="メールアドレス"
            name="email"
            placeholder="your@email.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            required
            autoComplete="new-password"
            disabled={isLoading}
            label="パスワード (8文字以上)"
            name="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            required
            autoComplete="new-password"
            disabled={isLoading}
            label="パスワード (確認用)"
            name="confirmPassword"
            placeholder="••••••••"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <Checkbox
            required
            checked={formData.agreedToTerms}
            disabled={isLoading}
            label={
              <>
                <Link
                  className="font-medium text-primary hover:underline"
                  href="/terms"
                  target="_blank"
                >
                  利用規約
                </Link>
                と
                <Link
                  className="font-medium text-primary hover:underline"
                  href="/privacy"
                  target="_blank"
                >
                  プライバシーポリシー
                </Link>
                に同意します。
              </>
            }
            name="agreedToTerms"
            onChange={handleChange}
          />

          <Button
            fullWidth
            className="font-semibold !mt-6" // 上のマージンを調整
            color="primary"
            isLoading={isLoading}
            type="submit"
          >
            {isLoading ? "登録処理中..." : "登録する"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground-500">
          すでにアカウントをお持ちですか？{" "}
          <Link
            className="font-medium text-primary hover:text-primary-focus"
            href="/login"
          >
            ログインはこちら
          </Link>
        </p>
      </div>
    </div>
  );
}
