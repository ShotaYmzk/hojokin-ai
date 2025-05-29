// File: /components/common/MainNav.tsx
"use client"; // ナビゲーションの状態管理やフック使用のため

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation"; // 現在のパスを取得

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/common/ThemeSwitch"; // パス修正
import { AppLogo } from "@/components/common/AppLogo"; // ロゴコンポーネントを作成した場合
// import { GithubIcon, ... } from "@/components/icons"; // 必要に応じて

// 仮の認証状態フック (実際にはAuthContextやライブラリから取得)
const useAuth = () => ({ isAuthenticated: true, user: { name: "田中太郎" } }); // ここを実際の認証ロジックに置き換える

export const MainNav = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth(); // 認証状態を取得

  // 表示するナビゲーションアイテムを決定
  // ここでは簡略化のため、認証済みなら navItems, 未認証なら authNavItems を使う例
  // 実際には (auth) レイアウトと (app) レイアウトで異なるナビゲーションを描画する方が良い場合もある
  const currentNavItems = isAuthenticated ? siteConfig.navItems : []; // (app) レイアウトで mainNavItems を使用
  const currentMenuNavItems = isAuthenticated ? siteConfig.navMenuItems : siteConfig.authNavItems;


  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href={isAuthenticated ? "/dashboard" : "/"}>
            <AppLogo /> {/* AppLogo コンポーネントを使用 */}
            <p className="font-bold text-inherit">{siteConfig.name.split(" ")[0]}</p> {/* "補助金・助成金アシスタントAI" から "補助金・助成金アシスタントAI" の部分だけなど */}
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {currentNavItems.map((item) => (
            <NavbarItem key={item.href} isActive={pathname === item.href}>
              <NextLink
                className={clsx(
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                  "hover:text-primary transition-colors"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          {/* 外部リンクは必要に応じて siteConfig から読み込む */}
          {/* <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link> */}
          <ThemeSwitch />
        </NavbarItem>
        {isAuthenticated && (
          <NavbarItem className="hidden md:flex">
            {/* ユーザー名やログアウトボタンなどをここに配置 */}
            {/* 例: <Button as={Link} href="/profile">プロフィール</Button> */}
            <Button
                as={NextLink}
                href="/logout" // ログアウト処理へのパス
                variant="ghost"
                color="danger"
              >
                ログアウト
              </Button>
          </NavbarItem>
        )}
        {!isAuthenticated && (
             <NavbarItem className="hidden md:flex gap-2">
                <Button as={NextLink} href="/login" variant="bordered" color="primary">
                    ログイン
                </Button>
                <Button as={NextLink} href="/register" color="primary" variant="flat">
                    新規登録
                </Button>
            </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        {/* <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link> */}
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {/* searchInput は補助金検索ページなどに配置するため、ここでは削除 */}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {currentMenuNavItems.map((item, index) => (
            <NavbarMenuItem key={`${item.href}-${index}`} isActive={pathname === item.href}>
              <Link
                color={
                  pathname === item.href
                    ? "primary"
                    : "foreground"
                }
                href={item.href}
                size="lg"
                as={NextLink} // NextLink を使用
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};