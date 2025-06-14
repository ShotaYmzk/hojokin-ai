// File: /components/common/MainNav.tsx
"use client";

import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/common/AppLogo";
import { type NavItem } from "@/types";
import { cn } from "@/utils/cn";

interface MainNavProps {
  items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 md:gap-10">
      {/* ★修正点: AppLogoをLinkで囲むのをやめ、AppLogo自身がリンクとして機能するようにしました。 */}
      {/* レスポンシブ表示を維持するため、ラッパーとしてdivを使用します。 */}
      <div className="hidden items-center gap-2 md:flex">
        <AppLogo />
      </div>

      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  as={NextLink}
                  className={cn(
                    "flex items-center text-lg font-semibold text-muted-foreground sm:text-sm",
                    item.href.startsWith(`/${pathname.split("/")[1]}`) &&
                      "text-foreground",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                  href={item.href}
                >
                  {item.title}
                </Link>
              ),
          )}
        </nav>
      ) : null}
    </div>
  );
}
