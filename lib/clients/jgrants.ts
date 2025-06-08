// lib/clients/jgrants.ts
import qs from "qs";
import { paths } from "@/types/jgrants";   // 1で生成した型
import ky from "ky";                       // fetchラッパー。未導入なら fetch でも可

const baseURL = process.env.NEXT_PUBLIC_JGRANTS_BASE_URL!;

const api = ky.create({
  prefixUrl: baseURL,
  timeout: 10000,
});

type SubsidyListParams = paths["/subsidies"]["get"]["parameters"]["query"];
type SubsidyListRes = paths["/subsidies"]["get"]["responses"]["200"]["content"]["application/json"];
type SubsidyDetailRes = paths["/subsidies/id/{id}"]["get"]["responses"]["200"]["content"]["application/json"];


/** 補助金一覧取得（公式API仕様） */
export async function searchSubsidies(params: SubsidyListParams) {
  const query = qs.stringify(params, { encode: false });
  return api.get(`subsidies?${query}`).json<SubsidyListRes>();
}

/** 詳細取得 */
export async function getSubsidy(id: string) {
  return api.get(`subsidies/id/${id}`).json<SubsidyDetailRes>();
}
