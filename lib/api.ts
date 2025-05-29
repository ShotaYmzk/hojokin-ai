// lib/api.ts (例)
import axios from 'axios';

type LoginCredentials = {
  email: string;
  password: string;
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api', // 環境変数からAPIのベースURLを取得
  headers: {
    'Content-Type': 'application/json',
  },
});

// トークンなどをヘッダーに付与する場合のインターセプター設定 (例)
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken'); // 仮。実際にはよりセキュアな方法で管理
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // エラーハンドリング (後述)
    throw error;
  }
};

// 他のAPI関数 (getProfile, getSubsidies, etc.)