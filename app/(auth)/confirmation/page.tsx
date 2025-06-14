// app/(auth)/confirmation/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function ConfirmationPage() {
  const router = useRouter();

  const handleGoLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg border border-blue-100">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">メール確認が完了しました！</h2>
            <p className="text-gray-600">アカウントの設定が完了しました。ログインページからサービスをご利用いただけます。</p>
          </div>

          <button
            onClick={handleGoLogin}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            ログインページへ
          </button>

          <p className="text-sm text-gray-500">
            ご不明な点がございましたら、サポートまでお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
