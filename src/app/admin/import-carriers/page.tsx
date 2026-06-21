"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Papa from "papaparse";

// ─── Types ────────────────────────────────────────────────────────────────

interface CarrierRow {
  brand: string;
  model: string;
  sku: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  weightKg: string;
  maxPetWeightKg: string;
  softSided: string;
  affiliateUrl: string;
  affiliateNetwork: string;
  imageUrl: string;
}

type Tab = "bulk" | "single";

interface ImportResult {
  imported: number;
  inserted: string[];
  errors?: string[];
  total: number;
  note?: string;
}

// ─── Columns shown in CSV preview ─────────────────────────────────────────

const CSV_COLUMNS: { key: keyof CarrierRow; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "sku", label: "SKU" },
  { key: "lengthCm", label: "Length (cm)" },
  { key: "widthCm", label: "Width (cm)" },
  { key: "heightCm", label: "Height (cm)" },
  { key: "weightKg", label: "Weight (kg)" },
  { key: "maxPetWeightKg", label: "Max pet (kg)" },
  { key: "softSided", label: "Soft-sided" },
  { key: "affiliateUrl", label: "Affiliate URL" },
  { key: "affiliateNetwork", label: "Network" },
  { key: "imageUrl", label: "Image URL" },
];

// ─── Tab button ──────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-100 text-brand-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Bulk Import Tab ─────────────────────────────────────────────────────

function BulkImportTab({ token }: { token: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<CarrierRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        if (results.errors.length > 0) {
          setError(`CSV parse error: ${results.errors[0].message}`);
          return;
        }
        const rows: CarrierRow[] = results.data.map((r) => ({
          brand: (r.brand ?? "").trim(),
          model: (r.model ?? "").trim(),
          sku: (r.sku ?? "").trim(),
          lengthCm: (r.length_cm ?? r.lengthCm ?? "").trim(),
          widthCm: (r.width_cm ?? r.widthCm ?? "").trim(),
          heightCm: (r.height_cm ?? r.heightCm ?? "").trim(),
          weightKg: (r.weight_kg ?? r.weightKg ?? "").trim(),
          maxPetWeightKg: (r.max_pet_weight_kg ?? r.maxPetWeightKg ?? "").trim(),
          softSided: (r.soft_sided ?? r.softSided ?? "").trim(),
          affiliateUrl: (r.affiliate_url ?? r.affiliateUrl ?? "").trim(),
          affiliateNetwork: (r.affiliate_network ?? r.affiliateNetwork ?? "").trim(),
          imageUrl: (r.image_url ?? r.imageUrl ?? "").trim(),
        }));
        setParsedRows(rows);
      },
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (parsedRows.length === 0) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import-carriers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ carriers: parsedRows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        if (data.details) setError(`${data.error}: ${data.details.join("; ")}`);
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }, [parsedRows, token]);

  const preview = parsedRows.slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          CSV file
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
        />
        <p className="mt-1 text-xs text-slate-400">
          Expected columns: {CSV_COLUMNS.map((c) => c.label).join(", ")}
        </p>
      </div>

      {fileName && parsedRows.length > 0 && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Preview ({parsedRows.length} rows parsed)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase text-slate-400">
                    {CSV_COLUMNS.map((col) => (
                      <th key={col.key} className="px-2 py-1.5 whitespace-nowrap">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      {CSV_COLUMNS.map((col) => (
                        <td key={col.key} className="px-2 py-1.5 text-slate-600 whitespace-nowrap max-w-[120px] truncate">
                          {row[col.key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 5 && (
              <p className="mt-2 text-xs text-slate-400">
                … and {parsedRows.length - 5} more rows
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="primary-cta px-5 py-2.5 text-sm disabled:opacity-50"
          >
            {submitting ? "Importing…" : `Import ${parsedRows.length} carrier${parsedRows.length === 1 ? "" : "s"}`}
          </button>
        </>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {result && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${
          (result.errors?.length ?? 0) > 0
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}>
          <p className="font-medium">
            Imported {result.imported} of {result.total} carriers
          </p>
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-rose-600">
              {result.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          {result.note && <p className="mt-1 text-xs opacity-70">{result.note}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Single Carrier Tab ──────────────────────────────────────────────────

const NETWORKS = [
  { value: "", label: "— Select —" },
  { value: "amazon", label: "Amazon" },
  { value: "chewy", label: "Chewy" },
  { value: "other", label: "Other" },
];

function SingleCarrierTab({ token }: { token: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    const form = new FormData(e.currentTarget);
    const carrier: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      if (value instanceof File) continue;
      carrier[key] = value;
    }

    try {
      const res = await fetch("/api/admin/import-carriers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(carrier),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        if (data.details) setError(`${data.error}: ${data.details.join("; ")}`);
      } else {
        setResult(data);
        if (data.imported > 0) {
          (e.target as HTMLFormElement).reset();
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/** brand */}
        <div>
          <label className={labelCls}>Brand *</label>
          <input name="brand" required className={inputCls} placeholder="e.g. Sherpa" />
        </div>
        {/** model */}
        <div>
          <label className={labelCls}>Model *</label>
          <input name="model" required className={inputCls} placeholder="e.g. Deluxe" />
        </div>
        {/** sku */}
        <div>
          <label className={labelCls}>SKU *</label>
          <input name="sku" required className={inputCls} placeholder="e.g. SH-DLX-001" />
        </div>
        {/** soft_sided */}
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input name="softSided" type="checkbox" value="true" defaultChecked className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
            Soft-sided
          </label>
        </div>
        {/** length_cm */}
        <div>
          <label className={labelCls}>Length (cm) *</label>
          <input name="lengthCm" type="number" step="0.1" min="0.1" required className={inputCls} />
        </div>
        {/** width_cm */}
        <div>
          <label className={labelCls}>Width (cm) *</label>
          <input name="widthCm" type="number" step="0.1" min="0.1" required className={inputCls} />
        </div>
        {/** height_cm */}
        <div>
          <label className={labelCls}>Height (cm) *</label>
          <input name="heightCm" type="number" step="0.1" min="0.1" required className={inputCls} />
        </div>
        {/** weight_kg */}
        <div>
          <label className={labelCls}>Weight (kg) *</label>
          <input name="weightKg" type="number" step="0.01" min="0.01" required className={inputCls} />
        </div>
        {/** max_pet_weight_kg */}
        <div>
          <label className={labelCls}>Max pet weight (kg)</label>
          <input name="maxPetWeightKg" type="number" step="0.1" min="0" className={inputCls} />
        </div>
        {/** affiliate_network */}
        <div>
          <label className={labelCls}>Affiliate network</label>
          <select name="affiliateNetwork" className={inputCls}>
            {NETWORKS.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </div>
        {/** affiliate_url */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Affiliate URL</label>
          <input name="affiliateUrl" type="url" className={inputCls} placeholder="https://amazon.com/…" />
        </div>
        {/** image_url */}
        <div className="sm:col-span-2">
          <label className={labelCls}>Image URL</label>
          <input name="imageUrl" type="url" className={inputCls} placeholder="https://images.example.com/…" />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="primary-cta px-5 py-2.5 text-sm disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add Carrier"}
      </button>

      {error && (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {result && result.imported > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <p className="font-medium">✅ Carrier imported ({result.inserted[0]})</p>
        </div>
      )}
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdminImportCarriersPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("bulk");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") || "";
    if (t) {
      setToken(t);
      verifyAndSet(t);
    } else {
      setLoading(false);
    }
  }, []);

  async function verifyAndSet(t: string) {
    setLoading(true);
    setAuthError(null);
    try {
      // Verify by calling a protected admin endpoint (pass a no-op to check auth)
      const res = await fetch("/api/admin/import-carriers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": t,
        },
        body: JSON.stringify({ carriers: [] }),
      });
      // A 200 means no ADMIN_TOKEN or it matched; 400 is fine (empty body)
      // 401 means token rejected
      if (res.status === 401) {
        setAuthError("Invalid admin token");
        setLoading(false);
        return;
      }
      setAuthenticated(true);
    } catch {
      setAuthError("Failed to verify admin token");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    verifyAndSet(token);
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
        <p className="text-sm text-slate-600">Enter the admin token to import carriers.</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            className="soft-input"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <button type="submit" className="primary-cta w-full px-4 py-2.5 text-sm">
            Login
          </button>
        </form>
        {loading && <p className="text-sm text-slate-400">Verifying…</p>}
        {authError && <p className="text-sm text-rose-600">{authError}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin · Import Carriers</h1>
          <p className="mt-1 text-sm text-slate-600">
            Add carriers individually or in bulk via CSV.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/admin" className="text-xs text-slate-400 hover:text-slate-600">Data</a>
          <span className="text-slate-300">·</span>
          <a href="/admin/reports" className="text-xs text-slate-400 hover:text-slate-600">Reports</a>
          <span className="text-slate-300">·</span>
          <a href="/admin/import-carriers?token=" className="text-xs text-slate-400 hover:text-slate-600">Logout</a>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <TabButton active={tab === "bulk"} onClick={() => setTab("bulk")}>
          📋 Bulk Import (CSV)
        </TabButton>
        <TabButton active={tab === "single"} onClick={() => setTab("single")}>
          ➕ Add Single Carrier
        </TabButton>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        {tab === "bulk" ? <BulkImportTab token={token} /> : <SingleCarrierTab token={token} />}
      </div>
    </div>
  );
}