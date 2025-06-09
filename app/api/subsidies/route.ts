// File: /app/api/subsidies/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const jgParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    if (key !== "page" && value) {
      jgParams.set(key, value);
    }
  });

  // JグランツAPIはkeywordが必須のため、フロントから送られてこない場合はダミーのキーワードを追加
  if (!jgParams.has("keyword") || !jgParams.get("keyword")) {
    // Jグランツサイトの挙動に近い、非常に広範なキーワードで代用
    jgParams.set("keyword", "補助金");
  }

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  jgParams.set("offset", String(offset));
  jgParams.set("limit", String(limit));

  const apiUrl = `https://api.jgrants-portal.go.jp/exp/v1/public/subsidies?${jgParams.toString()}`;

  try {
    const apiRes = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store", // キャッシュを無効化して常に最新の情報を取得
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 },
    );
  }
}
