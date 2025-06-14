// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET: 申請詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStore;

          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          const store = await cookieStore;

          store.set({ name, value, ...options });
        },
        async remove(name: string, options: any) {
          const store = await cookieStore;

          store.set({ name, value: "", ...options });
        },
      },
    },
  );

  try {
    // 認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 申請詳細取得
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select(
        `
          id,
          subsidy_id,
          subsidy_name,
          status,
          submission_date,
          deadline,
          next_action,
          progress,
          form_data,
          created_at,
          updated_at
        `,
      )
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (applicationError) {
      if (applicationError.code === "PGRST116") {
        return NextResponse.json(
          { error: "申請が見つかりません" },
          { status: 404 },
        );
      }

      console.error("Application fetch error:", applicationError);

      return NextResponse.json(
        { error: "申請の取得に失敗しました" },
        { status: 500 },
      );
    }

    // レスポンス用にデータを変換
    const formattedApplication = {
      id: application.id,
      subsidyName: application.subsidy_name,
      status: application.status,
      submissionDate: application.submission_date,
      deadline: application.deadline,
      nextAction: application.next_action,
      progress: application.progress || 0,
      formData: application.form_data || {},
    };

    return NextResponse.json(formattedApplication);
  } catch (error) {
    console.error("GET application detail error:", error);

    return NextResponse.json(
      { error: "申請詳細の取得中にエラーが発生しました" },
      { status: 500 },
    );
  }
}

// PUT: 申請更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStore;

          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          const store = await cookieStore;

          store.set({ name, value, ...options });
        },
        async remove(name: string, options: any) {
          const store = await cookieStore;

          store.set({ name, value: "", ...options });
        },
      },
    },
  );

  try {
    // 認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();

    // 更新データを準備（新しいスキーマに対応）
    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.nextAction !== undefined) updateData.next_action = body.nextAction;
    if (body.formData !== undefined) updateData.form_data = body.formData;
    if (body.submissionDate !== undefined)
      updateData.submission_date = body.submissionDate;

    // 申請を更新
    const { data: application, error: updateError } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Application update error:", updateError);

      return NextResponse.json(
        { error: "申請の更新に失敗しました" },
        { status: 500 },
      );
    }

    // レスポンス用にデータを変換
    const formattedApplication = {
      id: application.id,
      subsidyName: application.subsidy_name,
      status: application.status,
      submissionDate: application.submission_date,
      deadline: application.deadline,
      nextAction: application.next_action,
      progress: application.progress || 0,
    };

    return NextResponse.json(formattedApplication);
  } catch (error) {
    console.error("PUT application error:", error);

    return NextResponse.json(
      { error: "申請の更新中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
