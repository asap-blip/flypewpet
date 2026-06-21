"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MerchantDashboardPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const key = sessionStorage.getItem("merchant_signup_api_key");
    const name = sessionStorage.getItem("merchant_name");
    if (key) {
      setApiKey(key);
      setMerchantName(name);
      // Clear so it's only shown once
      sessionStorage.removeItem("merchant_signup_api_key");
      sessionStorage.removeItem("merchant_name");
    }
  }, []);

  function copyKey() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <span className="section-eyebrow">🏪 Merchant</span>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Welcome{merchantName ? `, ${merchantName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-600">Your Underseat partner dashboard.</p>
      </div>

      {apiKey && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
          <h2 className="text-sm font-bold text-emerald-900">🎉 Your API Key</h2>
          <p className="mt-1 text-xs text-emerald-800">
            Save this now. It will not be shown again.
          </p>
          <div className="mt-3 flex gap-2">
            <code className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-mono break-all border border-emerald-200">
              {apiKey}
            </code>
            <button
              type="button"
              onClick={copyKey}
              className="primary-cta shrink-0 px-4 py-2 text-sm"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="soft-panel p-6">
        <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="font-medium text-slate-800">Plan</div>
            <div className="mt-1">Starter (Beta) — Free</div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="font-medium text-slate-800">API Usage</div>
            <div className="mt-1">Coming soon — check back for usage stats.</div>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <div className="font-medium text-amber-800">🚧 Coming soon: product management</div>
            <div className="mt-1 text-xs text-amber-700">
              You&apos;ll be able to manage your products, view compatibility check logs, and generate
              embeddable widgets for your store.
            </div>
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold text-slate-800">Quick start</h3>
        <div className="mt-2 rounded-2xl bg-slate-50 p-4 font-mono text-xs text-slate-600">
          <div className="mb-2 font-sans font-medium text-slate-700">Check a carrier via API:</div>
          <pre className="whitespace-pre-wrap">
{`curl -X POST https://flypewpet.vercel.app/api/check \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{
    "carrierId": "sherpa-original-md",
    "legs": [{"airlineId": "air-canada", "cabin": "economy"}]
  }'`}
          </pre>
        </div>
      </div>
    </div>
  );
}