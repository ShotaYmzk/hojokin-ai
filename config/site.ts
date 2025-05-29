// File: /config/site.ts
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "補助金・助成金アシスタントAI", // アプリケーション名に変更
  description: "AIが最適な補助金・助成金を推薦し、申請書類作成を支援します。", // アプリケーションの説明に変更
  navItems: [ // 認証後ユーザー向けのナビゲーション項目（主に (app)/layout.tsx で使用）
    {
      label: "ダッシュボード",
      href: "/dashboard",
    },
    {
      label: "企業情報",
      href: "/company",
    },
    {
      label: "補助金検索",
      href: "/subsidies/search",
    },
    // { // 必要に応じて書類作成ページへのリンクも
    //   label: "書類作成",
    //   href: "/documents/generate",
    // },
  ],
  navMenuItems: [ // スマホ表示時のハンバーガーメニュー項目 (認証後)
    { label: "ダッシュボード", href: "/dashboard" },
    { label: "企業情報", href: "/company" },
    { label: "補助金検索", href: "/subsidies/search" },
    // { label: "書類作成", href: "/documents/generate" },
    { label: "設定", href: "/settings" }, // 例: 設定ページ
    { label: "ログアウト", href: "/logout" }, // ログアウト処理への導線
  ],
  authNavItems: [ // 認証前ユーザー向けのナビゲーション項目 (主に (auth)/layout.tsx やランディングページで使用)
    {
      label: "ログイン",
      href: "/login",
    },
    {
      label: "新規登録",
      href: "/register",
    },
  ],
  links: { // 外部リンクは必要に応じて更新
    github: "", // プロジェクトのGitHubリポジトリがあれば
    // twitter: "",
    // discord: "",
    // sponsor: "",
  },
};