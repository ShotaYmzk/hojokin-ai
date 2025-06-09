// File: /lib/api.ts
import { paths } from "@/types/jgrants";

type SearchParams = paths["/subsidies"]["get"]["parameters"]["query"] & {
  page?: number;
  limit?: number;
};
type JGrantsListResponse =
  paths["/subsidies"]["get"]["responses"]["200"]["content"]["application/json"];

export async function searchSubsidies(
  params: SearchParams,
): Promise<JGrantsListResponse> {
  // オブジェクトから空の値やnull/undefinedの値をフィルタリング
  const cleanParams: Record<string, string> = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key as keyof SearchParams];

      if (value !== null && value !== undefined && value !== "") {
        cleanParams[key] = String(value);
      }
    }
  }

  const query = new URLSearchParams(cleanParams).toString();

  const response = await fetch(`/api/subsidies?${query}`);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: `An error occurred: ${response.statusText}` }));

    throw new Error(
      errorData.message ||
        `APIリクエストに失敗しました (ステータス: ${response.status})`,
    );
  }

  return response.json();
}
