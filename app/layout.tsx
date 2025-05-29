// File: /app/layout.tsx
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
// import { Link } from "@heroui/link"; // フッターで使用していたが、シンプルにするため削除も検討
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { MainNav } from "@/components/common/MainNav"; // ★変更: Navbar -> MainNav, パスも変更

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico", // public/favicon.ico に配置
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="ja">
      {" "}
      {/* lang="en" -> "ja" に変更 */}
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <MainNav /> {/* ★変更: Navbar -> MainNav */}
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <p className="text-sm text-default-600">
                © {new Date().getFullYear()} {siteConfig.name}. All rights
                reserved.
              </p>
              {/* <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://heroui.com?utm_source=next-app-template" // 必要に応じて変更・削除
                title="heroui.com homepage"
              >
                <span className="text-default-600">Powered by</span>
                <p className="text-primary">HeroUI</p>
              </Link> */}
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
