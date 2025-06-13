// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Supabaseの管理者権限クライアントを作成
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
  try {
    const body = await request.json();
    console.log('Registration request body:', body); // デバッグ用ログ
    
    const { email, password, companyName, companyAddress } = body;

    // 必須項目のバリデーション
    if (!email || !password) {
      console.error('Missing required fields:', { email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // パスワードの長さチェック
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();

    // Supabaseクライアントを作成
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

    // 1. Supabase Authenticationでユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: companyName || 'ユーザー', // ユーザーメタデータに名前を保存
        }
      }
    });

    if (authError) {
      console.error('Supabase auth sign up error:', authError);
      
      // よくあるエラーの処理
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message || 'ユーザーの作成に失敗しました' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'ユーザーの作成に失敗しました' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 2. 会社情報がある場合は companies テーブルに保存
    if (companyName) {
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: userId,
          name: companyName,
          address: companyAddress || null,
          email: email, // ユーザーのメールアドレスを初期値として設定
        });

      if (companyError) {
        console.error('Company insert error:', companyError);

        // クリーンアップ: 作成済みの認証ユーザーを削除
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log(`Cleaned up auth user due to company registration failure: ${userId}`);
        } catch (deleteError) {
          console.error(`CRITICAL: Failed to clean up auth user ${userId}:`, deleteError);
        }

        return NextResponse.json(
          { error: '会社情報の保存に失敗しました' },
          { status: 500 }
        );
      }
    }

    // 成功レスポンス
    return NextResponse.json(
      {
        message: 'ユーザー登録が完了しました',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: companyName || 'ユーザー',
        },
        // 確認メールが必要な場合の情報
        emailConfirmationRequired: !authData.user.email_confirmed_at
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // JSON パースエラーの場合
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: '無効なリクエスト形式です' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '登録処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}