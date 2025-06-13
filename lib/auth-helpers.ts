// lib/auth-helpers.ts
export interface User {
    id: string;
    name: string;
    email: string;
  }
  
  export const authHelpers = {
    // ログイン状態をチェック
    isLoggedIn: (): boolean => {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem('isLoggedIn') === 'true';
    },
  
    // 認証トークンを取得
    getToken: (): string | null => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('authToken');
    },
  
    // ユーザー情報を取得
    getUser: (): User | null => {
      if (typeof window === 'undefined') return null;
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    },
  
    // ログイン情報を保存
    setAuthData: (token: string, user: User): void => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
  
    // ログアウト
    logout: (): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },
  
    // 認証ヘッダーを取得
    getAuthHeaders: (): Record<string, string> => {
      const token = authHelpers.getToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    },
  
    // API呼び出し時の認証エラーハンドリング
    handleAuthError: (error: any, redirectToLogin: boolean = true): void => {
      if (error.status === 401 || error.message?.includes('認証')) {
        authHelpers.logout();
        if (redirectToLogin && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    },
  };