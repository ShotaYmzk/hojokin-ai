// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET: 申請一覧取得
export async function GET(request: NextRequest) {
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
          store.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 申請一覧取得
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        id,
        subsidy_id,
        subsidy_name,
        status,
        submission_date,
        deadline,
        next_action,
        progress,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (applicationsError) {
      console.error('Applications fetch error:', applicationsError);
      return NextResponse.json(
        { error: '申請一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    // レスポンス用にデータを変換
    const formattedApplications = applications.map(app => ({
      id: app.id,
      subsidyName: app.subsidy_name,
      status: app.status,
      submissionDate: app.submission_date,
      deadline: app.deadline,
      nextAction: app.next_action,
      progress: app.progress || 0,
    }));

    return NextResponse.json(formattedApplications);

  } catch (error) {
    console.error('GET applications error:', error);
    return NextResponse.json(
      { error: '申請一覧の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// POST: 新規申請作成
export async function POST(request: NextRequest) {
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
          store.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 企業情報取得
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: '企業情報が見つかりません。先に企業情報を登録してください。' },
        { status: 400 }
      );
    }

    // リクエストボディを取得
    const body = await request.json();
    
    // 申請データを作成
    const applicationData = {
      user_id: user.id,
      company_id: company.id,
      subsidy_id: body.subsidyId,
      subsidy_name: body.subsidyName,
      status: body.status || '準備中',
      submission_date: body.submissionDate || null,
      deadline: body.deadline || null,
      next_action: body.nextAction || null,
      progress: body.progress || 0,
      form_data: body.formData || {},
    };

    // 申請を作成
    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (insertError) {
      console.error('Application insert error:', insertError);
      return NextResponse.json(
        { error: '申請の作成に失敗しました' },
        { status: 500 }
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

    return NextResponse.json(formattedApplication, { status: 201 });

  } catch (error) {
    console.error('POST applications error:', error);
    return NextResponse.json(
      { error: '申請の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

