import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名を結合・マージするためのユーティリティ関数。
 * 条件に応じてクラスを動的に切り替える際に便利です。
 * @param inputs 結合したいクラス名のリスト
 * @returns マージされた単一のクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
