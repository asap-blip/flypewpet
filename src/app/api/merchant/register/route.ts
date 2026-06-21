import { NextResponse } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getServiceSupabase } from "@/lib/supabase/client";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export async function POST(req: Request) {
  try {
    const { businessName, email, password, storeUrl } = await req.json();

    if (!businessName || !email || !password) {
      return NextResponse.json(
        { error: "Business name, email, and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("merchants")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "A merchant with this email already exists" }, { status: 409 });
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Generate API key
    const apiKey = `um_${randomBytes(32).toString("hex")}`;

    // Generate slug from business name
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);

    // Insert merchant
    const { data: merchant, error } = await supabase
      .from("merchants")
      .insert({
        id: slug,
        name: businessName,
        slug,
        email,
        password_hash: passwordHash,
        api_key: apiKey,
        website_url: storeUrl || null,
        subscription_status: "inactive",
        subscription_tier: "starter",
      })
      .select("id, name, email, api_key")
      .single();

    if (error) {
      console.error("Merchant insert error:", error);
      return NextResponse.json({ error: "Failed to create merchant account" }, { status: 500 });
    }

    return NextResponse.json({
      merchantId: merchant.id,
      merchantName: merchant.name,
      email: merchant.email,
      apiKey: merchant.api_key,
    });
  } catch (err) {
    console.error("Merchant registration error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}