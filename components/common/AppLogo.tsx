// File: /components/common/AppLogo.tsx
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { Link } from "@nextui-org/react";
import { type HTMLNextUIProps } from "@nextui-org/react";
import NextLink from "next/link";

interface AppLogoProps extends HTMLNextUIProps<"svg"> {
  size?: number;
}

export const AppLogo = ({ className, size = 36 }: AppLogoProps) => (
  <Link
    as={NextLink}
    className="flex items-center gap-2"
    href={routes.top}
    isBlock
    color="foreground"
  >
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
    >
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
    {/* ★修正点：<p>タグを<span>タグに変更しました */}
    <span className="font-bold text-inherit">{siteConfig.name}</span>
  </Link>
);