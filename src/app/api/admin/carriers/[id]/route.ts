import { NextResponse } from "next/server";
import { carrierUpdateSchema } from "@/lib/validation/schemas";
import { getRepository } from "@/lib/data/repository";

export const runtime = "nodejs";

// When ADMIN_TOKEN is set, admin writes require a matching x-admin-token header.
// When unset (local dev), writes are allowed. Set it in any shared/prod deploy.
function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return true;
  return req.headers.get("x-admin-token") === expected;
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = carrierUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const updated = await getRepository().updateCarrier(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Carrier not found" }, { status: 404 });
    }
    return NextResponse.json({ carrier: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
