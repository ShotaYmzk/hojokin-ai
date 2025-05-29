// File: /app/page.tsx
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives"; // primitives.ts があればそのまま利用
// import { AppLogo } from "@/components/common/AppLogo"; // ロゴコンポーネントを作成した場合

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10 text-center">
      {/* <AppLogo size={80} /> */}
      <div className="inline-block max-w-2xl justify-center">
        <h1 className={title({ size: "lg" })}>
          <span className={title({ color: "violet" })}>AI</span>があなたの
        </h1>
        <h1 className={title({ size: "lg" })}>
          補助金・助成金申請を徹底サポート
        </h1>
        <p className={subtitle({ class: "mt-6" })}>
          複雑な補助金制度の検索から、面倒な申請書類のドラフト作成まで。
          <br />
          中小企業の皆様の時間を節約し、事業成長を加速します。
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        <Link
          href="/register"
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
            size: "lg",
          })}
        >
          無料で始める
        </Link>
        <Link
          href="/login"
          className={buttonStyles({
            variant: "bordered",
            radius: "full",
            size: "lg",
          })}
        >
          ログイン
        </Link>
      </div>

      <div className="mt-12 max-w-4xl">
        <h2 className={title({ size: "md", class: "mb-4" })}>主な機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 border border-default-200 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">簡単検索</h3>
            <p className="text-default-600">
              キーワードや業種、地域から最適な補助金・助成金を素早く見つけられます。
            </p>
          </div>
          <div className="p-6 border border-default-200 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">AI書類作成支援</h3>
            <p className="text-default-600">
              企業情報を入力するだけで、AIが申請書類のドラフトを自動生成します。
            </p>
          </div>
          <div className="p-6 border border-default-200 rounded-xl">
            <h3 className="text-xl font-semibold mb-2">進捗管理</h3>
            <p className="text-default-600">
              申請状況や期限を一覧で管理。見逃しを防ぎ、スムーズな申請をサポートします。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}