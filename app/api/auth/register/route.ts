import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// auth-helpers-nextjsの代わりに@supabase/ssrからインポートします
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// openapi-generatorで生成された型定義をインポートします。
// パスは実際のプロジェクト構造に合わせて確認・調整してください。
import type { RegisterRequest } from '@/frontend/api-client/models/RegisterRequest';

// Supabaseの管理者権限クライアントを作成します。
// このクライアントは、会社情報登録失敗時にユーザーを削除するクリーンアップ処理で使用します。
// 安全なサーバーサイドでのみ使用してください。
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // サービスロールキーを環境変数から読み込み
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);


// POST /api/auth/register
export async function POST(request: Request) {
  // RegisterRequest型に、不足しているプロパティを交差型(&)で追加します。
  const body: RegisterRequest & { companyName?: string; companyAddress?: string } = await request.json();
  const { email, password, companyName, companyAddress } = body;

  // 必須項目のバリデーション
  if (!email || !password || !companyName) {
    return NextResponse.json(
      { error: 'メールアドレス、パスワード、会社名は必須です' },
      { status: 400 }
    );
  }

  const cookieStore = cookies();

  // 【修正点】エラーメッセージに基づき、cookieStoreをPromiseとして扱い、
  //           各cookieメソッドをasyncにしてawaitを追加します。
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
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

  // 1. Supabase Authenticationでユーザーを作成 (サインアップ)
  // デフォルトでは、ユーザーは確認メールのリンクをクリックするまでステータスが確定しません。
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  // サインアップ処理でエラーが発生した場合
  if (authError || !authData.user) {
    console.error('Supabase auth sign up error:', authError);
    return NextResponse.json(
      { error: authError?.message || 'ユーザーの作成に失敗しました' },
      { status: authError?.status || 500 }
    );
  }

  const userId = authData.user.id;

  // 2. 作成したユーザーのIDに紐づけて`companies`テーブルに会社情報を保存
  const { error: companyError } = await supabase
    .from('companies')
    .insert({
      user_id: userId,
      name: companyName,
      address: companyAddress, // companyAddressは任意
    });

  // 会社情報の保存でエラーが発生した場合
  if (companyError) {
    console.error('Supabase insert company profile error:', companyError);

    // ★クリーンアップ処理：作成済みの認証ユーザーを削除する
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
        // クリーンアップ自体に失敗した場合は、重大なエラーとしてログに残す
        console.error(`CRITICAL: Failed to clean up auth user ${userId}.`, deleteError);
    } else {
        console.log(`Cleaned up auth user due to company registration failure: ${userId}`);
    }

    return NextResponse.json(
      { error: companyError.message || '会社情報の保存に失敗しました' },
      { status: 500 }
    );
  }

  // すべて成功した場合
  return NextResponse.json(
    {
      message: 'ユーザー登録が完了しました。確認メールを確認してください。',
      userId: authData.user.id,
    },
    { status: 201 }
  );
}