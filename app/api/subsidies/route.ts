// app/api/subsidies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import qs from 'qs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const params: Record<string, any> = {}
  searchParams.forEach((v, k) => { params[k] = v })
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const offset = (page - 1) * limit
  const { page: _, ...rest } = params
  const jgParams = { ...rest, offset, limit }

  const query = qs.stringify(jgParams, { encode: false })
  const apiUrl = `https://api.jgrants-portal.go.jp/exp/v1/public/subsidies?${query}`

  const apiRes = await fetch(apiUrl)
  const data = await apiRes.json()
  return NextResponse.json(data)
}