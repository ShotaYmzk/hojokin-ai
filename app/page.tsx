// File: /app/page.tsx
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full">
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className={title({ size: "lg", class: "leading-tight" })}>
              <span className={title({ color: "violet", class: "text-10xl" })}>AI</span>があなたの
              <span className="whitespace-nowrap">補助金・助成金申請を徹底サポート</span>
            </h1>
            <p className={subtitle({ class: "mt-6 max-w-2xl mx-auto" })}>
              複雑な補助金制度の検索から、面倒な申請書類のドラフト作成まで。
              <br className="hidden md:block" />
              中小企業の皆様の時間を節約し、事業成長を加速します。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "shadow",
                size: "lg",
                class: "w-full sm:w-auto",
              })}
              href="/register"
            >
              無料で始める
            </Link>
            <Link
              className={buttonStyles({
                variant: "bordered",
                radius: "full",
                size: "lg",
                class: "w-full sm:w-auto",
              })}
              href="/login"
            >
              ログイン
            </Link>
          </div>
        </div>

        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className={title({ size: "md", class: "mb-8 text-center" })}>
            主な機能
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <div className="p-6 border border-default-200 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">簡単検索</h3>
              <p className="text-default-600">
                キーワードや業種、地域から最適な補助金・助成金を素早く見つけられます。
              </p>
            </div>
            <div className="p-6 border border-default-200 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">AI書類作成支援</h3>
              <p className="text-default-600">
                企業情報を入力するだけで、AIが申請書類のドラフトを自動生成します。
              </p>
            </div>
            <div className="p-6 border border-default-200 rounded-xl hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">進捗管理</h3>
              <p className="text-default-600">
                申請状況や期限を一覧で管理。見逃しを防ぎ、スムーズな申請をサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
