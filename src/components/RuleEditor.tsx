"use client";

import { useState } from "react";
import type { Airline, AirlineRule, SourceType } from "@/lib/data/types";
import { FreshnessBadge } from "./SourceCitation";

const input =
  "w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const label = "block text-[11px] font-medium text-slate-500 mb-1";

const SOURCE_TYPES: SourceType[] = ["airline_official", "airline_pdf", "third_party", "community"];

type Editable = {
  maxLengthCm: string;
  maxWidthCm: string;
  maxHeightCm: string;
  maxCombinedWeightKg: string;
  softSidedRequirement: string;
  aircraftVaries: boolean;
  sourceUrl: string;
  sourceLabel: string;
  sourceType: string;
  lastVerifiedAt: string;
  notes: string;
};

function toEditable(r: AirlineRule): Editable {
  return {
    maxLengthCm: r.maxLengthCm?.toString() ?? "",
    maxWidthCm: r.maxWidthCm?.toString() ?? "",
    maxHeightCm: r.maxHeightCm?.toString() ?? "",
    maxCombinedWeightKg: r.maxCombinedWeightKg?.toString() ?? "",
    softSidedRequirement: r.softSidedRequirement ?? "",
    aircraftVaries: r.aircraftVaries,
    sourceUrl: r.sourceUrl ?? "",
    sourceLabel: r.sourceLabel ?? "",
    sourceType: r.sourceType ?? "",
    lastVerifiedAt: r.lastVerifiedAt ?? "",
    notes: r.notes ?? "",
  };
}

function num(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildPatch(e: Editable) {
  return {
    maxLengthCm: num(e.maxLengthCm),
    maxWidthCm: num(e.maxWidthCm),
    maxHeightCm: num(e.maxHeightCm),
    maxCombinedWeightKg: num(e.maxCombinedWeightKg),
    softSidedRequirement: e.softSidedRequirement === "" ? null : e.softSidedRequirement,
    aircraftVaries: e.aircraftVaries,
    sourceUrl: e.sourceUrl.trim() === "" ? null : e.sourceUrl.trim(),
    sourceLabel: e.sourceLabel.trim() === "" ? null : e.sourceLabel.trim(),
    sourceType: e.sourceType === "" ? null : e.sourceType,
    lastVerifiedAt: e.lastVerifiedAt.trim() === "" ? null : e.lastVerifiedAt.trim(),
    notes: e.notes.trim() === "" ? null : e.notes.trim(),
  };
}

function RuleRow({ rule, airlineName, token }: { rule: AirlineRule; airlineName: string; token: string }) {
  const [form, setForm] = useState<Editable>(() => toEditable(rule));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function set<K extends keyof Editable>(key: K, value: Editable[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/rules/${rule.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-admin-token": token } : {}),
        },
        body: JSON.stringify(buildPatch(form)),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Save failed");
        return;
      }
      setStatus("saved");
      setMessage("Saved");
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium text-slate-800">
          {airlineName} <span className="text-slate-400">· {rule.cabin}</span>
          <span className="ml-2 font-mono text-[11px] text-slate-400">{rule.id}</span>
        </div>
        <FreshnessBadge lastVerifiedAt={form.lastVerifiedAt || null} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={label}>Max length (cm)</label>
          <input className={input} value={form.maxLengthCm} onChange={(e) => set("maxLengthCm", e.target.value)} />
        </div>
        <div>
          <label className={label}>Max width (cm)</label>
          <input className={input} value={form.maxWidthCm} onChange={(e) => set("maxWidthCm", e.target.value)} />
        </div>
        <div>
          <label className={label}>Max height (cm)</label>
          <input className={input} value={form.maxHeightCm} onChange={(e) => set("maxHeightCm", e.target.value)} />
        </div>
        <div>
          <label className={label}>Max weight (kg)</label>
          <input className={input} value={form.maxCombinedWeightKg} onChange={(e) => set("maxCombinedWeightKg", e.target.value)} />
        </div>
        <div>
          <label className={label}>Soft-sided</label>
          <select className={input} value={form.softSidedRequirement} onChange={(e) => set("softSidedRequirement", e.target.value)}>
            <option value="">Either allowed</option>
            <option value="recommended">Recommended</option>
            <option value="required">Required</option>
          </select>
        </div>
        <div>
          <label className={label}>Source type</label>
          <select className={input} value={form.sourceType} onChange={(e) => set("sourceType", e.target.value)}>
            <option value="">—</option>
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Last verified (YYYY-MM-DD)</label>
          <div className="flex gap-1">
            <input className={input} value={form.lastVerifiedAt} onChange={(e) => set("lastVerifiedAt", e.target.value)} placeholder="2026-05-25" />
            <button
              type="button"
              onClick={() => set("lastVerifiedAt", new Date().toISOString().slice(0, 10))}
              className="shrink-0 rounded-lg border border-slate-300 px-2 text-xs hover:bg-slate-50"
              title="Set to today"
            >
              Today
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 self-end pb-1.5 text-sm text-slate-600">
          <input type="checkbox" checked={form.aircraftVaries} onChange={(e) => set("aircraftVaries", e.target.checked)} />
          Aircraft varies
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>Source label</label>
          <input className={input} value={form.sourceLabel} onChange={(e) => set("sourceLabel", e.target.value)} />
        </div>
        <div>
          <label className={label}>Source URL</label>
          <input className={input} value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
        </div>
      </div>
      <div className="mt-3">
        <label className={label}>Notes</label>
        <input className={input} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {message && (
          <span className={`text-xs ${status === "error" ? "text-rose-600" : "text-emerald-600"}`}>{message}</span>
        )}
      </div>
    </div>
  );
}

export function RuleEditor({ rules, airlines }: { rules: AirlineRule[]; airlines: Airline[] }) {
  const [token, setToken] = useState("");
  const nameOf = (id: string) => airlines.find((a) => a.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
        <label className={label}>Admin token (only required if ADMIN_TOKEN is set on the server)</label>
        <input
          className={`${input} max-w-sm`}
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="leave blank in local dev"
        />
        <p className="mt-1 text-xs text-slate-400">
          Edits persist to Supabase when configured; otherwise they apply to the in-memory seed for
          this server session only.
        </p>
      </div>
      <div className="space-y-3">
        {rules
          .slice()
          .sort((a, b) => nameOf(a.airlineId).localeCompare(nameOf(b.airlineId)))
          .map((r) => (
            <RuleRow key={r.id} rule={r} airlineName={nameOf(r.airlineId)} token={token} />
          ))}
      </div>
    </div>
  );
}
