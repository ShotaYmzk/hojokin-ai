// File: ./lib/api.ts
import axios from "axios";
export * from "./clients/jgrants"

interface LoginCredentials {
  email?: string; // 仮の型、実際には適切な型定義を
  password?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// トークンなどをヘッダーに付与する場合のインターセプター設定 (例)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // 仮。実際にはよりセキュアな方法で管理

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const loginUser = async (credentials: LoginCredentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);

    return response.data;
  } catch (error) {
    // エラーハンドリング
    throw error;
  }
};

export async function searchSubsidies(params: any) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/subsidies?${query}`);
  if (!res.ok) throw new Error('検索失敗');
  return await res.json();
}
// 他のAPI関数 (getProfile, getSubsidies, etc.)
// 例:
// export const getCompanyProfile = async () => {
//   try {
//     const response = await apiClient.get("/company/profile");
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// export const searchSubsidies = async (params: any) => { // paramsの型は適切に定義
//   try {
//     const response = await apiClient.get("/subsidies", { params });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
