// One-time setup: ensure carrier_reports table exists with correct schema and RLS.
// Run with: npx tsx scripts/setup-carrier-reports.ts
// Requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!url) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set");
    process.exit(1);
  }
  if (!serviceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set");
    console.error("   Add it to your .env.local or export it:");
    console.error('   export SUPABASE_SERVICE_ROLE_KEY="your-key-here"');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const log: string[] = [];

  // 1. Check if carrier_reports exists
  const { data: tables, error: tableError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_schema", "public")
    .eq("table_name", "carrier_reports");

  if (tableError) {
    console.error("❌ Failed to check for carrier_reports table:", tableError.message);
    process.exit(1);
  }

  const exists = tables && tables.length > 0;

  if (exists) {
    log.push("✓ carrier_reports table already exists");
  } else {
    log.push("→ Creating carrier_reports table...");
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE public.carrier_reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          carrier_id TEXT NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
          airline_id TEXT REFERENCES public.airlines(id) ON DELETE SET NULL,
          fit_status TEXT NOT NULL CHECK (fit_status IN ('fits', 'tight', 'does_not_fit')),
          notes TEXT,
          submitted_by_email TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          submitted_at TIMESTAMPTZ DEFAULT now(),
          reviewed_at TIMESTAMPTZ,
          reviewed_by TEXT
        );
      `,
    });
    if (createError) {
      console.error("❌ Failed to create carrier_reports:", createError.message);
      process.exit(1);
    }
    log.push("  ✓ Table created");
  }

  // 2. Enable RLS
  const { error: rlsError } = await supabase.rpc("exec_sql", {
    sql: `ALTER TABLE public.carrier_reports ENABLE ROW LEVEL SECURITY;`,
  });
  if (rlsError) {
    log.push(`  ⚠ Could not enable RLS (may already be enabled): ${rlsError.message}`);
  } else {
    log.push("✓ RLS enabled");
  }

  // 3. Drop existing policies to avoid conflicts
  await supabase.rpc("exec_sql", {
    sql: `
      DROP POLICY IF EXISTS "Allow public inserts" ON public.carrier_reports;
      DROP POLICY IF EXISTS "Allow admin all" ON public.carrier_reports;
      DROP POLICY IF EXISTS "Anyone can insert reports" ON public.carrier_reports;
    `,
  });
  log.push("  → Dropped any existing policies");

  // 4. Create policies
  const { error: insertPolicyError } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE POLICY "Allow public inserts"
        ON public.carrier_reports
        FOR INSERT
        TO public
        WITH CHECK (true);
    `,
  });
  if (insertPolicyError) {
    log.push(`  ⚠ Could not create insert policy: ${insertPolicyError.message}`);
  } else {
    log.push("✓ Public insert policy created");
  }

  const { error: adminPolicyError } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE POLICY "Allow admin all"
        ON public.carrier_reports
        FOR ALL
        TO authenticated
        USING (true);
    `,
  });
  if (adminPolicyError) {
    log.push(`  ⚠ Could not create admin policy: ${adminPolicyError.message}`);
  } else {
    log.push("✓ Admin all-access policy created");
  }

  // 5. Summary
  console.log("\n─── Setup Summary ───");
  log.forEach((l) => console.log(l));
  console.log("\n✅ Done. The \"Help us verify\" form should now submit successfully.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});