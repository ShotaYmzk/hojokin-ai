// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Supabaseの管理者権限クライアントを作成
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
    console.log('Registration request body:', body);
    
    const { email, password, companyName, companyAddress, representativeName } = body;

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

    // Supabaseクライアントを作成（通常のクライアント）
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

    console.log('Creating user with Supabase Auth...');

    // 1. Supabase Authenticationでユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: representativeName || companyName || 'ユーザー',
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
      console.error('No user returned from Supabase auth');
      return NextResponse.json(
        { error: 'ユーザーの作成に失敗しました' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    console.log('User created successfully with ID:', userId);

    // 2. 会社情報がある場合は companies テーブルに保存
    if (companyName) {
      console.log('Saving company information...');
      
      // 新しいスキーマに合わせたデータ構造
      const companyData = {
        user_id: userId,
        name: companyName,
        representative_name: representativeName || null,
        address_line1: companyAddress || null,
        email: email, // ユーザーのメールアドレスを初期値として設定
      };
      
      console.log('Company data to insert:', companyData);
      
      // サービスロールキーを使用してcompaniesテーブルに挿入（RLSを回避）
      const { data: companyResult, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (companyError) {
        console.error('Company insert error details:', {
          message: companyError.message,
          details: companyError.details,
          hint: companyError.hint,
          code: companyError.code
        });

        // クリーンアップ: 作成済みの認証ユーザーを削除
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId);
          console.log(`Cleaned up auth user due to company registration failure: ${userId}`);
        } catch (deleteError) {
          console.error(`CRITICAL: Failed to clean up auth user ${userId}:`, deleteError);
        }

        // より詳細なエラーメッセージを返す
        let errorMessage = '会社情報の保存に失敗しました';
        if (companyError.code === '23505') {
          errorMessage = 'この会社情報は既に登録されています';
        } else if (companyError.code === '23503') {
          errorMessage = 'ユーザー情報の関連付けに失敗しました';
        } else if (companyError.message.includes('permission')) {
          errorMessage = 'データベースへのアクセス権限がありません';
        }

        return NextResponse.json(
          { 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? companyError.message : undefined
          },
          { status: 500 }
        );
      }

      console.log('Company information saved successfully:', companyResult);
    }

    // 成功レスポンス
    return NextResponse.json(
      {
        message: 'ユーザー登録が完了しました',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: representativeName || companyName || 'ユーザー',
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
      { 
        error: '登録処理中にエラーが発生しました',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}