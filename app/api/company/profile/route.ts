// app/api/company/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET: 企業情報取得
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

          store.set({ name, value: "", ...options });
        },
      },
    },
  );

  try {
    // 認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // 企業情報取得
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (companyError) {
      if (companyError.code === "PGRST116") {
        // 企業情報が見つからない場合は空のオブジェクトを返す
        return NextResponse.json({
          companyName: "",
          industry: "",
          postalCode: "",
          prefecture: "",
          city: "",
          addressLine1: "",
          addressLine2: "",
          representativeName: "",
          phoneNumber: "",
          email: user.email || "",
          website: "",
          establishmentYear: "",
          employeeCountCategory: "",
          capitalAmount: "",
          annualSales: "",
          businessDescription: "",
          isSmallBusiness: true,
        });
      }

      console.error("Company fetch error:", companyError);

      return NextResponse.json(
        { error: "企業情報の取得に失敗しました" },
        { status: 500 },
      );
    }

    // レスポンス用にデータを変換（新しいスキーマに対応）
    const companyProfile = {
      companyName: company.name || "",
      industry: company.industry || "",
      postalCode: company.postal_code || "",
      prefecture: company.prefecture || "",
      city: company.city || "",
      addressLine1: company.address_line1 || "",
      addressLine2: company.address_line2 || "",
      representativeName: company.representative_name || "",
      phoneNumber: company.phone_number || "",
      email: company.email || user.email || "",
      website: company.website || "",
      establishmentYear: company.establishment_year || "",
      employeeCountCategory: company.employee_count_category || "",
      capitalAmount: company.capital_amount || "",
      annualSales: company.annual_sales || "",
      businessDescription: company.business_description || "",
      isSmallBusiness: company.is_small_business ?? true,
    };

    return NextResponse.json(companyProfile);
  } catch (error) {
    console.error("GET company profile error:", error);

    return NextResponse.json(
      { error: "企業情報の取得中にエラーが発生しました" },
      { status: 500 },
    );
  }
}

// PUT: 企業情報更新
export async function PUT(request: NextRequest) {
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

          store.set({ name, value: "", ...options });
        },
      },
    },
  );

  try {
    // 認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();

    // データベース用にフィールド名を変換（新しいスキーマに対応）
    const companyData = {
      user_id: user.id,
      name: body.companyName,
      industry: body.industry,
      postal_code: body.postalCode,
      prefecture: body.prefecture,
      city: body.city,
      address_line1: body.addressLine1,
      address_line2: body.addressLine2,
      representative_name: body.representativeName,
      phone_number: body.phoneNumber,
      email: body.email,
      website: body.website,
      establishment_year: body.establishmentYear,
      employee_count_category: body.employeeCountCategory,
      capital_amount: body.capitalAmount,
      annual_sales: body.annualSales,
      business_description: body.businessDescription,
      is_small_business: body.isSmallBusiness,
    };

    // 既存の企業情報を確認
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let result;

    if (existingCompany) {
      // 更新
      const { data, error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("user_id", user.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // 新規作成
      const { data, error } = await supabase
        .from("companies")
        .insert([companyData])
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error("Company upsert error:", result.error);

      return NextResponse.json(
        { error: "企業情報の保存に失敗しました" },
        { status: 500 },
      );
    }

    // レスポンス用にデータを変換
    const company = result.data;
    const companyProfile = {
      companyName: company.name || "",
      industry: company.industry || "",
      postalCode: company.postal_code || "",
      prefecture: company.prefecture || "",
      city: company.city || "",
      addressLine1: company.address_line1 || "",
      addressLine2: company.address_line2 || "",
      representativeName: company.representative_name || "",
      phoneNumber: company.phone_number || "",
      email: company.email || "",
      website: company.website || "",
      establishmentYear: company.establishment_year || "",
      employeeCountCategory: company.employee_count_category || "",
      capitalAmount: company.capital_amount || "",
      annualSales: company.annual_sales || "",
      businessDescription: company.business_description || "",
      isSmallBusiness: company.is_small_business ?? true,
    };

    return NextResponse.json(companyProfile);
  } catch (error) {
    console.error("PUT company profile error:", error);

    return NextResponse.json(
      { error: "企業情報の更新中にエラーが発生しました" },
      { status: 500 },
    );
  }
}
