import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { RegisterRequest } from '@/frontend/api-client/models/RegisterRequest';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // API全体の処理をtry...catchで囲み、予期せぬエラーを捕捉します
  try {
    // 処理の最初に、必要な環境変数がすべて存在するかをチェックします
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Error: Missing Supabase environment variables.");
      return NextResponse.json(
        { error: "サーバーの内部構成に問題があります。" },
        { status: 500 }
      );
    }

    // 環境変数のチェック後に管理者クライアントを初期化します
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    const body: RegisterRequest & { companyName?: string; companyAddress?: string } = await request.json();
    const { email, password, companyName, companyAddress } = body;

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'メールアドレス、パスワード、会社名は必須です' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          // ★修正点：各メソッドをasync関数に変更し、cookieStoreをawaitで解決します
          async get(name: string) {
            const store = await cookieStore;
            return store.get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            const store = await cookieStore;
            store.set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            const store = await cookieStore;
            store.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Supabase auth sign up error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'ユーザーの作成に失敗しました' },
        { status: authError?.status || 500 }
      );
    }

    const userId = authData.user.id;

    const { error: companyError } = await supabase
      .from('companies')
      .insert({ user_id: userId, name: companyName, address: companyAddress });

    if (companyError) {
      console.error('Supabase insert company profile error:', companyError);

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        console.error(`CRITICAL: Failed to clean up auth user ${userId}.`, deleteError);
      } else {
        console.log(`Cleaned up auth user due to company registration failure: ${userId}`);
      }

      return NextResponse.json(
        { error: companyError.message || '会社情報の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'ユーザー登録が完了しました。確認メールを確認してください。', userId: authData.user.id },
      { status: 201 }
    );

  } catch (error) {
    // 予期せぬエラーが発生した場合のログ出力
    console.error("An unexpected error occurred in /api/auth/register:", error);
    return NextResponse.json(
      { error: "予期せぬ内部サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}