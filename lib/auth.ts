// lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {
            // Server-side middleware doesn't set cookies
          },
          remove() {
            // Server-side middleware doesn't remove cookies
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function withAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

// JWT トークンから認証情報を抽出するヘルパー関数
export function getAuthFromHeaders(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}