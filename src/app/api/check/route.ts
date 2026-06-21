import { NextResponse } from "next/server";
import { checkInputSchema } from "@/lib/validation/schemas";
import { encodeCheck, runCheck } from "@/lib/check/service";
import { validateApiKey, AuthError } from "@/lib/auth/merchant-auth";

export const runtime = "nodejs";

// POST /api/check
// Body: CheckInput (see src/lib/validation/schemas.ts)
// Optionally accepts X-API-Key header for merchant-authenticated checks.
export async function POST(req: Request) {
  let merchantId: string | null = null;

  // Validate API key if provided
  const apiKey = req.headers.get("X-API-Key");
  if (apiKey) {
    try {
      const merchant = await validateApiKey(req);
      merchantId = merchant.id;
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const response = await runCheck(parsed.data, { persist: true, merchantId: merchantId ?? undefined });
    return NextResponse.json({
      ...response,
      shareToken: encodeCheck(parsed.data),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Check failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Underseat compatibility check",
    method: "POST",
    contract: "CheckInput -> CheckResponse",
  });
}
