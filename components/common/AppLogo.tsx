// File: /components/common/AppLogo.tsx
import * as React from "react";
import { IconSvgProps } from "@/types"; // 型定義をインポート

export const AppLogo: React.FC<IconSvgProps> = ({
  size = 36, // デフォルトサイズを設定
  width,
  height,
  className, // className を受け取れるようにする
  ...props
}) => (
  <svg
    fill="none"
    height={size || height}
    viewBox="0 0 32 32" // このViewBoxは既存のLogoに依存します
    width={size || width}
    className={className} // classNameを適用
    {...props}
  >
    {/* 既存のLogoコンポーネントのpathデータをここに記述 */}
    {/* 例として既存のものをコピーしますが、独自のロゴSVGに差し替えてください */}
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor" // 現在のテキストカラーを使用
      fillRule="evenodd"
    />
  </svg>
);