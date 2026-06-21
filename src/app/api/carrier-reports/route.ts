import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/client";
import { sendAlert } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const { carrierId, airlineId, fitStatus, notes, email } = await req.json();

    if (!carrierId || !fitStatus) {
      return NextResponse.json({ error: "carrierId and fitStatus are required" }, { status: 400 });
    }

    if (!["fits", "tight", "does_not_fit"].includes(fitStatus)) {
      return NextResponse.json({ error: "fitStatus must be 'fits', 'tight', or 'does_not_fit'" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { error } = await supabase.from("carrier_reports").insert({
      carrier_id: carrierId,
      airline_id: airlineId || null,
      fit_status: fitStatus,
      notes: notes || null,
      submitted_by_email: email || null,
    });

    if (error) {
      console.error("carrier_reports insert error:", error);
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
    }

    await sendAlert("New carrier report submitted", { carrierId, fitStatus });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}