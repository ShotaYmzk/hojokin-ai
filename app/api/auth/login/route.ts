// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // バリデーション
  if (!email || !password) {
    return NextResponse.json(
      { error: 'メールアドレスとパスワードが必要です' },
      { status: 400 }
    );
  }

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

  try {
    // Supabaseでログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Supabase auth login error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'ログインに失敗しました' },
        { status: 401 }
      );
    }

    // ユーザー情報を取得
    const { data: profile } = await supabase
      .from('companies')
      .select('name')
      .eq('user_id', authData.user.id)
      .single();

    // レスポンス
    return NextResponse.json({
      token: authData.session?.access_token,
      user: {
        id: authData.user.id,
        name: profile?.name || authData.user.user_metadata?.name || 'ユーザー',
        email: authData.user.email,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}