import { getSupabase } from "@/lib/supabase/client";

export interface MerchantRecord {
  id: string;
  name: string;
  email: string;
  slug: string;
  api_key: string | null;
  subscription_status: string;
  subscription_tier: string;
}

export async function validateApiKey(request: Request): Promise<MerchantRecord> {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey) {
    throw new AuthError("Missing X-API-Key header", 401);
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new AuthError("Database not configured", 503);
  }

  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("api_key", apiKey)
    .single();

  if (error || !data) {
    throw new AuthError("Invalid API key", 401);
  }

  return data as MerchantRecord;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}