// File: /app/(auth)/password-reset/page.tsx
"use client"; // フォーム操作などクライアント側の処理があるため

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
// import { Input } from "@heroui/input"; // HeroUIのコンポーネントを使用する場合
// import { Button } from "@heroui/button";
import { AppLogo } from '@/components/common/AppLogo'; // 作成したAppLogoコンポーネント

// 仮のUIコンポーネント (HeroUIの実際のコンポーネントに置き換えてください)
const Input: React.FC<any> = ({ label, name, value, onChange, type = "text", placeholder, required, disabled, className }) => (
    <div className={className}>
        <label htmlFor={name} className="block text-sm font-medium text-foreground-700 mb-1">{label} {required && <span className="text-danger">*</span>}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} disabled={disabled}
               className="w-full border border-default-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-content1 disabled:bg-default-100" />
    </div>
);
const Button: React.FC<any> = ({ children, onClick, type = "button", color = "default", isLoading, disabled, fullWidth, className }) => {
    const colorClasses = color === "primary" ? "bg-primary text-primary-foreground hover:bg-primary-focus" : "bg-default-200 text-default-800 hover:bg-default-300";
    return <button type={type} onClick={onClick} disabled={isLoading || disabled}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${colorClasses} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        {isLoading ? "処理中..." : children}
    </button>
};


export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    if (!email) {
      setError("メールアドレスを入力してください。");
      setIsLoading(false);
      return;
    }

    try {
      // ここでパスワードリセットAPIを呼び出す (現在はダミー)
      console.log('Password reset requested for:', email);
      await new Promise(resolve => setTimeout(resolve, 1000)); // APIコールをシミュレート
      setMessage('パスワードリセット用のメールを送信しました。メールボックスをご確認ください。');
      setEmail(''); // 送信後に入力欄をクリア
    } catch (err) {
      setError('パスワードリセットメールの送信に失敗しました。もう一度お試しください。');
    } finally {
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
                パスワードリセット
            </h1>
            <p className="mt-2 text-center text-sm text-foreground-500">
                登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </p>
        </div>

        {message && <div className="p-3 bg-success-50 text-success-700 rounded-md text-sm">{message}</div>}
        {error && <div className="p-3 bg-danger-50 text-danger-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            label="メールアドレス"
            name="email" // name属性を追加
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} // onChangeを修正
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
          <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
            リセットメールを送信
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-foreground-500">
          <Link href="/login" className="font-medium text-primary hover:text-primary-focus">
            ログインページに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
